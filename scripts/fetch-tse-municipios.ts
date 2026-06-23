import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError, toError } from './lib/errors.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import { parseSemicolonCsv } from './lib/parse-semicolon-csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TSE_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/tse-municipios/data');
const IBGE_MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');
const TEMP_ZIP_PATH = path.join(ROOT, '.tmp/tse-municipios-fetch/municipio_tse_ibge.zip');

export const TSE_MUNICIPIO_IBGE_ZIP_URL =
  'https://cdn.tse.jus.br/estatistica/sead/odsele/municipio_tse_ibge/municipio_tse_ibge.zip';

export const MIN_TSE_MUNICIPIOS = 5500;
export const MAX_TSE_MUNICIPIOS = 5800;

interface MunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

interface TseMunicipioRecord {
  codigoTse: string;
  ibgeCodigo: number;
  uf: string;
  nome: string;
}

function normalizeCodigoTse(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(5, '0');
}

function parseTseCsv(csvText: string, ibgeCodigos: Set<number>): TseMunicipioRecord[] {
  const rows = parseSemicolonCsv(csvText);
  if (rows.length < 2) {
    throw new SourceDataError('TSE municipio CSV is empty');
  }

  const header = rows[0].map((cell) => cell.replace(/^"|"$/g, '').trim());
  const ufIndex = header.indexOf('SG_UF');
  const codigoTseIndex = header.indexOf('CD_MUNICIPIO_TSE');
  const ibgeIndex = header.indexOf('CD_MUNICIPIO_IBGE');
  const nomeIbgeIndex = header.indexOf('NM_MUNICIPIO_IBGE');
  const nomeTseIndex = header.indexOf('NM_MUNICIPIO_TSE');

  if (ufIndex === -1 || codigoTseIndex === -1 || ibgeIndex === -1) {
    throw new SourceDataError('TSE CSV header missing expected columns');
  }

  const mappings: TseMunicipioRecord[] = [];
  const skippedIbge: string[] = [];

  for (const row of rows.slice(1)) {
    const codigoTse = normalizeCodigoTse((row[codigoTseIndex] ?? '').replace(/^"|"$/g, ''));
    const ibgeRaw = (row[ibgeIndex] ?? '').replace(/^"|"$/g, '').trim();
    const ibgeCodigo = Number.parseInt(ibgeRaw, 10);
    const uf = (row[ufIndex] ?? '').replace(/^"|"$/g, '').trim().toUpperCase();
    const nomeIbge = (row[nomeIbgeIndex] ?? '').replace(/^"|"$/g, '').trim();
    const nomeTse = (row[nomeTseIndex] ?? '').replace(/^"|"$/g, '').trim();

    if (codigoTse.length !== 5 || uf.length !== 2 || !Number.isFinite(ibgeCodigo)) {
      continue;
    }

    if (!ibgeCodigos.has(ibgeCodigo)) {
      skippedIbge.push(`${codigoTse}:${String(ibgeCodigo)}`);
      continue;
    }

    mappings.push({
      codigoTse,
      ibgeCodigo,
      uf,
      nome: nomeIbge.length > 0 ? nomeIbge : nomeTse,
    });
  }

  if (skippedIbge.length > 0) {
    console.warn(
      `[tse-municipios] Skipped ${String(skippedIbge.length)} rows without IBGE match (first: ${skippedIbge[0] ?? 'none'})`,
    );
  }

  return mappings.sort((left, right) => left.codigoTse.localeCompare(right.codigoTse));
}

async function downloadZip(url: string, destination: string): Promise<void> {
  let lastError: object | string | number | boolean | null = null;
  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'br-validators-data-refresh/1.0' },
      });
      if (!response.ok) {
        throw new SourceDataError(`HTTP ${String(response.status)} downloading ${url}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, buffer);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : 'Unknown download error';
      if (attempt < FETCH_MAX_ATTEMPTS) {
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
      }
    }
  }
  throw toError(lastError ?? 'Unknown download error');
}

async function extractCsvFromZip(zipPath: string): Promise<string> {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync('unzip', ['-p', zipPath, 'municipio_tse_ibge.csv'], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0 || result.stdout.length === 0) {
    throw new SourceDataError('Failed to extract municipio_tse_ibge.csv from TSE zip');
  }
  return result.stdout;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const mapeamentoPath = path.join(TSE_DATA_DIR, 'mapeamento.json');
  const metadataPath = path.join(TSE_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [TSE_MUNICIPIO_IBGE_ZIP_URL];

  try {
    const municipiosRaw = await readFile(IBGE_MUNICIPIOS_PATH, 'utf8');
    const municipios = JSON.parse(municipiosRaw) as MunicipioRecord[];
    const ibgeCodigos = new Set(municipios.map((municipio) => municipio.codigo));

    await downloadZip(TSE_MUNICIPIO_IBGE_ZIP_URL, TEMP_ZIP_PATH);
    const csvText = await extractCsvFromZip(TEMP_ZIP_PATH);
    if (csvText.trim().length === 0) {
      throw new SourceDataError('TSE municipio CSV returned an empty body');
    }

    const mappings = parseTseCsv(csvText, ibgeCodigos);

    if (mappings.length < MIN_TSE_MUNICIPIOS || mappings.length > MAX_TSE_MUNICIPIOS) {
      throw new SourceDataError(
        `Expected ${String(MIN_TSE_MUNICIPIOS)}–${String(MAX_TSE_MUNICIPIOS)} TSE mappings, got ${String(mappings.length)}`,
      );
    }

    const codigoTseSet = new Set(mappings.map((mapping) => mapping.codigoTse));
    if (codigoTseSet.size !== mappings.length) {
      throw new SourceDataError('Duplicate TSE municipality codes detected');
    }

    await mkdir(TSE_DATA_DIR, { recursive: true });

    const previousMappings = await readJsonIfExists<TseMunicipioRecord[]>(mapeamentoPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;

    const changes = diffRecordsByKey(
      previousMappings ?? [],
      mappings,
      (mapping) => mapping.codigoTse,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'tse-municipios',
        nome: 'TSE ↔ IBGE Municipality Codes',
        fonte: 'TSE — Códigos oficiais de UF e municípios segundo o TSE e o IBGE',
        endpoints,
        contagens: {
          municipios: mappings.length,
        },
        documentacao: 'docs/OFFICIAL-SOURCES.md#tse-municipios',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(mapeamentoPath, `${JSON.stringify(mappings, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'tse-municipios',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official TSE municipio_tse_ibge zip fetch succeeded.',
    });

    console.log(
      `TSE municipios written (${todayIsoDate()}): ${String(mappings.length)} TSE↔IBGE mappings`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'tse-municipios',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[tse-municipios] ${outcome.message}`);
  }
}

main().catch(exitWithError);

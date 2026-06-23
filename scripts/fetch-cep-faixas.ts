import { createWriteStream } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import { CNEFE_UF_ZIP_BASE_URL, CNEFE_UF_ZIP_FILES, cnefeUfZipUrl } from './lib/cnefe-uf-zips.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CEP_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/core/cep/data');
const IBGE_MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');
const TEMP_DIR = path.join(ROOT, '.tmp/cep-faixas-fetch');

const MIN_PREFIXES = 20_000;
const MAX_PREFIXES = 50_000;
const DOWNLOAD_TIMEOUT_MS = 600_000;

interface MunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

interface CepFaixaRecord {
  prefixo: string;
  uf: string;
  codigoIbge: number;
  cidade: string;
}

interface PrefixAccumulator {
  counts: Map<number, number>;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function downloadZip(url: string, destination: string): Promise<void> {
  let lastError: object | string | number | boolean | null = null;
  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, DOWNLOAD_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'br-validators-data-refresh/1.0' },
      });
      if (!response.ok || response.body === null) {
        throw new SourceDataError(`HTTP ${String(response.status)} downloading ${url}`);
      }
      await pipeline(Readable.fromWeb(response.body), createWriteStream(destination));
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : 'Unknown download error';
      if (attempt < FETCH_MAX_ATTEMPTS) {
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new SourceDataError(`Failed to download ${url}`);
}

function parseCsvLine(line: string): string[] {
  return line.split(';');
}

async function aggregateZipFile(
  zipPath: string,
  prefixMap: Map<string, PrefixAccumulator>,
): Promise<void> {
  const child = spawn('unzip', ['-p', zipPath], { stdio: ['ignore', 'pipe', 'inherit'] });
  const lines = createInterface({ input: child.stdout });

  let isHeader = true;
  for await (const line of lines) {
    if (isHeader) {
      isHeader = false;
      continue;
    }
    const columns = parseCsvLine(line);
    const codMunicipioRaw = columns[2] ?? '';
    const cep = (columns[8] ?? '').replace(/\D/g, '');
    if (cep.length < 5 || codMunicipioRaw.length === 0) {
      continue;
    }
    const codMunicipio = Number.parseInt(codMunicipioRaw, 10);
    if (!Number.isFinite(codMunicipio)) {
      continue;
    }
    const prefixo = cep.slice(0, 5);
    let accumulator = prefixMap.get(prefixo);
    if (accumulator === undefined) {
      accumulator = { counts: new Map<number, number>() };
      prefixMap.set(prefixo, accumulator);
    }
    const current = accumulator.counts.get(codMunicipio) ?? 0;
    accumulator.counts.set(codMunicipio, current + 1);
  }

  await new Promise<void>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`unzip exited with code ${String(code ?? 'unknown')}`));
      }
    });
  });
}

function resolveDominantMunicipio(accumulator: PrefixAccumulator): number {
  let bestCode = 0;
  let bestCount = 0;
  for (const [codigo, count] of accumulator.counts) {
    if (count > bestCount) {
      bestCode = codigo;
      bestCount = count;
    }
  }
  return bestCode;
}

function buildFaixaRecords(
  prefixMap: Map<string, PrefixAccumulator>,
  municipioByCodigo: Map<number, MunicipioRecord>,
): CepFaixaRecord[] {
  const records: CepFaixaRecord[] = [];
  for (const [prefixo, accumulator] of prefixMap) {
    const codigoIbge = resolveDominantMunicipio(accumulator);
    const municipio = municipioByCodigo.get(codigoIbge);
    if (municipio === undefined) {
      continue;
    }
    records.push({
      prefixo,
      uf: municipio.uf,
      codigoIbge: municipio.codigo,
      cidade: municipio.nome,
    });
  }
  return records.sort((left, right) => left.prefixo.localeCompare(right.prefixo));
}

async function main(): Promise<void> {
  const metadataPath = path.join(CEP_DATA_DIR, 'faixa-metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [CNEFE_UF_ZIP_BASE_URL];

  try {
    const municipiosRaw = await readJsonIfExists<MunicipioRecord[]>(IBGE_MUNICIPIOS_PATH);
    if (municipiosRaw === null || municipiosRaw.length === 0) {
      throw new SourceDataError('Embedded IBGE municipios.json is required for CEP faixa enrichment');
    }
    const municipioByCodigo = new Map(municipiosRaw.map((municipio) => [municipio.codigo, municipio]));

    await mkdir(TEMP_DIR, { recursive: true });
    await mkdir(CEP_DATA_DIR, { recursive: true });

    const prefixMap = new Map<string, PrefixAccumulator>();
    for (const zipFile of CNEFE_UF_ZIP_FILES) {
      const url = cnefeUfZipUrl(zipFile);
      const zipPath = path.join(TEMP_DIR, zipFile);
      console.log(`[cep-faixas] downloading ${zipFile}...`);
      await downloadZip(url, zipPath);
      console.log(`[cep-faixas] aggregating ${zipFile}...`);
      await aggregateZipFile(zipPath, prefixMap);
      await rm(zipPath, { force: true });
    }

    const faixas = buildFaixaRecords(prefixMap, municipioByCodigo);
    if (faixas.length < MIN_PREFIXES || faixas.length > MAX_PREFIXES) {
      throw new SourceDataError(
        `Expected ${String(MIN_PREFIXES)}–${String(MAX_PREFIXES)} CEP prefixes, got ${String(faixas.length)}`,
      );
    }

    const faixasPath = path.join(CEP_DATA_DIR, 'faixas.json');
    const previousFaixas = await readJsonIfExists<CepFaixaRecord[]>(faixasPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousFaixas ?? [],
      faixas,
      (record) => record.prefixo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'cep-faixas',
        nome: 'CEP prefix lookup (IBGE CNEFE 2022)',
        fonte: 'IBGE CNEFE Censo 2022 microdata by UF',
        endpoints,
        contagens: { faixas: faixas.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#cep-prefix-ranges',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(faixasPath, `${JSON.stringify(faixas, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);
    await rm(TEMP_DIR, { recursive: true, force: true });

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'cep-faixas',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'IBGE CNEFE CEP prefix aggregation succeeded.',
    });

    console.log(`CEP faixas written (${todayIsoDate()}): ${String(faixas.length)} prefixes`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'cep-faixas',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[cep-faixas] ${outcome.message}`);
  }
}

main().catch(exitWithError);

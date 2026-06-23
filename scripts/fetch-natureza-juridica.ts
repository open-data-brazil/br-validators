import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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
import {
  parseNaturezaJuridicaCsv,
  type NaturezaJuridicaRecord,
} from './lib/parse-natureza-juridica-csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/natureza-juridica/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');
const TEMP_ZIP_PATH = path.join(ROOT, '.tmp/natureza-juridica-fetch/Naturezas.zip');

export const NATUREZA_JURIDICA_BASE_URL =
  'https://dadosabertos.rfb.gov.br/CNPJ/dados_abertos_cnpj';

/**
 * Dev fallback when dadosabertos.rfb.gov.br times out.
 * Community mirror of the official RFB CNPJ open-data Naturezas.zip (2024-09 release).
 * @see https://github.com/jonathands/dados-abertos-receita-cnpj
 */
export const DEV_FALLBACK_NATUREZAS_ZIP_URL =
  'https://github.com/jonathands/dados-abertos-receita-cnpj/releases/download/2024.09/Naturezas.zip';

export const MIN_NATUREZAS = 85;
export const MAX_NATUREZAS = 95;

function buildRecentMonthUrls(): string[] {
  const urls: string[] = [];
  const now = new Date();
  for (let offset = 0; offset < 6; offset += 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    urls.push(`${NATUREZA_JURIDICA_BASE_URL}/${year}-${month}/Naturezas.zip`);
  }
  return urls;
}

async function downloadZip(url: string, destination: string): Promise<void> {
  let lastError: object | string | number | boolean | null = null;
  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'br-validators-data-refresh/1.0' },
        signal: AbortSignal.timeout(30_000),
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

function extractCsvFromZip(zipPath: string): string {
  const listResult = spawnSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' });
  if (listResult.status !== 0) {
    throw new SourceDataError('Failed to list Naturezas.zip contents');
  }
  const entryName = listResult.stdout
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.toLowerCase().includes('natju') || line.toLowerCase().endsWith('.csv'));
  if (entryName === undefined || entryName.length === 0) {
    throw new SourceDataError('Naturezas.zip does not contain expected CSV entry');
  }

  const extractResult = spawnSync('unzip', ['-p', zipPath, entryName], {
    encoding: 'latin1',
    maxBuffer: 1024 * 1024,
  });
  if (extractResult.status !== 0 || extractResult.stdout.length === 0) {
    throw new SourceDataError(`Failed to extract ${entryName} from Naturezas.zip`);
  }
  return extractResult.stdout;
}

async function fetchNaturezasZip(endpoints: string[]): Promise<{ csvText: string; usedUrl: string }> {
  const monthUrls = buildRecentMonthUrls();
  const candidateUrls = [...monthUrls, DEV_FALLBACK_NATUREZAS_ZIP_URL];
  let lastError: object | string | number | boolean | null = null;

  for (const url of candidateUrls) {
    try {
      await downloadZip(url, TEMP_ZIP_PATH);
      const csvText = extractCsvFromZip(TEMP_ZIP_PATH);
      if (csvText.trim().length === 0) {
        throw new SourceDataError('Naturezas CSV returned an empty body');
      }
      endpoints.push(url);
      return { csvText, usedUrl: url };
    } catch (error) {
      lastError = error instanceof Error ? error : 'Unknown download error';
    }
  }

  throw toError(lastError ?? 'All Naturezas.zip download URLs failed');
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
  const dataPath = path.join(DATA_DIR, 'naturezas.json');
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints: string[] = [];

  try {
    const { csvText } = await fetchNaturezasZip(endpoints);
    const naturezas = parseNaturezaJuridicaCsv(csvText);

    if (naturezas.length < MIN_NATUREZAS || naturezas.length > MAX_NATUREZAS) {
      throw new SourceDataError(
        `Expected ${String(MIN_NATUREZAS)}–${String(MAX_NATUREZAS)} naturezas, got ${String(naturezas.length)}`,
      );
    }

    const codigoSet = new Set(naturezas.map((record) => record.codigo));
    if (codigoSet.size !== naturezas.length) {
      throw new SourceDataError('Duplicate natureza juridica codes detected');
    }

    await mkdir(DATA_DIR, { recursive: true });
    const previousNaturezas = await readJsonIfExists<NaturezaJuridicaRecord[]>(dataPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousNaturezas ?? [],
      naturezas,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'natureza-juridica',
        nome: 'RFB CNPJ Naturezas Jurídicas',
        fonte: 'Receita Federal — Dados Abertos CNPJ (Naturezas.zip)',
        endpoints,
        contagens: { naturezas: naturezas.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#natureza-juridica',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(dataPath, `${JSON.stringify(naturezas, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'natureza-juridica',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official RFB Naturezas.zip fetch succeeded.',
    });

    console.log(
      `Natureza juridica data written (${todayIsoDate()}): ${String(naturezas.length)} codes`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'natureza-juridica',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[natureza-juridica] ${outcome.message}`);
  }
}

main().catch(exitWithError);

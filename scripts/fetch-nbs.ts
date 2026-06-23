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
import { parseNbsXlsx, type NbsRecord } from './lib/parse-nbs-xlsx.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/nbs/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');
const TEMP_XLSX_PATH = path.join(ROOT, '.tmp/nbs-fetch/anexo_b-nbs2.xlsx');

export const NBS_XLSX_URL =
  'https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/anexo_b-nbs2-lista_servico_nacional-snnfse.xlsx/@@download/file/ANEXO_B-NBS2-LISTA_SERVICO_NACIONAL-SNNFSe.xlsx';

export const MIN_NBS = 800;
export const MAX_NBS = 950;

async function downloadXlsx(url: string, destination: string): Promise<void> {
  let lastError: object | string | number | boolean | null = null;
  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'br-validators-data-refresh/1.0' },
        signal: AbortSignal.timeout(60_000),
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

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [NBS_XLSX_URL];

  try {
    await downloadXlsx(NBS_XLSX_URL, TEMP_XLSX_PATH);
    const nbsList = parseNbsXlsx(TEMP_XLSX_PATH);

    if (nbsList.length < MIN_NBS || nbsList.length > MAX_NBS) {
      throw new SourceDataError(
        `Expected ${String(MIN_NBS)}–${String(MAX_NBS)} NBS leaf codes, got ${String(nbsList.length)}`,
      );
    }

    const codigoSet = new Set(nbsList.map((record) => record.codigo));
    if (codigoSet.size !== nbsList.length) {
      throw new SourceDataError('Duplicate NBS codes detected');
    }

    await mkdir(DATA_DIR, { recursive: true });
    const nbsPath = path.join(DATA_DIR, 'nbs.json');
    const previousNbs = await readJsonIfExists<NbsRecord[]>(nbsPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousNbs ?? [],
      nbsList,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'nbs',
        nome: 'NFSe NBS',
        fonte: 'NFSe Nacional — Anexo B NBS2 Lista Serviço Nacional',
        endpoints,
        contagens: { nbs: nbsList.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#nbs',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(nbsPath, `${JSON.stringify(nbsList, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'nbs',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official NFSe Anexo B NBS xlsx fetch succeeded.',
    });

    console.log(`NBS data written (${todayIsoDate()}): ${String(nbsList.length)} leaf codes`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'nbs',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[nbs] ${outcome.message}`);
  }
}

main().catch(exitWithError);

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { INCOTERMS_2020 } from './lib/incoterms-2020.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INCOTERMS_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/incoterms/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

export const ICC_INCOTERMS_2020_URL = 'https://iccwbo.org/resources-for-business/incoterms-rules/';

export const INCOTERMS_2020_COUNT = 11;

interface IncotermRecord {
  codigo: string;
  nome: string;
  edicao: '2020';
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function buildIncoterms(): IncotermRecord[] {
  return INCOTERMS_2020.map((entry) => ({
    codigo: entry.codigo,
    nome: entry.nome,
    edicao: '2020' as const,
  }));
}

async function main(): Promise<void> {
  const incotermsPath = path.join(INCOTERMS_DATA_DIR, 'incoterms.json');
  const metadataPath = path.join(INCOTERMS_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [ICC_INCOTERMS_2020_URL];

  try {
    const incoterms = buildIncoterms();

    if (incoterms.length !== INCOTERMS_2020_COUNT) {
      throw new SourceDataError(
        `Expected ${String(INCOTERMS_2020_COUNT)} Incoterms 2020 codes, got ${String(incoterms.length)}`,
      );
    }

    const fob = incoterms.find((entry) => entry.codigo === 'FOB');
    if (fob === undefined) {
      throw new SourceDataError('Golden Incoterm FOB missing from static list');
    }

    await mkdir(INCOTERMS_DATA_DIR, { recursive: true });

    const previousIncoterms = await readJsonIfExists<IncotermRecord[]>(incotermsPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousIncoterms ?? [],
      incoterms,
      (entry) => entry.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'incoterms',
        nome: 'ICC Incoterms 2020',
        fonte: 'International Chamber of Commerce — Incoterms 2020 (static reference)',
        endpoints,
        contagens: { incoterms: incoterms.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#incoterms',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(incotermsPath, `${JSON.stringify(incoterms, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'incoterms',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Static ICC Incoterms 2020 list generated.',
    });

    console.log(
      `Incoterms data written (${todayIsoDate()}): ${String(incoterms.length)} ICC 2020 terms`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'incoterms',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[incoterms] ${outcome.message}`);
  }
}

main().catch(exitWithError);

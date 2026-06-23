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
import { fetchJsonWithRetry, todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CNAES_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/cnaes/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const CNAES_SUBCLASSES_URL = 'https://servicodados.ibge.gov.br/api/v2/cnae/subclasses';
const MIN_CNAES = 1200;
const MAX_CNAES = 1500;

interface IbgeCnaeSubclass {
  id: string;
  descricao: string;
}

interface CnaeRecord {
  codigo: string;
  descricao: string;
}

function normalizeCnae(raw: IbgeCnaeSubclass): CnaeRecord {
  return {
    codigo: raw.id.replace(/\D/g, '').padStart(7, '0'),
    descricao: raw.descricao.trim(),
  };
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
  const metadataPath = path.join(CNAES_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [CNAES_SUBCLASSES_URL];

  try {
    const raw = await fetchJsonWithRetry<IbgeCnaeSubclass[]>(CNAES_SUBCLASSES_URL, FETCH_MAX_ATTEMPTS);
    if (raw.length === 0) {
      throw new SourceDataError('Official IBGE CNAE API returned an empty payload');
    }

    const cnaes = raw
      .map(normalizeCnae)
      .filter((record) => record.codigo.length === 7 && record.descricao.length > 0)
      .sort((left, right) => left.codigo.localeCompare(right.codigo));

    if (cnaes.length < MIN_CNAES || cnaes.length > MAX_CNAES) {
      throw new SourceDataError(
        `Expected ${String(MIN_CNAES)}–${String(MAX_CNAES)} CNAE subclasses, got ${String(cnaes.length)}`,
      );
    }

    await mkdir(CNAES_DATA_DIR, { recursive: true });
    const cnaesPath = path.join(CNAES_DATA_DIR, 'cnaes.json');
    const previousCnaes = await readJsonIfExists<CnaeRecord[]>(cnaesPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousCnaes ?? [],
      cnaes,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'cnaes',
        nome: 'IBGE CNAE 2.3 Subclasses',
        fonte: 'IBGE API v2 /cnae/subclasses',
        endpoints,
        contagens: { cnaes: cnaes.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#cnae-economic-activity',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(cnaesPath, `${JSON.stringify(cnaes, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'cnaes',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official IBGE CNAE subclasses fetch succeeded.',
    });

    console.log(`CNAE data written (${todayIsoDate()}): ${String(cnaes.length)} subclasses`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'cnaes',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[cnaes] ${outcome.message}`);
  }
}

main().catch(exitWithError);

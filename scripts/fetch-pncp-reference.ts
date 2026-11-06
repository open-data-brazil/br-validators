import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { exitWithError } from './lib/errors.js';
import { fetchJsonWithRetry, todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import {
  PNCP_CADASTRO_BASE_URL,
  PNCP_GOLDEN_MODALIDADE_ID,
  PNCP_REFERENCE_ENDPOINTS,
} from './lib/pncp-reference-endpoints.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PNCP_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/pncp-reference/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

interface PncpApiRecord {
  id: number;
  nome: string;
  descricao?: string;
  statusAtivo?: boolean;
}

interface PncpReferenceRecord {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
}

interface TableSnapshot {
  tableId: string;
  records: PncpReferenceRecord[];
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeRecord(record: PncpApiRecord): PncpReferenceRecord {
  return {
    id: record.id,
    nome: record.nome.trim(),
    descricao: (record.descricao ?? '').trim(),
    ativo: record.statusAtivo ?? true,
  };
}

async function fetchTable(endpointPath: string): Promise<PncpReferenceRecord[]> {
  const url = `${PNCP_CADASTRO_BASE_URL}${endpointPath}`;
  const records = await fetchJsonWithRetry<PncpApiRecord[]>(url);
  if (!Array.isArray(records) || records.length === 0) {
    throw new SourceDataError(`PNCP table ${endpointPath} returned empty payload`);
  }
  return records.map(normalizeRecord).sort((left, right) => left.id - right.id);
}

async function main(): Promise<void> {
  const metadataPath = path.join(PNCP_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = PNCP_REFERENCE_ENDPOINTS.map(
    (endpoint) => `${PNCP_CADASTRO_BASE_URL}${endpoint.path}`,
  );

  try {
    await mkdir(PNCP_DATA_DIR, { recursive: true });

    const snapshots: TableSnapshot[] = [];
    const contagens: Record<string, number> = {};

    for (const endpoint of PNCP_REFERENCE_ENDPOINTS) {
      const records = await fetchTable(endpoint.path);
      snapshots.push({ tableId: endpoint.id, records });
      contagens[endpoint.id] = records.length;
      await writeFile(
        path.join(PNCP_DATA_DIR, endpoint.outputFile),
        `${JSON.stringify(records, null, 2)}\n`,
      );
    }

    const modalidades = snapshots.find((snapshot) => snapshot.tableId === 'modalidades')?.records;
    const golden = modalidades?.find((record) => record.id === PNCP_GOLDEN_MODALIDADE_ID);
    if (golden === undefined) {
      throw new SourceDataError(`Golden PNCP modalidade id ${String(PNCP_GOLDEN_MODALIDADE_ID)} missing`);
    }

    const metadata = buildMetadata(
      {
        id: 'pncp-reference',
        nome: 'PNCP domain reference tables',
        fonte: 'PNCP Cadastro API — static domain tables (Lei 14.133 ecosystem)',
        endpoints,
        contagens,
        documentacao: 'docs/OFFICIAL-SOURCES.md#pncp-reference',
      },
      {
        adicionados: 0,
        removidos: 0,
        alterados: 0,
        comparadoCom: previousMetadata?.capturadoEm ?? null,
      },
    );

    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'pncp-reference',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'PNCP reference tables written.',
    });

    const totalRecords = Object.values(contagens).reduce((sum, count) => sum + count, 0);
    console.log(`PNCP reference written (${todayIsoDate()}): ${String(totalRecords)} records across ${String(PNCP_REFERENCE_ENDPOINTS.length)} tables`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'pncp-reference',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[pncp-reference] ${outcome.message}`);
  }
}

main().catch(exitWithError);

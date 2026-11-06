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
import { ISO4217_BASE, ISO4217_MAX_MOEDAS, ISO4217_MIN_MOEDAS } from './lib/iso4217-base.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MOEDAS_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/moedas/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

export const BACEN_PTAX_MOEDAS_URL =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas';

interface BacenMoedaApiRow {
  simbolo: string;
  nomeFormatado: string;
  tipoMoeda: string;
}

interface BacenMoedasApiResponse {
  value: BacenMoedaApiRow[];
}

interface MoedaRecord {
  codigo: string;
  nome: string;
  simbolo: string | null;
  tipoBacen: 'A' | 'B' | null;
}

function parseTipoBacen(value: string): 'A' | 'B' | null {
  if (value === 'A' || value === 'B') {
    return value;
  }
  return null;
}

function buildMoedasFromIso(): MoedaRecord[] {
  return ISO4217_BASE.map((entry) => ({
    codigo: entry.codigo,
    nome: entry.nome,
    simbolo: entry.simbolo,
    tipoBacen: null,
  }));
}

function mergeBacenMoedas(moedas: MoedaRecord[], bacenRows: BacenMoedaApiRow[]): MoedaRecord[] {
  const byCodigo = new Map(moedas.map((moeda) => [moeda.codigo, { ...moeda }]));

  for (const row of bacenRows) {
    const codigo = row.simbolo.trim().toUpperCase();
    if (codigo.length !== 3) {
      continue;
    }
    const existing = byCodigo.get(codigo);
    const tipoBacen = parseTipoBacen(row.tipoMoeda);
    const nome = row.nomeFormatado.trim();
    if (existing !== undefined) {
      byCodigo.set(codigo, {
        ...existing,
        nome: nome.length > 0 ? nome : existing.nome,
        tipoBacen,
      });
      continue;
    }
    byCodigo.set(codigo, {
      codigo,
      nome,
      simbolo: null,
      tipoBacen,
    });
  }

  return [...byCodigo.values()].sort((left, right) => left.codigo.localeCompare(right.codigo));
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
  const moedasPath = path.join(MOEDAS_DATA_DIR, 'moedas.json');
  const metadataPath = path.join(MOEDAS_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [BACEN_PTAX_MOEDAS_URL];

  try {
    const isoMoedas = buildMoedasFromIso();
    const apiResponse = await fetchJsonWithRetry<BacenMoedasApiResponse>(
      BACEN_PTAX_MOEDAS_URL,
      FETCH_MAX_ATTEMPTS,
    );
    const bacenRows = apiResponse.value;
    if (bacenRows.length === 0) {
      throw new SourceDataError('Bacen PTAX Moedas API returned an empty list');
    }

    const moedas = mergeBacenMoedas(isoMoedas, bacenRows);

    if (moedas.length < ISO4217_MIN_MOEDAS || moedas.length > ISO4217_MAX_MOEDAS) {
      throw new SourceDataError(
        `Expected ${String(ISO4217_MIN_MOEDAS)}–${String(ISO4217_MAX_MOEDAS)} currencies, got ${String(moedas.length)}`,
      );
    }

    const codigoSet = new Set(moedas.map((moeda) => moeda.codigo));
    if (codigoSet.size !== moedas.length) {
      throw new SourceDataError('Duplicate ISO 4217 codes detected in moedas dataset');
    }

    await mkdir(MOEDAS_DATA_DIR, { recursive: true });

    const previousMoedas = await readJsonIfExists<MoedaRecord[]>(moedasPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousMoedas ?? [],
      moedas,
      (moeda) => moeda.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'moedas',
        nome: 'ISO 4217 Currencies + Bacen PTAX',
        fonte: 'ISO 4217 (embedded) + Banco Central PTAX Moedas',
        endpoints,
        contagens: { moedas: moedas.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#moedas',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(moedasPath, `${JSON.stringify(moedas, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'moedas',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'ISO 4217 baseline merged with Bacen PTAX Moedas API.',
    });

    console.log(
      `Moedas data written (${todayIsoDate()}): ${String(moedas.length)} ISO 4217 codes (${String(bacenRows.length)} Bacen PTAX merged)`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'moedas',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[moedas] ${outcome.message}`);
  }
}

main().catch(exitWithError);

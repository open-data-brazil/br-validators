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
const NCM_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/ncm/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const NCM_JSON_URL =
  'https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json';
const MIN_NCM = 10_000;
const MAX_NCM = 11_500;

interface SiscomexNomenclatura {
  Codigo: string;
  Descricao: string;
}

interface SiscomexPayload {
  Nomenclaturas: SiscomexNomenclatura[];
}

interface NcmRecord {
  codigo: string;
  descricao: string;
}

function normalizeNcmCode(codigo: string): string {
  return codigo.replace(/\D/g, '');
}

function isLeafNcmCode(codigo: string): boolean {
  return normalizeNcmCode(codigo).length === 8;
}

function normalizeNcm(raw: SiscomexNomenclatura): NcmRecord {
  return {
    codigo: normalizeNcmCode(raw.Codigo),
    descricao: raw.Descricao.trim(),
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
  const metadataPath = path.join(NCM_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [NCM_JSON_URL];

  try {
    const raw = await fetchJsonWithRetry<SiscomexPayload>(NCM_JSON_URL, FETCH_MAX_ATTEMPTS, 2000, 120_000);
    const nomenclaturas = raw.Nomenclaturas;
    if (!Array.isArray(nomenclaturas) || nomenclaturas.length === 0) {
      throw new SourceDataError('Official Siscomex NCM JSON returned an empty payload');
    }

    const ncm = nomenclaturas
      .filter((item) => isLeafNcmCode(item.Codigo))
      .map(normalizeNcm)
      .filter((record) => record.descricao.length > 0)
      .sort((left, right) => left.codigo.localeCompare(right.codigo));

    if (ncm.length < MIN_NCM || ncm.length > MAX_NCM) {
      throw new SourceDataError(
        `Expected ${String(MIN_NCM)}–${String(MAX_NCM)} NCM leaf codes, got ${String(ncm.length)}`,
      );
    }

    await mkdir(NCM_DATA_DIR, { recursive: true });
    const ncmPath = path.join(NCM_DATA_DIR, 'ncm.json');
    const previousNcm = await readJsonIfExists<NcmRecord[]>(ncmPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousNcm ?? [],
      ncm,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'ncm',
        nome: 'NCM — Nomenclatura Comum do Mercosul',
        fonte: 'Receita Federal / Siscomex nomenclatura JSON',
        endpoints,
        contagens: { ncm: ncm.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#ncm-mercosur-nomenclature',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(ncmPath, `${JSON.stringify(ncm, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'ncm',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official Siscomex NCM JSON fetch succeeded.',
    });

    console.log(`NCM data written (${todayIsoDate()}): ${String(ncm.length)} leaf codes`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'ncm',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[ncm] ${outcome.message}`);
  }
}

main().catch(exitWithError);

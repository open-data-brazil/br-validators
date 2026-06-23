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
import { fetchTextWithRetry, todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CBO_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/cbo/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

const CBO_OCUPACAO_CSV_URL =
  'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/cbo2002-ocupacao.csv';
const MIN_CBO = 2400;
const MAX_CBO = 2800;

interface CboRecord {
  codigo: string;
  descricao: string;
}

function parseSemicolonCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split(';'));
}

function normalizeCbo(codigo: string, descricao: string): CboRecord | null {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length !== 6) {
    return null;
  }
  const trimmed = descricao.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return { codigo: digits, descricao: trimmed };
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
  const metadataPath = path.join(CBO_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [CBO_OCUPACAO_CSV_URL];

  try {
    const csvText = await fetchTextWithRetry(CBO_OCUPACAO_CSV_URL, FETCH_MAX_ATTEMPTS);
    const rows = parseSemicolonCsv(csvText);
    if (rows.length < 2) {
      throw new SourceDataError('Official MTE CBO CSV is empty');
    }

    const header = rows[0];
    const codigoIndex = header.indexOf('CODIGO');
    const tituloIndex = header.indexOf('TITULO');
    if (codigoIndex === -1 || tituloIndex === -1) {
      throw new SourceDataError('MTE CBO CSV header missing CODIGO or TITULO columns');
    }

    const cbos: CboRecord[] = [];
    for (const row of rows.slice(1)) {
      const record = normalizeCbo(row[codigoIndex] ?? '', row[tituloIndex] ?? '');
      if (record !== null) {
        cbos.push(record);
      }
    }

    cbos.sort((left, right) => left.codigo.localeCompare(right.codigo));

    if (cbos.length < MIN_CBO || cbos.length > MAX_CBO) {
      throw new SourceDataError(
        `Expected ${String(MIN_CBO)}–${String(MAX_CBO)} CBO occupations, got ${String(cbos.length)}`,
      );
    }

    await mkdir(CBO_DATA_DIR, { recursive: true });
    const cboPath = path.join(CBO_DATA_DIR, 'cbo.json');
    const previousCbos = await readJsonIfExists<CboRecord[]>(cboPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousCbos ?? [],
      cbos,
      (record) => record.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'cbo',
        nome: 'CBO 2002 — Brazilian Occupations',
        fonte: 'MTE CBO 2002 ocupacao.csv',
        endpoints,
        contagens: { cbo: cbos.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#cbo-occupations',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(cboPath, `${JSON.stringify(cbos, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'cbo',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official MTE CBO occupations CSV fetch succeeded.',
    });

    console.log(`CBO data written (${todayIsoDate()}): ${String(cbos.length)} occupations`);
  } catch (error) {
    const outcome = buildFailureOutcome(
      'cbo',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[cbo] ${outcome.message}`);
  }
}

main().catch(exitWithError);

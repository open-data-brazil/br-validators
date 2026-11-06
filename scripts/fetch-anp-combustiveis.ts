import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ANP_LPC_LISTING_URL,
  resolveAnpSummaryUrlFromHtml,
} from './lib/anp-listing-scraper.js';
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
import {
  anpPrecoMedioKey,
  assertAnpPrecosMediosBounds,
  buildAnpSemanasFromRecords,
  parseAnpResumoMunicipiosXlsx,
  type AnpPrecoMedioRecord,
} from './lib/anp-xlsx-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'packages/br-validators/src/anp-combustiveis/data');
const IBGE_ESTADOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/estados.json');
const IBGE_MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');
const TMP_DIR = path.join(ROOT, '.tmp/anp-combustiveis-fetch');

export { ANP_LPC_LISTING_URL };

interface IbgeEstadoRecord {
  sigla: string;
  nome: string;
}

interface IbgeMunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function downloadBinary(url: string, destination: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new SourceDataError(`ANP XLSX download failed: HTTP ${String(response.status)} for ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) {
    throw new SourceDataError('ANP XLSX download returned an empty body');
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, buffer);
}

async function main(): Promise<void> {
  const precosPath = path.join(DATA_DIR, 'precos-medios.json');
  const semanasPath = path.join(DATA_DIR, 'semanas.json');
  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [ANP_LPC_LISTING_URL];

  try {
    const estados = JSON.parse(await readFile(IBGE_ESTADOS_PATH, 'utf8')) as IbgeEstadoRecord[];
    const municipios = JSON.parse(await readFile(IBGE_MUNICIPIOS_PATH, 'utf8')) as IbgeMunicipioRecord[];

    const listingHtml = await fetchTextWithRetry(ANP_LPC_LISTING_URL, FETCH_MAX_ATTEMPTS);
    const latestLink = resolveAnpSummaryUrlFromHtml(listingHtml);
    if (latestLink === null) {
      throw new SourceDataError('No resumo_semanal_lpc XLSX link found on ANP listing page');
    }

    endpoints.push(latestLink.url);

    const xlsxPath = path.join(TMP_DIR, latestLink.fileName);
    await downloadBinary(latestLink.url, xlsxPath);

    const precosMedios = parseAnpResumoMunicipiosXlsx(xlsxPath, estados, municipios);
    assertAnpPrecosMediosBounds(precosMedios.length);

    const semanas = buildAnpSemanasFromRecords(precosMedios);
    if (semanas.length !== 1) {
      throw new SourceDataError(`Expected exactly 1 embedded survey week, got ${String(semanas.length)}`);
    }

    const municipiosUnicos = new Set(
      precosMedios.map((record) => `${record.uf}:${record.municipioNome}`),
    ).size;
    const produtos = new Set(precosMedios.map((record) => record.produto)).size;
    const ufs = new Set(precosMedios.map((record) => record.uf)).size;

    await mkdir(DATA_DIR, { recursive: true });

    const previousPrecos = await readJsonIfExists<AnpPrecoMedioRecord[]>(precosPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousPrecos ?? [],
      precosMedios,
      anpPrecoMedioKey,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'anp-combustiveis',
        nome: 'ANP — Levantamento de Preços de Combustíveis (LPC)',
        fonte: 'ANP — resumo_semanal_lpc (municipal averages)',
        endpoints,
        contagens: {
          semanas: semanas.length,
          precosMedios: precosMedios.length,
          municipios: municipiosUnicos,
          produtos,
          ufs,
        },
        documentacao: 'docs/OFFICIAL-SOURCES.md#anp-combustiveis',
        agendamento: 'semanal',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(precosPath, `${JSON.stringify(precosMedios, null, jsonIndent)}\n`);
    await writeFile(semanasPath, `${JSON.stringify(semanas, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'anp-combustiveis',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official ANP LPC weekly summary XLSX fetch succeeded.',
    });

    console.log(
      `ANP combustíveis written (${todayIsoDate()}): week ${semanas[0].inicio} → ${semanas[0].fim}, ${String(precosMedios.length)} price rows`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'anp-combustiveis',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[anp-combustiveis] ${outcome.message}`);
  }
}

main().catch(exitWithError);

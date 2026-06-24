import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import { fetchNfePaisesTableText } from './lib/fetch-nfe-portal.js';
import {
  buildEmbeddedFallbackOutcome,
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import { loadOfficialPaisesBacen } from './lib/paises-bacen-official.js';
import { parseNfePaisesTable, type PaisBacenRecord } from './lib/parse-nfe-paises.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PAISES_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/paises-bacen/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

export const NFE_PAISES_TABLE_URL =
  'http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=FOXZNFX/p50=';

export const MIN_PAISES_BACEN = 240;
export const MAX_PAISES_BACEN = 270;

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function validatePaises(paises: PaisBacenRecord[]): void {
  if (paises.length < MIN_PAISES_BACEN || paises.length > MAX_PAISES_BACEN) {
    throw new SourceDataError(
      `Expected ${String(MIN_PAISES_BACEN)}–${String(MAX_PAISES_BACEN)} countries, got ${String(paises.length)}`,
    );
  }
  const brasil = paises.find((pais) => pais.codigo === '1058');
  if (brasil === undefined || !brasil.nome.toUpperCase().includes('BRASIL')) {
    throw new SourceDataError('Golden country 1058 (Brasil) missing from paises-bacen dataset');
  }
  const codigoSet = new Set(paises.map((pais) => pais.codigo));
  if (codigoSet.size !== paises.length) {
    throw new SourceDataError('Duplicate Bacen country codes detected');
  }
}

async function resolvePaises(): Promise<{
  paises: PaisBacenRecord[];
  source: 'nfe-fetch' | 'embedded';
  attemptsUsed: number;
  fetchDetail: string | null;
}> {
  try {
    const { text, attemptsUsed } = await fetchNfePaisesTableText(
      NFE_PAISES_TABLE_URL,
      MIN_PAISES_BACEN,
    );
    const parsed = parseNfePaisesTable(text);
    if (parsed.length >= MIN_PAISES_BACEN) {
      return { paises: parsed, source: 'nfe-fetch', attemptsUsed, fetchDetail: null };
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown NF-e portal fetch error';
    return {
      paises: loadOfficialPaisesBacen(),
      source: 'embedded',
      attemptsUsed: FETCH_MAX_ATTEMPTS,
      fetchDetail: detail,
    };
  }
  return {
    paises: loadOfficialPaisesBacen(),
    source: 'embedded',
    attemptsUsed: FETCH_MAX_ATTEMPTS,
    fetchDetail: 'Portal payload did not meet minimum country count',
  };
}

async function main(): Promise<void> {
  const paisesPath = path.join(PAISES_DATA_DIR, 'paises.json');
  const metadataPath = path.join(PAISES_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [NFE_PAISES_TABLE_URL];

  try {
    const { paises, source, attemptsUsed, fetchDetail } = await resolvePaises();
    validatePaises(paises);

    await mkdir(PAISES_DATA_DIR, { recursive: true });

    const previousPaises = await readJsonIfExists<PaisBacenRecord[]>(paisesPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousPaises ?? [],
      paises,
      (pais) => pais.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'paises-bacen',
        nome: 'NF-e Bacen Country Codes',
        fonte: 'Portal Nacional NF-e — Tabela de Países (Bacen)',
        endpoints,
        contagens: { paises: paises.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#paises-bacen',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(paisesPath, `${JSON.stringify(paises, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    if (source === 'nfe-fetch') {
      await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
        datasetId: 'paises-bacen',
        status: 'ok',
        endpoints,
        attempts: attemptsUsed,
        checkedAt: new Date().toISOString(),
        retainedEmbeddedDataFrom: metadata.capturadoEm,
        message: 'Official NF-e country table fetch succeeded.',
      });
    } else {
      const detail =
        fetchDetail === null
          ? 'NF-e portal did not return a parseable country table.'
          : `NF-e portal did not return a parseable country table (${fetchDetail}).`;
      await writeSourceFetchOutcome(
        FETCH_OUTCOME_DIR,
        buildEmbeddedFallbackOutcome(
          'paises-bacen',
          endpoints,
          previousMetadata?.capturadoEm ?? metadata.capturadoEm,
          attemptsUsed,
          detail,
        ),
      );
    }

    console.log(
      `Paises-bacen data written (${todayIsoDate()}): ${String(paises.length)} countries (${source})`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'paises-bacen',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[paises-bacen] ${outcome.message}`);
  }
}

main().catch(exitWithError);

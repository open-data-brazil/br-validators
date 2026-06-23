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

async function resolvePaises(): Promise<{ paises: PaisBacenRecord[]; source: 'nfe-fetch' | 'embedded' }> {
  try {
    const text = await fetchTextWithRetry(NFE_PAISES_TABLE_URL, FETCH_MAX_ATTEMPTS);
    const parsed = parseNfePaisesTable(text);
    if (parsed.length >= MIN_PAISES_BACEN) {
      return { paises: parsed, source: 'nfe-fetch' };
    }
  } catch {
    // Fall back to embedded NF-e/Bacen table when portal redirect fails.
  }
  return { paises: loadOfficialPaisesBacen(), source: 'embedded' };
}

async function main(): Promise<void> {
  const paisesPath = path.join(PAISES_DATA_DIR, 'paises.json');
  const metadataPath = path.join(PAISES_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [NFE_PAISES_TABLE_URL];

  try {
    const { paises, source } = await resolvePaises();
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

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'paises-bacen',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message:
        source === 'nfe-fetch'
          ? 'Official NF-e country table fetch succeeded.'
          : 'NF-e portal unavailable; embedded Bacen country table written.',
    });

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

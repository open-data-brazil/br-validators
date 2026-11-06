import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { diffRecordsByKey } from './lib/diff-dataset.js';
import { exitWithError } from './lib/errors.js';
import { todayIsoDate } from './lib/fetch-utils.js';
import { buildMetadata } from './lib/metadata-writer.js';
import { parsePortosXlsx } from './lib/parse-portos-xlsx.js';
import { repairPortosText, type IbgeMunicipioName } from './lib/repair-portos-text.js';
import { extractZipEntryBySuffix } from './lib/zip-extract.js';
import {
  buildFailureOutcome,
  FETCH_MAX_ATTEMPTS,
  SourceDataError,
  writeSourceFetchOutcome,
} from './lib/source-fetch-outcome.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORTOS_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/portos/data');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');
const TMP_DIR = path.join(ROOT, '.tmp');
const IBGE_MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');

export const ANTAQ_PORTOS_ZIP_URL =
  'https://www.gov.br/antaq/pt-br/central-de-conteudos/Instalaesporturias06052025.zip';

export const PORTOS_GOLDEN_SANTOS = 'BRSSZ';
export const MIN_PORTOS = 800;
export const MAX_PORTOS = 1500;

interface PortoRecord {
  codigo: string;
  nome: string;
  tipo: string;
  situacao: string;
  uf: string;
  municipioNome: string;
  municipioIbge: number | null;
  latitude: number | null;
  longitude: number | null;
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function downloadZip(url: string, destination: string): Promise<void> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/zip,application/octet-stream,*/*',
      'User-Agent': 'br-validators-data-refresh/1.0 (+https://github.com/AlexandreZanata/br-validators)',
    },
  });
  if (!response.ok) {
    throw new SourceDataError(`HTTP ${String(response.status)} downloading ANTAQ portos zip`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, buffer);
}

async function extractPortosXlsx(zipPath: string, xlsxPath: string): Promise<void> {
  // The ANTAQ folder name is not UTF-8; system `unzip` on GitHub runners failed to
  // re-match the listed name, so extract in-process by the ASCII file name.
  let xlsx: Uint8Array;
  try {
    xlsx = extractZipEntryBySuffix(new Uint8Array(await readFile(zipPath)), 'Portos.xlsx');
  } catch (error) {
    throw new SourceDataError(
      `Failed to extract Portos.xlsx from ANTAQ zip (${error instanceof Error ? error.message : String(error)})`,
    );
  }
  if (xlsx.length === 0) {
    throw new SourceDataError('Failed to extract Portos.xlsx from ANTAQ zip (empty entry)');
  }
  await writeFile(xlsxPath, xlsx);
}

async function main(): Promise<void> {
  const portosPath = path.join(PORTOS_DATA_DIR, 'portos.json');
  const metadataPath = path.join(PORTOS_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [ANTAQ_PORTOS_ZIP_URL];

  try {
    await mkdir(TMP_DIR, { recursive: true });
    await mkdir(PORTOS_DATA_DIR, { recursive: true });

    const zipPath = path.join(TMP_DIR, 'antaq-portos.zip');
    const xlsxPath = path.join(TMP_DIR, 'Portos.xlsx');

    await downloadZip(ANTAQ_PORTOS_ZIP_URL, zipPath);
    await extractPortosXlsx(zipPath, xlsxPath);
    const municipios = (await readJsonIfExists<IbgeMunicipioName[]>(IBGE_MUNICIPIOS_PATH)) ?? [];
    // ANTAQ ships Portos.xlsx with U+FFFD instead of accented letters — repair before diffing.
    const repaired = repairPortosText(parsePortosXlsx(xlsxPath), municipios);
    const portos = repaired.portos as PortoRecord[];
    if (repaired.unresolved.length > 0) {
      console.warn(
        `[portos] ${String(repaired.unresolved.length)} damaged token(s) not repaired — add them to scripts/lib/pt-br-repair-words.ts: ${repaired.unresolved.join(', ')}`,
      );
    }

    if (portos.length < MIN_PORTOS || portos.length > MAX_PORTOS) {
      throw new SourceDataError(
        `Expected ${String(MIN_PORTOS)}–${String(MAX_PORTOS)} portos, got ${String(portos.length)}`,
      );
    }

    const santos = portos.find((porto) => porto.codigo === PORTOS_GOLDEN_SANTOS);
    if (santos === undefined || !santos.nome.toUpperCase().includes('SANTOS')) {
      throw new SourceDataError(`Golden porto ${PORTOS_GOLDEN_SANTOS} missing from ANTAQ dataset`);
    }

    const codigoSet = new Set(portos.map((porto) => porto.codigo));
    if (codigoSet.size !== portos.length) {
      throw new SourceDataError('Duplicate porto codes detected in ANTAQ dataset');
    }

    const previousPortos = await readJsonIfExists<PortoRecord[]>(portosPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;
    const changes = diffRecordsByKey(
      previousPortos ?? [],
      portos,
      (porto) => porto.codigo,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'portos',
        nome: 'ANTAQ port installations',
        fonte: 'ANTAQ — Instalações Portuárias Outorgadas (Portos.xlsx)',
        endpoints,
        contagens: { portos: portos.length },
        documentacao: 'docs/OFFICIAL-SOURCES.md#portos',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(portosPath, `${JSON.stringify(portos, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'portos',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'ANTAQ portos written.',
    });

    console.log(`ANTAQ portos written (${todayIsoDate()}): ${String(portos.length)} installations`);
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'portos',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[portos] ${outcome.message}`);
  }
}

main().catch(exitWithError);

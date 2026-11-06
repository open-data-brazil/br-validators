import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AEROPORTOS_IATA_OACI_MAP } from './lib/aeroportos-iata-oaci-map.js';
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
import { parseSemicolonCsv } from './lib/parse-semicolon-csv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AEROPORTOS_DATA_DIR = path.join(ROOT, 'packages/br-validators/src/aeroportos/data');
const IBGE_MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');
const FETCH_OUTCOME_DIR = path.join(ROOT, 'data/refresh-reports/fetch-outcomes');

export const ANAC_AERODROMOS_PUBLICOS_CSV_URL =
  'https://www.anac.gov.br/acesso-a-informacao/dados-abertos/areas-de-atuacao/aerodromos/lista-de-aerodromos-publicos/aerodromospublicosv1.csv/@@download/file/aerodromospublicosv1.csv';

export const MIN_AEROPORTOS = 400;
export const MAX_AEROPORTOS = 600;
export const MIN_AEROPORTOS_WITH_IATA = 50;

interface MunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

interface AeroportoRecord {
  iata: string | null;
  icao: string;
  nome: string;
  uf: string;
  municipioIbge: number | null;
  municipioNome: string | null;
}

function normalizePlaceName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildMunicipioIndex(municipios: MunicipioRecord[]): Map<string, MunicipioRecord> {
  const index = new Map<string, MunicipioRecord>();
  for (const municipio of municipios) {
    const key = `${municipio.uf}:${normalizePlaceName(municipio.nome)}`;
    index.set(key, municipio);
  }
  return index;
}

function resolveMunicipio(
  municipioNome: string,
  uf: string,
  index: Map<string, MunicipioRecord>,
): MunicipioRecord | null {
  const normalizedUf = uf.toUpperCase();
  const key = `${normalizedUf}:${normalizePlaceName(municipioNome)}`;
  const direct = index.get(key);
  if (direct !== undefined) {
    return direct;
  }

  const aliases: Record<string, string> = {
    'RJ:RIO DE JANEIRO': 'Rio de Janeiro',
    'SP:GUARULHOS': 'Guarulhos',
    'SP:CAMPINAS': 'Campinas',
    'MG:CONFINS': 'Confins',
    'MT:VARZEA GRANDE': 'Várzea Grande',
    'DF:BRASILIA': 'Brasília',
  };
  if (Object.hasOwn(aliases, key)) {
    const aliasKey = `${normalizedUf}:${normalizePlaceName(aliases[key])}`;
    return index.get(aliasKey) ?? null;
  }

  return null;
}

function parseAnacCsv(csvText: string, municipioIndex: Map<string, MunicipioRecord>): AeroportoRecord[] {
  const rows = parseSemicolonCsv(csvText);
  const headerIndex = rows.findIndex((row) => row[0]?.includes('CÓDIGO OACI') ?? false);
  if (headerIndex === -1) {
    throw new SourceDataError('ANAC CSV header row with CÓDIGO OACI not found');
  }

  const header = rows[headerIndex];
  const oaciIndex = header.indexOf('CÓDIGO OACI');
  const nomeIndex = header.indexOf('NOME');
  const municipioIndexCol = header.indexOf('MUNICÍPIO ATENDIDO');
  const ufIndex = header.indexOf('UF');

  if (oaciIndex === -1 || nomeIndex === -1 || municipioIndexCol === -1 || ufIndex === -1) {
    throw new SourceDataError('ANAC CSV header missing expected columns');
  }

  const aeroportos: AeroportoRecord[] = [];

  for (const row of rows.slice(headerIndex + 1)) {
    const icao = (row[oaciIndex] ?? '').trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(icao)) {
      continue;
    }

    const nome = (row[nomeIndex] ?? '').trim();
    const municipioNomeRaw = (row[municipioIndexCol] ?? '').trim();
    const uf = (row[ufIndex] ?? '').trim().toUpperCase();
    if (nome.length === 0 || uf.length !== 2) {
      continue;
    }

    const municipio = resolveMunicipio(municipioNomeRaw, uf, municipioIndex);
    const iataCandidate = Object.hasOwn(AEROPORTOS_IATA_OACI_MAP, icao)
      ? AEROPORTOS_IATA_OACI_MAP[icao]
      : '';
    const iata = /^[A-Z0-9]{3}$/.test(iataCandidate) ? iataCandidate : null;

    aeroportos.push({
      iata,
      icao,
      nome,
      uf,
      municipioIbge: municipio?.codigo ?? null,
      municipioNome: municipio?.nome ?? (municipioNomeRaw.length > 0 ? municipioNomeRaw : null),
    });
  }

  return aeroportos.sort((left, right) => left.icao.localeCompare(right.icao));
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
  const aeroportosPath = path.join(AEROPORTOS_DATA_DIR, 'aeroportos.json');
  const metadataPath = path.join(AEROPORTOS_DATA_DIR, 'metadata.json');
  const previousMetadata = await readJsonIfExists<{ capturadoEm: string }>(metadataPath);
  const endpoints = [ANAC_AERODROMOS_PUBLICOS_CSV_URL];

  try {
    const municipiosRaw = await readFile(IBGE_MUNICIPIOS_PATH, 'utf8');
    const municipios = JSON.parse(municipiosRaw) as MunicipioRecord[];
    const municipioIndex = buildMunicipioIndex(municipios);

    const csvText = await fetchTextWithRetry(ANAC_AERODROMOS_PUBLICOS_CSV_URL, FETCH_MAX_ATTEMPTS);
    if (csvText.trim().length === 0) {
      throw new SourceDataError('ANAC aerodromos CSV returned an empty body');
    }

    const aeroportos = parseAnacCsv(csvText, municipioIndex);
    const withIata = aeroportos.filter((aeroporto) => aeroporto.iata !== null).length;

    if (aeroportos.length < MIN_AEROPORTOS || aeroportos.length > MAX_AEROPORTOS) {
      throw new SourceDataError(
        `Expected ${String(MIN_AEROPORTOS)}–${String(MAX_AEROPORTOS)} aerodromos, got ${String(aeroportos.length)}`,
      );
    }

    if (withIata < MIN_AEROPORTOS_WITH_IATA) {
      throw new SourceDataError(
        `Expected at least ${String(MIN_AEROPORTOS_WITH_IATA)} aerodromos with IATA, got ${String(withIata)}`,
      );
    }

    const icaoSet = new Set(aeroportos.map((aeroporto) => aeroporto.icao));
    if (icaoSet.size !== aeroportos.length) {
      throw new SourceDataError('Duplicate ICAO codes detected in aeroportos dataset');
    }

    await mkdir(AEROPORTOS_DATA_DIR, { recursive: true });

    const previousAeroportos = await readJsonIfExists<AeroportoRecord[]>(aeroportosPath);
    const comparadoCom = previousMetadata?.capturadoEm ?? null;

    const changes = diffRecordsByKey(
      previousAeroportos ?? [],
      aeroportos,
      (aeroporto) => aeroporto.icao,
      comparadoCom,
    );

    const metadata = buildMetadata(
      {
        id: 'aeroportos',
        nome: 'ANAC Public Aerodromos',
        fonte: 'ANAC — Lista de aeródromos de uso público',
        endpoints,
        contagens: {
          aeroportos: aeroportos.length,
          comIata: withIata,
        },
        documentacao: 'docs/OFFICIAL-SOURCES.md#aeroportos',
      },
      changes,
    );

    const jsonIndent = 2;
    await writeFile(aeroportosPath, `${JSON.stringify(aeroportos, null, jsonIndent)}\n`);
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, jsonIndent)}\n`);

    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, {
      datasetId: 'aeroportos',
      status: 'ok',
      endpoints,
      attempts: FETCH_MAX_ATTEMPTS,
      checkedAt: new Date().toISOString(),
      retainedEmbeddedDataFrom: metadata.capturadoEm,
      message: 'Official ANAC public aerodromos CSV fetch succeeded.',
    });

    console.log(
      `ANAC aeroportos written (${todayIsoDate()}): ${String(aeroportos.length)} aerodromos (${String(withIata)} with IATA)`,
    );
    console.log(
      `Changes: +${String(metadata.alteracoes.adicionados)} -${String(metadata.alteracoes.removidos)} ~${String(metadata.alteracoes.alterados)}`,
    );
  } catch (error) {
    const outcome = buildFailureOutcome(
      'aeroportos',
      endpoints,
      previousMetadata?.capturadoEm ?? null,
      error,
      FETCH_MAX_ATTEMPTS,
    );
    await writeSourceFetchOutcome(FETCH_OUTCOME_DIR, outcome);
    console.warn(`[aeroportos] ${outcome.message}`);
  }
}

main().catch(exitWithError);

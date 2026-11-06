import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import { toError } from './errors.js';
import { FETCH_MAX_ATTEMPTS } from './fetch-retry-config.js';
import { USER_AGENT, fetchTextWithRetry } from './fetch-utils.js';
import {
  mapIbptApidoniToCarga,
  parseIbptApidoniPayload,
} from './map-ibpt-apidoni.js';
import {
  extractGoldenIbptCargas,
  type IbptCargaRecord,
  type IbptNcmPayload,
} from './parse-ibpt-ncm-json.js';
import { resolveLatestIbptTabela, type IbptMetaPayload } from './resolve-ibpt-tabela.js';
import { SourceDataError } from './source-fetch-outcome.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const IBPT_MIRROR_PATH = path.join(ROOT, 'data/source-mirrors/ibpt/golden-cargas.json');

export const IBPT_OFFICIAL_PORTAL_URL = 'https://deolhonoimposto.ibpt.org.br/';
export const IBPT_APIDONI_PRODUTOS_URL = 'https://apidoni.ibpt.org.br/api/v1/produtos';

/**
 * Community republication of official IBPT NCM tables (subset fetch only).
 * @see https://ibpt.valraw.com.br/
 */
export const IBPT_VALRAW_API_BASE_URL = 'https://ibpt.valraw.com.br/api';

/** @deprecated Use IBPT_VALRAW_API_BASE_URL */
export const IBPT_DEV_API_BASE_URL = IBPT_VALRAW_API_BASE_URL;

export const IBPT_GOLDEN_NCMS = ['01012100', '12011000', '22030000'] as const;
export const IBPT_GOLDEN_UFS = ['SP', 'RJ', 'MG'] as const;

export const IBPT_MIN_CARGAS = 4;
export const IBPT_MAX_CARGAS = 12;

export type IbptGoldenSource = 'apidoni' | 'valraw' | 'repo_mirror';

export interface IbptGoldenFetchResult {
  cargas: IbptCargaRecord[];
  endpoints: string[];
  source: IbptGoldenSource;
}

function parseJsonObject(raw: string): object {
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new SourceDataError('Expected JSON object from IBPT source');
  }
  return parsed;
}

function buildApidoniUrl(ncm: string, uf: string, token: string, cnpj: string): string {
  const params = new URLSearchParams({
    token,
    cnpj,
    codigo: ncm,
    uf,
    ex: '0',
    descricao: 'PRODUTO',
    unidadeMedida: 'UN',
    valor: '1',
    gtin: 'SEM GTIN',
  });
  return `${IBPT_APIDONI_PRODUTOS_URL}?${params.toString()}`;
}

function buildValrawEndpoints(meta: IbptMetaPayload): string[] {
  const { ano, tabela } = resolveLatestIbptTabela(meta);
  const endpoints = [
    IBPT_OFFICIAL_PORTAL_URL,
    IBPT_APIDONI_PRODUTOS_URL,
    `${IBPT_VALRAW_API_BASE_URL}/meta.json`,
  ];
  for (const uf of IBPT_GOLDEN_UFS) {
    endpoints.push(`${IBPT_VALRAW_API_BASE_URL}/${String(ano)}/${tabela}/ncm/${uf}.json.gz`);
  }
  return endpoints;
}

export function buildIbptCandidateEndpoints(): string[] {
  return [
    IBPT_OFFICIAL_PORTAL_URL,
    IBPT_APIDONI_PRODUTOS_URL,
    `${IBPT_VALRAW_API_BASE_URL}/meta.json`,
    ...IBPT_GOLDEN_UFS.map(
      (uf) => `${IBPT_VALRAW_API_BASE_URL}/ncm/${uf}.json.gz (resolved after meta.json)`,
    ),
    IBPT_MIRROR_PATH,
  ];
}

async function downloadBinary(url: string, gzip: boolean): Promise<string> {
  let lastError: object | string | number | boolean | null = null;
  for (let attempt = 1; attempt <= FETCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: gzip ? 'application/gzip,application/json,*/*' : 'application/json,*/*',
          'User-Agent': USER_AGENT,
        },
        signal: AbortSignal.timeout(60_000),
      });
      if (!response.ok) {
        throw new SourceDataError(`HTTP ${String(response.status)} downloading ${url}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      if (gzip) {
        return gunzipSync(buffer).toString('utf8');
      }
      return buffer.toString('utf8');
    } catch (error) {
      lastError = error instanceof Error ? error : 'Unknown download error';
      if (attempt < FETCH_MAX_ATTEMPTS) {
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
      }
    }
  }
  throw toError(lastError ?? 'Unknown download error');
}

async function fetchViaApidoni(token: string, cnpj: string): Promise<IbptGoldenFetchResult> {
  const cargas: IbptCargaRecord[] = [];
  const endpoints = [IBPT_OFFICIAL_PORTAL_URL, IBPT_APIDONI_PRODUTOS_URL];

  for (const uf of IBPT_GOLDEN_UFS) {
    for (const ncm of IBPT_GOLDEN_NCMS) {
      const url = buildApidoniUrl(ncm, uf, token, cnpj);
      endpoints.push(url);
      const raw = await fetchTextWithRetry(url, 3, 2000, 60_000, 'application/json,*/*');
      const payload = parseIbptApidoniPayload(raw);
      cargas.push(mapIbptApidoniToCarga(payload));
    }
  }

  return {
    cargas: sortIbptCargas(cargas),
    endpoints,
    source: 'apidoni',
  };
}

async function fetchViaValraw(): Promise<IbptGoldenFetchResult> {
  const metaUrl = `${IBPT_VALRAW_API_BASE_URL}/meta.json`;
  const metaRaw = await downloadBinary(metaUrl, false);
  const meta = parseJsonObject(metaRaw) as IbptMetaPayload;
  const endpoints = buildValrawEndpoints(meta);
  const { ano, tabela } = resolveLatestIbptTabela(meta);

  const cargas: IbptCargaRecord[] = [];
  for (const uf of IBPT_GOLDEN_UFS) {
    const url = `${IBPT_VALRAW_API_BASE_URL}/${String(ano)}/${tabela}/ncm/${uf}.json.gz`;
    const raw = await downloadBinary(url, true);
    const payload = parseJsonObject(raw) as IbptNcmPayload;
    cargas.push(...extractGoldenIbptCargas(payload, uf, IBPT_GOLDEN_NCMS));
  }

  return {
    cargas: sortIbptCargas(cargas),
    endpoints,
    source: 'valraw',
  };
}

async function readRepoMirror(): Promise<IbptCargaRecord[] | null> {
  try {
    const raw = await readFile(IBPT_MIRROR_PATH, 'utf8');
    const parsed = JSON.parse(raw) as string | number | boolean | object | null;
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed as IbptCargaRecord[];
  } catch {
    return null;
  }
}

async function writeRepoMirror(cargas: IbptCargaRecord[]): Promise<void> {
  await mkdir(path.dirname(IBPT_MIRROR_PATH), { recursive: true });
  await writeFile(IBPT_MIRROR_PATH, `${JSON.stringify(cargas, null, 2)}\n`);
}

function sortIbptCargas(cargas: IbptCargaRecord[]): IbptCargaRecord[] {
  return [...cargas].sort((left, right) => {
    const byUf = left.uf.localeCompare(right.uf);
    if (byUf !== 0) {
      return byUf;
    }
    return left.ncm.localeCompare(right.ncm);
  });
}

export async function fetchIbptGoldenCargas(): Promise<IbptGoldenFetchResult> {
  const token = process.env.IBPT_TOKEN ?? '';
  const cnpj = process.env.IBPT_CNPJ ?? '';

  if (token.length > 0 && cnpj.length > 0) {
    try {
      const apidoni = await fetchViaApidoni(token, cnpj);
      await writeRepoMirror(apidoni.cargas);
      return apidoni;
    } catch {
      // Fall through to valraw / repo mirror.
    }
  }

  try {
    const valraw = await fetchViaValraw();
    await writeRepoMirror(valraw.cargas);
    return valraw;
  } catch {
    const mirror = await readRepoMirror();
    if (mirror !== null && mirror.length > 0) {
      return {
        cargas: sortIbptCargas(mirror),
        endpoints: [...buildIbptCandidateEndpoints()],
        source: 'repo_mirror',
      };
    }
    throw new SourceDataError(
      'IBPT golden subset unavailable — apidoni, valraw, and repo mirror all failed',
    );
  }
}

export function ibptSuccessMessage(source: IbptGoldenSource): string {
  if (source === 'apidoni') {
    return 'IBPT golden NCM×UF subset fetched via official apidoni API.';
  }
  if (source === 'valraw') {
    return 'IBPT golden NCM×UF subset fetched via valraw community mirror.';
  }
  return 'IBPT golden NCM×UF subset loaded from repo cache after network sources failed.';
}

export function ibptRepoMirrorWarning(source: IbptGoldenSource): string | null {
  if (source === 'repo_mirror') {
    return 'Official IBPT hosts were blocked from CI — embedded data refreshed from repo mirror.';
  }
  if (source === 'valraw') {
    return 'Official apidoni credentials not configured — used valraw community mirror.';
  }
  return null;
}

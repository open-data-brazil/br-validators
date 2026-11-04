import { decodeTextBuffer } from './decode-text.js';
import { FETCH_MAX_ATTEMPTS, FETCH_RETRY_DELAY_MS } from './fetch-retry-config.js';

const DEFAULT_TIMEOUT_MS = 30_000;
export const CONFAZ_HTML_TIMEOUT_MS = 60_000;
export const USER_AGENT =
  'br-validators-data-refresh/1.0 (+https://github.com/AlexandreZanata/br-validators)';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class FetchError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status?: number,
    /** Low-level network code from undici (`error.cause.code`), e.g. `UND_ERR_CONNECT_TIMEOUT`. */
    readonly causeCode?: string,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Hosts that drop TCP connections from the CI network (IBGE servicodados blocks
 * GitHub-hosted runners) never recover within a run — retrying them 5× with 2 min
 * pauses only burns ~10 min per dataset.
 */
const CONNECT_BLOCKED_CODES = new Set([
  'UND_ERR_CONNECT_TIMEOUT',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ENOTFOUND',
]);
export const CONNECT_BLOCKED_MAX_ATTEMPTS = 2;

export function isConnectBlocked(error: unknown): boolean {
  return error instanceof FetchError && error.causeCode !== undefined && CONNECT_BLOCKED_CODES.has(error.causeCode);
}

function networkCauseCode(error: unknown): string | undefined {
  if (!(error instanceof Error) || typeof error.cause !== 'object' || error.cause === null) {
    return undefined;
  }
  const code = (error.cause as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}

export async function fetchText(
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  accept = 'text/csv,text/plain,*/*',
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: accept,
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new FetchError(`HTTP ${String(response.status)} fetching ${url}`, url, response.status);
    }

    return decodeTextBuffer(new Uint8Array(await response.arrayBuffer()));
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchError(`Timeout after ${String(timeoutMs)}ms`, url);
    }
    throw new FetchError(
      error instanceof Error ? error.message : 'Unknown fetch error',
      url,
      undefined,
      networkCauseCode(error),
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new FetchError(`HTTP ${String(response.status)} fetching ${url}`, url, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchError(`Timeout after ${String(timeoutMs)}ms`, url);
    }
    throw new FetchError(
      error instanceof Error ? error.message : 'Unknown fetch error',
      url,
      undefined,
      networkCauseCode(error),
    );
  } finally {
    clearTimeout(timer);
  }
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchWithRetry<T>(
  fetchOnce: () => Promise<T>,
  attempts: number,
  delayMs: number,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchOnce();
    } catch (error) {
      lastError = error;
      if (isConnectBlocked(error) && attempt >= CONNECT_BLOCKED_MAX_ATTEMPTS) {
        break;
      }
      if (attempt < attempts) {
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

export async function fetchTextWithRetry(
  url: string,
  attempts = FETCH_MAX_ATTEMPTS,
  delayMs = FETCH_RETRY_DELAY_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  accept = 'text/csv,text/plain,*/*',
): Promise<string> {
  return fetchWithRetry(() => fetchText(url, timeoutMs, accept), attempts, delayMs);
}

export async function fetchJsonWithRetry<T>(
  url: string,
  attempts = FETCH_MAX_ATTEMPTS,
  delayMs = FETCH_RETRY_DELAY_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  return fetchWithRetry(() => fetchJson<T>(url, timeoutMs), attempts, delayMs);
}

export async function probeUrl(
  url: string,
  attempts = FETCH_MAX_ATTEMPTS,
  delayMs = FETCH_RETRY_DELAY_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    await fetchWithRetry(async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
      }, timeoutMs);
      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            Accept: '*/*',
            'User-Agent': USER_AGENT,
          },
        });
        if (!response.ok) {
          throw new FetchError(`HTTP ${String(response.status)} probing ${url}`, url, response.status);
        }
      } finally {
        clearTimeout(timer);
      }
    }, attempts, delayMs);
    return { ok: true };
  } catch (error) {
    if (error instanceof FetchError) {
      return { ok: false, status: error.status, error: error.message };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown probe error',
    };
  }
}

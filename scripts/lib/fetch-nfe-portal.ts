import { FETCH_MAX_ATTEMPTS, FETCH_RETRY_DELAY_MS } from './fetch-retry-config.js';
import { FetchError, sleep, USER_AGENT } from './fetch-utils.js';
import { parseNfePaisesTable } from './parse-nfe-paises.js';

export const NFE_PORTAL_ORIGIN = 'http://www.nfe.fazenda.gov.br';

function readSetCookieHeaders(response: Response): string[] {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie();
  }
  const single = response.headers.get('set-cookie');
  return single === null ? [] : [single];
}

function applySetCookies(jar: Map<string, string>, response: Response): void {
  const setCookies = readSetCookieHeaders(response);
  for (const raw of setCookies) {
    const [pair] = raw.split(';');
    const eq = pair.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}

function cookieHeader(jar: Map<string, string>): string {
  return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join('; ');
}

export function resolvePortalRedirect(baseUrl: string, location: string): string {
  if (location.startsWith('http://') || location.startsWith('https://')) {
    return location;
  }
  const origin = new URL(baseUrl).origin;
  return location.startsWith('/') ? `${origin}${location}` : `${origin}/${location}`;
}

export function isHtmlPayload(text: string): boolean {
  return /^\s*<\s*(!DOCTYPE\s+)?html/i.test(text.slice(0, 500));
}

export function discoverNfeConteudoUrls(html: string): string[] {
  const discovered = new Set<string>();
  const pattern = /exibirArquivo\.aspx\?conteudo=([A-Za-z0-9+/=_%-]+)/g;
  for (const match of html.matchAll(pattern)) {
    const conteudo = match[1];
    if (conteudo.length === 0) {
      continue;
    }
    discovered.add(`${NFE_PORTAL_ORIGIN}/portal/exibirArquivo.aspx?conteudo=${conteudo}`);
  }
  return [...discovered];
}

export async function fetchTextAspNetPortal(
  url: string,
  timeoutMs = 30_000,
  maxRedirects = 10,
): Promise<{ text: string; finalUrl: string }> {
  const jar = new Map<string, string>();
  let current = url;

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const headers: Record<string, string> = {
        Accept: 'text/csv,text/plain,*/*',
        'User-Agent': USER_AGENT,
      };
      const cookie = cookieHeader(jar);
      if (cookie.length > 0) {
        headers.Cookie = cookie;
      }

      const response = await fetch(current, {
        signal: controller.signal,
        headers,
        redirect: 'manual',
      });
      applySetCookies(jar, response);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location === null || location.length === 0) {
          throw new FetchError('Redirect without location header', current, response.status);
        }
        current = resolvePortalRedirect(current, location);
        continue;
      }

      if (!response.ok) {
        throw new FetchError(`HTTP ${String(response.status)} fetching ${current}`, current, response.status);
      }

      const text = await response.text();
      return { text, finalUrl: current };
    } catch (error) {
      if (error instanceof FetchError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new FetchError(`Timeout after ${String(timeoutMs)}ms`, current);
      }
      throw new FetchError(error instanceof Error ? error.message : 'Unknown fetch error', current);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new FetchError(`Max redirects (${String(maxRedirects)}) exceeded`, url);
}

export async function fetchNfePaisesTableText(
  primaryUrl: string,
  minRecords: number,
  attempts = FETCH_MAX_ATTEMPTS,
  delayMs = FETCH_RETRY_DELAY_MS,
): Promise<{ text: string; attemptsUsed: number }> {
  const candidateUrls = [primaryUrl];
  let lastError: FetchError | null = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    for (const url of candidateUrls) {
      try {
        const { text, finalUrl } = await fetchTextAspNetPortal(url);
        if (isHtmlPayload(text)) {
          for (const discovered of discoverNfeConteudoUrls(text)) {
            if (!candidateUrls.includes(discovered)) {
              candidateUrls.push(discovered);
            }
          }
          throw new FetchError('Portal returned HTML instead of a country table file', finalUrl);
        }

        const parsedCount = parseNfePaisesTable(text).length;
        if (parsedCount < minRecords) {
          throw new FetchError(
            `Portal payload has ${String(parsedCount)} countries; expected at least ${String(minRecords)}`,
            finalUrl,
          );
        }

        return { text, attemptsUsed: attempt };
      } catch (error) {
        lastError =
          error instanceof FetchError
            ? error
            : new FetchError(error instanceof Error ? error.message : 'Unknown fetch error', url);
      }
    }

    if (attempt < attempts) {
      await sleep(delayMs);
    }
  }

  throw lastError ?? new FetchError('NF-e portal fetch failed', primaryUrl);
}

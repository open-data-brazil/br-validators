import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FETCH_MAX_ATTEMPTS, FETCH_RETRY_DELAY_MS } from './fetch-retry-config.js';
import {
  CONFAZ_HTML_TIMEOUT_MS,
  FetchError,
  fetchTextWithRetry,
  USER_AGENT,
} from './fetch-utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const MIRROR_ROOT = path.join(ROOT, 'data/source-mirrors/confaz');

export type ConfazHtmlSource = 'official' | 'repo_mirror';

export interface ConfazHtmlFetchResult {
  html: string;
  source: ConfazHtmlSource;
  endpoints: string[];
}

async function fetchOfficialConfazHtml(officialUrl: string): Promise<string> {
  return fetchTextWithRetry(
    officialUrl,
    FETCH_MAX_ATTEMPTS,
    FETCH_RETRY_DELAY_MS,
    CONFAZ_HTML_TIMEOUT_MS,
    'text/html,application/xhtml+xml,*/*',
  );
}

async function readRepoMirror(mirrorFileName: string): Promise<string | null> {
  try {
    const raw = await readFile(path.join(MIRROR_ROOT, mirrorFileName), 'utf8');
    return raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

async function writeRepoMirror(mirrorFileName: string, html: string): Promise<void> {
  await mkdir(MIRROR_ROOT, { recursive: true });
  await writeFile(path.join(MIRROR_ROOT, mirrorFileName), html);
}

export async function fetchConfazHtml(
  officialUrl: string,
  mirrorFileName: string,
): Promise<ConfazHtmlFetchResult> {
  const mirrorPath = path.join(MIRROR_ROOT, mirrorFileName);

  try {
    const html = await fetchOfficialConfazHtml(officialUrl);
    await writeRepoMirror(mirrorFileName, html);
    return { html, source: 'official', endpoints: [officialUrl, mirrorPath] };
  } catch (officialError) {
    const mirrorHtml = await readRepoMirror(mirrorFileName);
    if (mirrorHtml !== null) {
      return {
        html: mirrorHtml,
        source: 'repo_mirror',
        endpoints: [officialUrl, mirrorPath],
      };
    }
    if (officialError instanceof FetchError) {
      throw officialError;
    }
    throw officialError instanceof Error ? officialError : new Error('CONFAZ fetch failed');
  }
}

export { USER_AGENT };

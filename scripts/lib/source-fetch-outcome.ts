import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { FetchError } from './fetch-utils.js';
import { FETCH_RETRY_DELAY_MS } from './fetch-retry-config.js';

export { FETCH_MAX_ATTEMPTS, FETCH_RETRY_DELAY_MS } from './fetch-retry-config.js';

export type SourceFetchStatus =
  | 'ok'
  | 'embedded_retained'
  | 'source_unavailable'
  | 'source_blocked'
  | 'source_empty'
  | 'dependency_failed';

export type SourceFailureKind =
  | 'link_deprecated'
  | 'source_blocked'
  | 'parse_error'
  | 'auth_missing';

export interface SourceFetchOutcome {
  datasetId: string;
  status: SourceFetchStatus;
  endpoints: string[];
  attempts: number;
  checkedAt: string;
  retainedEmbeddedDataFrom: string | null;
  message: string;
  httpStatus?: number;
  failureKind?: SourceFailureKind;
  attemptedEndpoints?: string[];
}

export interface SourceAlert {
  datasetId: string;
  severity: 'warning' | 'critical';
  status: Exclude<SourceFetchStatus, 'ok'>;
  message: string;
  endpoints: string[];
  retainedEmbeddedDataFrom: string | null;
  documentationAction: string;
  consecutiveFailureDays?: number;
}

const DOC_MAINTENANCE =
  'See docs/DATA-SOURCE-MAINTENANCE.md — update `docs/OFFICIAL-SOURCES.md`, the fetch script endpoint(s), and `metadata.json`, then run `pnpm data:refresh` locally.';

export class SourceDataError extends Error {
  constructor(
    message: string,
    readonly status: Exclude<SourceFetchStatus, 'ok'> = 'source_empty',
    readonly httpStatus?: number,
  ) {
    super(message);
    this.name = 'SourceDataError';
  }
}

function classifyFailureKind(error: unknown): SourceFailureKind {
  if (error instanceof FetchError) {
    if (error.status === 404) {
      return 'link_deprecated';
    }
    if (error.status === 403 || error.status === 429) {
      return 'source_blocked';
    }
    if (error.message.includes('fetch failed') || error.message.includes('Timeout')) {
      return 'source_blocked';
    }
  }
  if (error instanceof SourceDataError) {
    return 'parse_error';
  }
  if (error instanceof Error && error.message.includes('fetch failed')) {
    return 'source_blocked';
  }
  return 'link_deprecated';
}

function classifySourceError(error: unknown): Exclude<SourceFetchStatus, 'ok'> {
  const failureKind = classifyFailureKind(error);
  if (failureKind === 'source_blocked') {
    return 'source_blocked';
  }
  if (error instanceof SourceDataError) {
    return error.status;
  }
  if (error instanceof FetchError && error.status === 404) {
    return 'source_unavailable';
  }
  if (error instanceof Error && error.message.includes('dependency')) {
    return 'dependency_failed';
  }
  return 'source_unavailable';
}

function buildFailureDetailMessage(failureKind: SourceFailureKind, detail: string): string {
  if (failureKind === 'source_blocked') {
    return `Source blocked or unreachable from CI network — not link deprecation (${detail})`;
  }
  if (failureKind === 'parse_error') {
    return `Official source responded but data was not parseable (${detail})`;
  }
  if (failureKind === 'auth_missing') {
    return `Official API credentials missing (${detail})`;
  }
  return `Possible link deprecation (${detail})`;
}

export function buildFailureOutcome(
  datasetId: string,
  endpoints: string[],
  retainedEmbeddedDataFrom: string | null,
  error: unknown,
  attempts: number,
  attemptedEndpoints?: string[],
): SourceFetchOutcome {
  const httpStatus = error instanceof FetchError ? error.status : undefined;
  const failureKind = classifyFailureKind(error);
  const status = classifySourceError(error);
  const detail = error instanceof Error ? error.message : 'Unknown fetch error';
  const retainedLabel = retainedEmbeddedDataFrom ?? 'unknown date';
  const retryDelayMs = FETCH_RETRY_DELAY_MS;
  const classifiedDetail = buildFailureDetailMessage(failureKind, detail);
  const message =
    status === 'dependency_failed'
      ? `${detail} Embedded data from ${retainedLabel} retained in the API.`
      : `${classifiedDetail}. No new data after ${String(attempts)} attempts (interval ${String(retryDelayMs)}ms) — embedded data from ${retainedLabel} retained in the API.`;

  const allEndpoints = attemptedEndpoints ?? endpoints;

  return {
    datasetId,
    status,
    endpoints: allEndpoints,
    attempts,
    checkedAt: new Date().toISOString(),
    retainedEmbeddedDataFrom,
    message,
    failureKind,
    attemptedEndpoints: allEndpoints,
    ...(httpStatus === undefined ? {} : { httpStatus }),
  };
}

export function buildEmbeddedFallbackOutcome(
  datasetId: string,
  endpoints: string[],
  retainedEmbeddedDataFrom: string | null,
  attempts: number,
  detail: string,
): SourceFetchOutcome {
  const retainedLabel = retainedEmbeddedDataFrom ?? 'unknown date';
  return {
    datasetId,
    status: 'embedded_retained',
    endpoints,
    attempts,
    checkedAt: new Date().toISOString(),
    retainedEmbeddedDataFrom,
    message: `${detail} Embedded data from ${retainedLabel} retained in the API.`,
  };
}

export function toSourceAlert(outcome: SourceFetchOutcome): SourceAlert | null {
  if (outcome.status === 'ok') {
    return null;
  }
  return {
    datasetId: outcome.datasetId,
    severity: 'warning',
    status: outcome.status,
    message: outcome.message,
    endpoints: outcome.endpoints,
    retainedEmbeddedDataFrom: outcome.retainedEmbeddedDataFrom,
    documentationAction: DOC_MAINTENANCE,
  };
}

export async function writeSourceFetchOutcome(
  outcomeDir: string,
  outcome: SourceFetchOutcome,
): Promise<void> {
  await mkdir(outcomeDir, { recursive: true });
  const filePath = path.join(outcomeDir, `${outcome.datasetId}.json`);
  await writeFile(filePath, `${JSON.stringify(outcome, null, 2)}\n`);
}

export async function readSourceFetchOutcomes(
  outcomeDir: string,
  datasetIds: readonly string[],
): Promise<SourceFetchOutcome[]> {
  const { readFile } = await import('node:fs/promises');
  const outcomes: SourceFetchOutcome[] = [];

  for (const datasetId of datasetIds) {
    try {
      const raw = await readFile(path.join(outcomeDir, `${datasetId}.json`), 'utf8');
      outcomes.push(JSON.parse(raw) as SourceFetchOutcome);
    } catch {
      // No outcome file — fetch step did not run or dataset has no HTTP source.
    }
  }

  return outcomes;
}

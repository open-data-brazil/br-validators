/** Parsed semver for human releases (1.8.3) or bot data releases (1.8.3-data.0001). */
export interface ParsedPublishVersion {
  major: number;
  minor: number;
  patch: number;
  /** Set when version is a daily data refresh build (`-data.NNNN`). */
  dataSeq: number | null;
}

const HUMAN_VERSION_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const DATA_VERSION_RE = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-data\.(\d+)$/;

function readMatchInt(groups: RegExpMatchArray, index: number): number {
  return Number(groups[index]);
}

/** Parse a publishable package version (human or bot data line). */
export function parsePublishVersion(version: string): ParsedPublishVersion | null {
  const dataMatch = DATA_VERSION_RE.exec(version);
  if (dataMatch !== null) {
    return {
      major: readMatchInt(dataMatch, 1),
      minor: readMatchInt(dataMatch, 2),
      patch: readMatchInt(dataMatch, 3),
      dataSeq: readMatchInt(dataMatch, 4),
    };
  }

  const humanMatch = HUMAN_VERSION_RE.exec(version);
  if (humanMatch !== null) {
    return {
      major: readMatchInt(humanMatch, 1),
      minor: readMatchInt(humanMatch, 2),
      patch: readMatchInt(humanMatch, 3),
      dataSeq: null,
    };
  }

  return null;
}

function formatDataSeq(seq: number): string {
  return String(seq).padStart(4, '0');
}

/**
 * Next version for the daily data refresh bot.
 *
 * Human release `1.8.3` → first data drift → `1.8.3-data.0001` (not `1.8.4`).
 * Subsequent bot runs → `1.8.3-data.0002`, …
 * Next human release `1.8.4` → bot resets counter → `1.8.4-data.0001`.
 */
export function bumpDataVersion(current: string): string {
  const parsed = parsePublishVersion(current);
  if (parsed === null) {
    throw new Error(`Invalid publish version: ${current}`);
  }

  if (parsed.dataSeq !== null) {
    const nextSeq = parsed.dataSeq + 1;
    return `${String(parsed.major)}.${String(parsed.minor)}.${String(parsed.patch)}-data.${formatDataSeq(nextSeq)}`;
  }

  return `${String(parsed.major)}.${String(parsed.minor)}.${String(parsed.patch)}-data.0001`;
}

/** Human-readable label for CHANGELOG / bot summaries. */
export function formatDataVersionLabel(version: string): string {
  const parsed = parsePublishVersion(version);
  if (parsed === null || parsed.dataSeq === null) {
    return version;
  }
  return `${String(parsed.major)}.${String(parsed.minor)}.${String(parsed.patch)} data #${formatDataSeq(parsed.dataSeq)}`;
}

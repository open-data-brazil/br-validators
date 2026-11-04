/**
 * Insert the daily bot's data-release entry into CHANGELOG.md.
 *
 * Anything already under `## [Unreleased]` ships in this release, so it moves into
 * the new version section. The bot bullet joins an existing `### Changed` list
 * instead of adding a second `### Changed` heading (v1.10.1-data.34 had two).
 */

const UNRELEASED_HEADING = '## [Unreleased]';
const CHANGED_HEADING = '### Changed';
/** Heading on its own line — not the same text quoted inside a bullet. */
const CHANGED_HEADING_LINE = /^### Changed[ \t]*$/mu;

export function insertDataReleaseEntry(
  changelog: string,
  entry: { version: string; date: string; bullet: string },
): string {
  const start = changelog.indexOf(UNRELEASED_HEADING);
  if (start === -1) {
    throw new Error('CHANGELOG.md has no "## [Unreleased]" section');
  }
  const bodyStart = start + UNRELEASED_HEADING.length;
  const nextSection = changelog.indexOf('\n## ', bodyStart);
  const bodyEnd = nextSection === -1 ? changelog.length : nextSection + 1;
  const unreleased = changelog.slice(bodyStart, bodyEnd).trim();

  let merged: string;
  const changedMatch = CHANGED_HEADING_LINE.exec(unreleased);
  if (changedMatch === null) {
    merged = [`${CHANGED_HEADING}\n\n${entry.bullet}`, unreleased].filter((part) => part !== '').join('\n\n');
  } else {
    const listStart = changedMatch.index + changedMatch[0].length;
    merged = `${unreleased.slice(0, listStart)}\n\n${entry.bullet}\n${unreleased.slice(listStart).replace(/^\n+/u, '')}`;
  }

  const section = `## [${entry.version}] - ${entry.date}\n\n${merged.trimEnd()}\n\n`;
  return `${changelog.slice(0, start)}${UNRELEASED_HEADING}\n\n${section}${changelog.slice(bodyEnd)}`;
}

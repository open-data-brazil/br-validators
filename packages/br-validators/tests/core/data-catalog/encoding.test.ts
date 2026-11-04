import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../src');
const REPLACEMENT_CHAR = '�';

/**
 * ANTAQ publishes Portos.xlsx with U+FFFD already in place of accented letters;
 * scripts/fetch-portos.ts repairs what it can. Proper nouns it cannot resolve stay
 * flagged — this ceiling only lets that number go down.
 */
const KNOWN_SOURCE_DAMAGE: Record<string, number> = {
  'portos/data/portos.json': 20,
};

function listDataJsonFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      return listDataJsonFiles(fullPath);
    }
    return fullPath.endsWith('.json') && fullPath.includes('/data/') ? [fullPath] : [];
  });
}

function countDamagedStrings(value: unknown): number {
  if (typeof value === 'string') {
    return value.includes(REPLACEMENT_CHAR) ? 1 : 0;
  }
  if (Array.isArray(value)) {
    return value.reduce<number>((total, item) => total + countDamagedStrings(item), 0);
  }
  if (value !== null && typeof value === 'object') {
    return Object.values(value).reduce<number>((total, item) => total + countDamagedStrings(item), 0);
  }
  return 0;
}

describe('embedded datasets — text encoding', () => {
  const files = listDataJsonFiles(SRC_DIR);

  it('finds the embedded dataset files', () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it.each(files.map((file) => [relative(SRC_DIR, file)]))(
    '%s has no U+FFFD replacement characters (ISO-8859-1 sources must be decoded)',
    (file) => {
      const damaged = countDamagedStrings(JSON.parse(readFileSync(join(SRC_DIR, file), 'utf8')));
      expect(damaged).toBeLessThanOrEqual(KNOWN_SOURCE_DAMAGE[file] ?? 0);
    },
  );
});

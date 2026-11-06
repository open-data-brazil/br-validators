/**
 * Repair text where every non-ASCII letter was replaced by U+FFFD at the source
 * (e.g. ANTAQ Portos.xlsx: "Alvar�es", "Instala��o").
 *
 * A dictionary word is indexed by its "skeleton" — lowercase, with each non-ASCII
 * character replaced by U+FFFD. A damaged token is repaired only when its skeleton
 * maps to exactly one word (or one preferred word); otherwise it is left untouched.
 */

const REPLACEMENT_CHAR = '�';
const DAMAGED_TOKEN_PATTERN = /[\p{L}�]*�[\p{L}�]*/gu;
const NON_ASCII_PATTERN = /\P{ASCII}/gu;

export interface RepairDictionary {
  readonly bySkeleton: ReadonlyMap<string, ReadonlySet<string>>;
  readonly preferred: ReadonlySet<string>;
  /** Every dictionary word (ASCII included), lowercase. */
  readonly known: ReadonlySet<string>;
}

function skeletonOf(word: string): string {
  return word.toLowerCase().replace(NON_ASCII_PATTERN, REPLACEMENT_CHAR);
}

export function buildRepairDictionary(
  words: Iterable<string>,
  preferred: Iterable<string> = [],
): RepairDictionary {
  const bySkeleton = new Map<string, Set<string>>();
  const known = new Set<string>();
  for (const word of words) {
    const lower = word.toLowerCase();
    known.add(lower);
    if (!/\P{ASCII}/u.test(lower)) {
      continue;
    }
    const key = skeletonOf(lower);
    const bucket = bySkeleton.get(key) ?? new Set<string>();
    bucket.add(lower);
    bySkeleton.set(key, bucket);
  }
  return {
    bySkeleton,
    preferred: new Set([...preferred].map((word) => word.toLowerCase())),
    known,
  };
}

function pickCandidate(token: string, dictionary: RepairDictionary): string | null {
  const candidates = dictionary.bySkeleton.get(token.toLowerCase());
  if (candidates === undefined || candidates.size === 0) {
    return null;
  }
  if (candidates.size === 1) {
    return [...candidates][0];
  }
  const preferred = [...candidates].filter((word) => dictionary.preferred.has(word));
  return preferred.length === 1 ? preferred[0] : null;
}

function applyCase(token: string, candidate: string): string {
  const letters = token.replaceAll(REPLACEMENT_CHAR, '');
  const allUpper = letters.length > 1 && letters === letters.toUpperCase();
  const chars = Array.from(token);
  const repaired = Array.from(candidate);
  return chars
    .map((char, index) => {
      if (char !== REPLACEMENT_CHAR) {
        return char;
      }
      const restored = repaired[index];
      const nextChar = chars[index + 1];
      const capitalizeFirst =
        index === 0 && index + 1 < chars.length && nextChar === nextChar.toLowerCase();
      return allUpper || capitalizeFirst ? restored.toUpperCase() : restored;
    })
    .join('');
}

/** Returns the repaired text and how many damaged tokens could not be resolved. */
export function repairReplacementChars(
  value: string,
  dictionary: RepairDictionary,
): { text: string; unresolved: string[] } {
  if (!value.includes(REPLACEMENT_CHAR)) {
    return { text: value, unresolved: [] };
  }
  // Lone U+FFFD (not part of a word) stood for punctuation in the source:
  // trailing garbage ("Santos �"), an en dash between words, or the crase "à".
  const punctuated = value
    .replace(/(?<=[^\p{L}�])�+$/u, '')
    .replace(/(?<=\s)�(?=-)/gu, '')
    .replace(/(?<=\s)�(?=\s+\p{Ll})/gu, 'à')
    .replace(/(?<=\s)�(?=\s)/gu, '–')
    .trimEnd();
  const unresolved: string[] = [];
  const resolve = (token: string): string | null => {
    const candidate = pickCandidate(token, dictionary);
    if (candidate === null || Array.from(candidate).length !== Array.from(token).length) {
      return null;
    }
    return applyCase(token, candidate);
  };
  const text = punctuated.replace(DAMAGED_TOKEN_PATTERN, (token) => {
    const repaired = resolve(token);
    if (repaired !== null) {
      return repaired;
    }
    // Trailing U+FFFD after a complete word is a lost non-letter (NBSP, dash): drop it
    // only when what remains is a known word, e.g. "Janeiro\uFFFD" or "Itaja\uFFFD\uFFFD".
    let base = token;
    while (base.endsWith(REPLACEMENT_CHAR) && base.length > 1) {
      base = base.slice(0, -1);
      if (!base.includes(REPLACEMENT_CHAR) && dictionary.known.has(base.toLowerCase())) {
        return base;
      }
      const repairedBase = base.includes(REPLACEMENT_CHAR) ? resolve(base) : null;
      if (repairedBase !== null) {
        return repairedBase;
      }
    }
    unresolved.push(token);
    return token;
  });
  return { text, unresolved };
}

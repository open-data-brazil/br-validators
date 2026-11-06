/**
 * Mulberry32 PRNG — deterministic when seed is provided (BR-GENERATE-001).
 */
export type RandomSource = {
  next(): number;
  int(min: number, max: number): number;
  digit(): string;
  digits(count: number): string;
  letter(): string;
  pick<T>(items: readonly T[]): T;
};

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRandomSource(seed?: number): RandomSource {
  const nextFn = seed === undefined ? () => Math.random() : mulberry32(seed);

  return {
    next: nextFn,
    int(min: number, max: number): number {
      return Math.floor(nextFn() * (max - min + 1)) + min;
    },
    digit(): string {
      return String(Math.floor(nextFn() * 10));
    },
    digits(count: number): string {
      let out = '';
      for (let i = 0; i < count; i++) {
        out += this.digit();
      }
      return out;
    },
    letter(): string {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return letters.charAt(this.int(0, letters.length - 1));
    },
    pick<T>(items: readonly T[]): T {
      return items[this.int(0, items.length - 1)];
    },
  };
}

export function hasRepeatedChars(value: string): boolean {
  const first = value[0];
  for (let i = 1; i < value.length; i++) {
    if (value[i] !== first) {
      return false;
    }
  }
  return true;
}

export function computeLuhnCheckDigit(partial: string): string {
  let sum = 0;
  let double = true;
  for (let i = partial.length - 1; i >= 0; i--) {
    let digit = Number(partial.charAt(i));
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }
  return String((10 - (sum % 10)) % 10);
}

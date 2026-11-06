export type PlaygroundRng = () => number;

export function mulberry32(seed: number): PlaygroundRng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomDigits(rng: PlaygroundRng, count: number): string {
  let value = '';
  for (let index = 0; index < count; index++) {
    value += String(Math.floor(rng() * 10));
  }
  return value;
}

export function pickItem<T>(rng: PlaygroundRng, items: readonly T[]): T {
  const index = Math.floor(rng() * items.length);
  return items[index] ?? items[0];
}

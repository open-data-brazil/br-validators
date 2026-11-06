import { PIX_GOLDEN_EVP, validatePixKey } from '@br-validators/core';
import { mulberry32, type PlaygroundRng } from './random';

function seededUuidV4(rng: PlaygroundRng): string {
  const bytes = Array.from({ length: 16 }, () => Math.floor(rng() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function generatePixEvp(seed?: number): string {
  if (seed === undefined) {
    for (;;) {
      const value = globalThis.crypto.randomUUID();
      if (validatePixKey(value).ok) {
        return value;
      }
    }
  }

  const rng = mulberry32(seed);
  for (let attempt = 0; attempt < 80; attempt++) {
    const value = seededUuidV4(rng);
    if (validatePixKey(value).ok) {
      return value;
    }
  }

  return PIX_GOLDEN_EVP;
}

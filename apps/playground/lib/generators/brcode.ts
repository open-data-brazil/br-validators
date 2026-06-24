import { generate } from '@br-validators/core';

export function generateBrcode(seed?: number): string {
  return generate('brcode', { seed });
}

import { generate } from '@br-validators/core';

export function generateCnh(masked = false, seed?: number): string {
  return generate('cnh', { masked, seed });
}

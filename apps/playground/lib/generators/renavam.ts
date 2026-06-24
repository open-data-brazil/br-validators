import { generate } from '@br-validators/core';

export function generateRenavam(masked = false, seed?: number): string {
  return generate('renavam', { masked, seed });
}

import { generate } from '@br-validators/core';

export function generateBoletoDocument(masked: boolean, seed?: number): string {
  return generate('boleto', { masked, seed });
}

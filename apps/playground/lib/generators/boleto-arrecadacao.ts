import { generate } from '@br-validators/core';

export function generateBoletoArrecadacao(masked = false, seed?: number): string {
  return generate('boleto-arrecadacao', { masked, seed });
}

import { generate } from '@br-validators/core';

export function generateNfeChaveDocument(masked: boolean, seed?: number): string {
  return generate('nfe-chave', { masked, seed });
}

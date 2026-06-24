import { generate } from '@br-validators/core';

export function generateIeProdutorRural(masked = false, seed?: number): string {
  return generate('inscricao-estadual-produtor-rural', { masked, seed });
}

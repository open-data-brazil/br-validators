import { generate, type UfCode } from '@br-validators/core';

export function generateTituloEleitorDocument(uf: UfCode, masked: boolean, seed?: number): string {
  return generate('titulo-eleitor', {
    uf,
    masked,
    seed,
  });
}

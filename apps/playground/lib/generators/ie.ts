import {
  formatInscricaoEstadual,
  generate,
  type UfCode,
} from '@br-validators/core';

export function generateIeDocument(uf: UfCode, masked: boolean, seed?: number): string {
  return generate('inscricao-estadual', {
    uf,
    masked,
    seed,
  });
}

/** @deprecated Use generateIeDocument */
export function generateIe(uf: UfCode) {
  const raw = generate('inscricao-estadual', { uf, masked: false });
  return raw;
}

export { formatInscricaoEstadual as formatIeDocument };

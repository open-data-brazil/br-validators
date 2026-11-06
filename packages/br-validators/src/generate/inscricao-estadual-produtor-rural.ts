/**
 * Synthetic SP produtor rural IE — SINTEGRA cad_SP.html Bloco II (BR-GENERATE-001).
 * @see IE_SP_RURAL_OFFICIAL_SOURCE_URL in core/inscricao-estadual/constants.ts
 */
import { IE_SP_DV1_WEIGHTS, IE_SP_RURAL_GOLDEN } from '../core/inscricao-estadual/constants.js';
import { computeIeSpCheckDigit } from '../core/inscricao-estadual/modulo-ie.js';
import { validateIeSpRural } from '../core/inscricao-estadual/sp-rural.js';
import type { RandomSource } from './random.js';

const MAX_ATTEMPTS = 50;

export function generateIeProdutorRuralValue(
  rng: RandomSource,
  validate: (input: string) => { ok: boolean } = validateIeSpRural,
): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const dvInput = rng.digits(8);
    const dv = String(computeIeSpCheckDigit(dvInput, IE_SP_DV1_WEIGHTS));
    const suffix = rng.digits(3);
    const candidate = `P${dvInput}${dv}${suffix}`;

    if (validate(candidate).ok) {
      return candidate;
    }
  }

  return IE_SP_RURAL_GOLDEN;
}

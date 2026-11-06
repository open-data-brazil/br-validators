/**
 * Synthetic NF-e chave de acesso generation — MOC §2.2.6 (BR-GENERATE-001).
 * @see NFE_CHAVE_MOC_DV_SECTION_URL in core/nfe-chave/constants.ts
 */
import {
  NFE_CHAVE_GOLDEN_PRIMARY,
  NFE_IBGE_UF_CODES,
  NFE_MODELO_NFE,
} from '../core/nfe-chave/constants.js';
import { computeNfeChaveCheckDigit } from '../core/nfe-chave/dv.js';
import { validateNfeChave } from '../core/nfe-chave/index.js';
import type { RandomSource } from './random.js';

const MAX_ATTEMPTS = 80;
const NFE_UF_CODES = [...NFE_IBGE_UF_CODES] as number[];

export function generateNfeChaveValue(
  rng: RandomSource,
  validate: (input: string) => { ok: boolean } = validateNfeChave,
): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const cuf = String(rng.pick(NFE_UF_CODES)).padStart(2, '0');
    const aamm = rng.digits(4);
    const cnpj = rng.digits(14);
    const serie = rng.digits(3);
    const invoiceNumber = rng.digits(9);
    const emissionType = String(rng.int(0, 9));
    const numericCode = rng.digits(8);
    const base43 = `${cuf}${aamm}${cnpj}${NFE_MODELO_NFE}${serie}${invoiceNumber}${emissionType}${numericCode}`;
    const candidate = `${base43}${String(computeNfeChaveCheckDigit(base43))}`;

    if (validate(candidate).ok) {
      return candidate;
    }
  }

  return NFE_CHAVE_GOLDEN_PRIMARY;
}

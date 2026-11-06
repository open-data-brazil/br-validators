/**
 * Synthetic boleto cobrança (Situação 1) — FEBRABAN FB-0061/2021 (BR-GENERATE-001).
 * @see BOLETO_OFFICIAL_SOURCE_URL in core/boleto/constants.ts
 */
import {
  BOLETO_GOLDEN_LINHA_STRIPPED,
  BOLETO_CURRENCY_REAL,
} from '../core/boleto/constants.js';
import { convertCodigoBarrasToLinhaDigits } from '../core/boleto/convert.js';
import { computeModulo11BarcodeDv } from '../core/boleto/modulo11.js';
import { validateCodigoBarras } from '../core/boleto/codigo-barras.js';
import type { RandomSource } from './random.js';

const MAX_ATTEMPTS = 80;
const BANK_CODES = ['001', '033', '104', '237', '341', '756'] as const;

function buildBarcode(
  rng: RandomSource,
  validateBarcode: (input: string) => { ok: boolean },
): string | null {
  const bank = rng.pick(BANK_CODES);
  const fator = rng.digits(4);
  const valor = rng.digits(10);
  const freeField = rng.digits(25);
  const withoutDv = bank + BOLETO_CURRENCY_REAL + fator + valor + freeField;
  const dv = computeModulo11BarcodeDv(withoutDv);
  const barcode = `${bank}${BOLETO_CURRENCY_REAL}${String(dv)}${fator}${valor}${freeField}`;

  if (!validateBarcode(barcode).ok) {
    return null;
  }

  return barcode;
}

export function generateBoletoValue(
  rng: RandomSource,
  validateBarcode: (input: string) => { ok: boolean } = validateCodigoBarras,
): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const barcode = buildBarcode(rng, validateBarcode);
    if (barcode) {
      return convertCodigoBarrasToLinhaDigits(barcode);
    }
  }

  return BOLETO_GOLDEN_LINHA_STRIPPED;
}

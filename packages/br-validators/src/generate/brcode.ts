/**
 * Synthetic static PIX BR Code — Bacen Manual BR Code EMV TLV + CRC16 (BR-GENERATE-001).
 * @see BRCODE_OFFICIAL_SOURCE_URL in core/brcode/constants.ts
 */
import { BRCODE_GOLDEN_STATIC_EVP } from '../core/brcode/constants.js';
import { buildStaticPixBrCode } from '../core/brcode/build-static.js';
import { validateBrCode } from '../core/brcode/index.js';
import { generatePixEvpValue } from './pix.js';
import type { RandomSource } from './random.js';

const MAX_ATTEMPTS = 50;

const DEFAULT_MERCHANT_NAME = 'Merchant Test';
const DEFAULT_MERCHANT_CITY = 'BRASILIA';

export type GenerateBrcodeInput = {
  pixKey?: string;
  merchantName?: string;
  merchantCity?: string;
  amount?: string;
  txid?: string;
};

export function generateBrcodeValue(
  rng: RandomSource,
  input: GenerateBrcodeInput = {},
  validate: (payload: string) => { ok: boolean } = validateBrCode,
): string {
  const pixKey = input.pixKey ?? generatePixEvpValue(rng);
  const merchantName = input.merchantName ?? DEFAULT_MERCHANT_NAME;
  const merchantCity = input.merchantCity ?? DEFAULT_MERCHANT_CITY;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const payload = buildStaticPixBrCode({
      pixKey,
      merchantName,
      merchantCity,
      ...(input.amount ? { amount: input.amount } : {}),
      ...(input.txid ? { txid: input.txid } : {}),
    });

    if (validate(payload).ok) {
      return payload;
    }
  }

  return BRCODE_GOLDEN_STATIC_EVP;
}

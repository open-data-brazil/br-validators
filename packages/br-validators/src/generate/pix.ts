/**
 * Synthetic PIX EVP key generation — UUID v4 lowercase (BR-GENERATE-001).
 * @see PIX_DICT_API_SOURCE_URL in core/pix/constants.ts
 * @see https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html
 */
import { PIX_GOLDEN_EVP } from '../core/pix/constants.js';
import { validatePixEvpKey } from '../core/pix/evp.js';
import type { RandomSource } from './random.js';

const MAX_ATTEMPTS = 80;

function seededUuidV4(rng: RandomSource): string {
  const bytes = Array.from({ length: 16 }, () => rng.int(0, 255));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function generatePixEvpValue(
  rng: RandomSource,
  validate: (input: string) => { ok: boolean } = validatePixEvpKey,
): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = seededUuidV4(rng);
    if (validate(candidate).ok) {
      return candidate;
    }
  }
  return PIX_GOLDEN_EVP;
}

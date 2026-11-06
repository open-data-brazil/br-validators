/**
 * BR Code (PIX QR) payload parsing — EMV TLV + CRC16-CCITT.
 * @see https://www.bcb.gov.br/content/estabilidadefinanceira/spb_docs/ManualBRCode.pdf
 */
import type { BrCodeValidationResult } from '../../types/validation-result.js';
import { brandBrCodePayload } from '../../types/validation-result.js';
import { parseBrCodePayload } from './parse.js';

export {
  BRCODE_COUNTRY_CODE,
  BRCODE_CURRENCY_BRL,
  BRCODE_GOLDEN_COMPOSITE,
  BRCODE_GOLDEN_DYNAMIC_URL,
  BRCODE_GOLDEN_STATIC_CPF,
  BRCODE_GOLDEN_STATIC_EMAIL,
  BRCODE_GOLDEN_STATIC_EVP,
  BRCODE_OFFICIAL_SOURCE_URL,
  BRCODE_PAYLOAD_FORMAT_INDICATOR,
  BRCODE_PIX_GUI,
  BRCODE_PIX_INITIATION_MANUAL_URL,
} from './constants.js';
export { computeCrc16Ccitt, verifyBrCodeCrc } from './crc16.js';
export { buildStaticPixBrCode } from './build-static.js';
export type { StaticPixBrCodeInput } from './build-static.js';
export { normalizeBrCodePayload, parseBrCodePayload } from './parse.js';
export { findPixMerchantAccount, findTlvField, parseTlvSequence } from './tlv.js';
export type { TlvField, TlvParseResult } from './tlv.js';
export type { BrCodeParseResult, BrCodeParsedFields } from './parse.js';

export function isValidBrCode(input: string): boolean {
  return validateBrCode(input).ok;
}

export function parseBrCode(input: string): BrCodeValidationResult {
  const parsed = parseBrCodePayload(input);
  if (!parsed.ok) {
    return { ok: false, code: parsed.code, message: parsed.message };
  }

  const { fields, payload } = parsed;

  return {
    ok: true,
    value: brandBrCodePayload(payload),
    format: 'brcode',
    merchantName: fields.merchantName,
    merchantCity: fields.merchantCity,
    ...(fields.amount ? { amount: fields.amount } : {}),
    ...(fields.txid ? { txid: fields.txid } : {}),
    ...(fields.pixKey && fields.pixKeyType
      ? { pixKey: fields.pixKey, pixKeyType: fields.pixKeyType }
      : {}),
    ...(fields.pixInitiationUrl ? { pixInitiationUrl: fields.pixInitiationUrl } : {}),
  };
}

export function validateBrCode(input: string): BrCodeValidationResult {
  const parsed = parseBrCode(input);
  if (!parsed.ok) {
    return parsed;
  }

  if (!parsed.pixKey || !parsed.pixKeyType) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'BR Code validation requires a static PIX key (merchant account subfield 01)',
    };
  }

  return parsed;
}

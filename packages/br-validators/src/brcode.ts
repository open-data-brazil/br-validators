export {
  isValidBrCode,
  parseBrCode,
  validateBrCode,
  buildStaticPixBrCode,
  computeCrc16Ccitt,
  verifyBrCodeCrc,
  normalizeBrCodePayload,
  parseBrCodePayload,
  parseTlvSequence,
  findTlvField,
  findPixMerchantAccount,
  BRCODE_GOLDEN_COMPOSITE,
  BRCODE_GOLDEN_DYNAMIC_URL,
  BRCODE_GOLDEN_STATIC_CPF,
  BRCODE_GOLDEN_STATIC_EMAIL,
  BRCODE_GOLDEN_STATIC_EVP,
  BRCODE_OFFICIAL_SOURCE_URL,
  BRCODE_PIX_INITIATION_MANUAL_URL,
} from './core/brcode/index.js';
export type {
  BrCodeParseResult,
  BrCodeParsedFields,
  StaticPixBrCodeInput,
  TlvField,
  TlvParseResult,
} from './core/brcode/index.js';
export type { BrCodePayload, BrCodeValidationResult, PixKeyType } from './types/validation-result.js';

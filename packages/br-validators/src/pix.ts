export {
  detectPixKeyType,
  isValidPixKey,
  validatePixKey,
  validatePixCpfKey,
  validatePixCnpjKey,
  validatePixEmailKey,
  validatePixPhoneKey,
  validatePixEvpKey,
  PIX_GOLDEN_CPF,
  PIX_GOLDEN_CNPJ_NUMERIC,
  PIX_GOLDEN_CNPJ_ALPHANUMERIC,
  PIX_GOLDEN_EMAIL,
  PIX_GOLDEN_PHONE,
  PIX_GOLDEN_EVP,
  PIX_OFFICIAL_SOURCE_URL,
  PIX_DICT_API_SOURCE_URL,
} from './core/pix/index.js';
export type { DetectedPixKeyType, ValidatePixKeyOptions } from './core/pix/index.js';
export type {
  PixKey,
  PixKeyType,
  PixValidationResult,
  DocumentFormat,
  ValidationErrorCode,
} from './types/validation-result.js';

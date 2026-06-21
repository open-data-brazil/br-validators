export {
  detectCnpjFormat,
  isValidCnpj,
  isValidCnpjAlphanumeric,
  isValidCnpjNumeric,
  validateCnpj,
  CNPJ_GOLDEN_ALPHANUMERIC,
  CNPJ_GOLDEN_ALPHANUMERIC_MASKED,
  CNPJ_GOLDEN_NUMERIC,
  CNPJ_GOLDEN_NUMERIC_MASKED,
  CNPJ_OFFICIAL_SOURCE_URL,
} from './core/cnpj/index.js';
export { stripCnpj } from './strip/cnpj.js';
export { formatCnpj, formatCnpjAlphanumeric, formatCnpjNumeric } from './format/cnpj.js';
export type { Cnpj, DocumentFormat, FormatResult, ValidationErrorCode, ValidationResult } from './types/validation-result.js';

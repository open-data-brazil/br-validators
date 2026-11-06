export {
  isValidCnh,
  validateCnh,
  CNH_BASE_LENGTH,
  CNH_DV1_WEIGHTS,
  CNH_DV2_WEIGHTS,
  CNH_GOLDEN_DISCOUNT_CASE,
  CNH_GOLDEN_PRIMARY,
  CNH_GOLDEN_PRIMARY_DECORATED_INPUT,
  CNH_GOLDEN_SECONDARY,
  CNH_LENGTH,
  CNH_OFFICIAL_SOURCE_URL,
  CNH_SENATRAN_VALIDAR_URL,
} from './core/cnh/index.js';
export { stripCnh } from './strip/cnh.js';
export { formatCnh } from './format/cnh.js';
export type { Cnh, DocumentFormat, FormatResult, ValidationErrorCode, ValidationResult } from './types/validation-result.js';

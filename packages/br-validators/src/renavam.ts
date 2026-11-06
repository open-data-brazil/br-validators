export {
  isValidRenavam,
  validateRenavam,
  RENAVAM_BASE_LENGTH,
  RENAVAM_DV_WEIGHTS,
  RENAVAM_GOLDEN_DASH_INPUT,
  RENAVAM_GOLDEN_DV_ZERO,
  RENAVAM_GOLDEN_LEADING_ZEROS,
  RENAVAM_GOLDEN_PRIMARY,
  RENAVAM_GOLDEN_SECONDARY,
  RENAVAM_LENGTH,
  RENAVAM_OFFICIAL_SOURCE_URL,
  RENAVAM_SENATRAN_CONSULTA_URL,
} from './core/renavam/index.js';
export { stripRenavam } from './strip/renavam.js';
export { formatRenavam } from './format/renavam.js';
export type { Renavam, DocumentFormat, FormatResult, ValidationErrorCode, ValidationResult } from './types/validation-result.js';

export {
  isValidCep,
  validateCep,
  CEP_GOLDEN_PRIMARY,
  CEP_GOLDEN_PRIMARY_MASKED,
  CEP_GOLDEN_SECONDARY,
  CEP_OFFICIAL_SOURCE_URL,
} from './core/cep/index.js';
export { stripCep } from './strip/cep.js';
export { formatCep } from './format/cep.js';
export type { Cep, DocumentFormat, FormatResult, ValidationErrorCode, ValidationResult } from './types/validation-result.js';

export {
  isValidPisPasep,
  validatePisPasep,
  PIS_PASEP_GOLDEN_PRIMARY,
  PIS_PASEP_GOLDEN_PRIMARY_MASKED,
  PIS_PASEP_GOLDEN_SECONDARY,
  PIS_PASEP_OFFICIAL_SOURCE_URL,
} from './core/pis-pasep/index.js';
export { stripPisPasep } from './strip/pis-pasep.js';
export { formatPisPasep } from './format/pis-pasep.js';
export type {
  PisPasep,
  DocumentFormat,
  FormatResult,
  ValidationErrorCode,
  ValidationResult,
} from './types/validation-result.js';

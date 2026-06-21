export {
  convertPlacaToMercosul,
  detectPlacaFormat,
  isValidPlaca,
  isValidPlacaLegacy,
  isValidPlacaMercosul,
  validatePlaca,
  PLACA_GOLDEN_CONVERSION_FROM,
  PLACA_GOLDEN_CONVERSION_TO,
  PLACA_GOLDEN_LEGACY,
  PLACA_GOLDEN_MERCOSUL,
  PLACA_OFFICIAL_SOURCE_URL,
} from './core/placa/index.js';
export type { PlacaFormat } from './core/placa/detect.js';
export { stripPlaca } from './strip/placa.js';
export { formatPlaca } from './format/placa.js';
export type { Placa, DocumentFormat, FormatResult, ValidationErrorCode, ValidationResult } from './types/validation-result.js';

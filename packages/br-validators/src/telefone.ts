export {
  isValidTelefone,
  validateTelefone,
  ANATEL_DDDS,
  ANATEL_DDD_SET,
  TELEFONE_ANATEL_DDD_PANEL_URL,
  TELEFONE_GOLDEN_CELULAR,
  TELEFONE_GOLDEN_CELULAR_MASKED,
  TELEFONE_GOLDEN_FIXO,
  TELEFONE_GOLDEN_FIXO_MASKED,
  TELEFONE_OFFICIAL_SOURCE_URL,
  getDddInfo,
  TELEFONE_DDD_DATA_VERSION,
} from './core/telefone/index.js';
export type { DddInfo, TelefoneDddDataVersion } from './core/telefone/ddd-types.js';
export { extractTelefoneDigits, normalizeTelefoneDigits, stripTelefone } from './strip/telefone.js';
export { formatTelefone } from './format/telefone.js';
export type {
  DocumentFormat,
  FormatResult,
  Telefone,
  TelefoneTipo,
  TelefoneValidationResult,
  ValidationErrorCode,
} from './types/validation-result.js';

export {
  isValidCep,
  validateCep,
  CEP_GOLDEN_PRIMARY,
  CEP_GOLDEN_PRIMARY_MASKED,
  CEP_GOLDEN_SECONDARY,
  CEP_OFFICIAL_SOURCE_URL,
  CEP_FAIXA_CNEFE_BASE_URL,
  CEP_FAIXA_GOLDEN_PREFIX_RJ,
  CEP_FAIXA_GOLDEN_PREFIX_SP,
  CEP_FAIXA_MAX_PREFIXES,
  CEP_FAIXA_MIN_PREFIXES,
  getCepFaixaInfo,
  getCepFaixas,
  CEP_FAIXA_DATA_VERSION,
} from './core/cep/index.js';
export type { CepFaixa, CepFaixaDataVersion } from './core/cep/faixa-types.js';
export { stripCep } from './strip/cep.js';
export { formatCep } from './format/cep.js';
export type { Cep, DocumentFormat, FormatResult, ValidationErrorCode, ValidationResult } from './types/validation-result.js';

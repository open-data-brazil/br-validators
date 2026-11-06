export {
  isValidProcessoJudicial,
  validateProcessoJudicial,
  parseProcessoJudicial,
  parseProcessoJudicialParts,
  computeProcessoJudicialCheckDigits,
  isValidProcessoJudicialCheckDigits,
  PROCESSO_JUDICIAL_ANEXO_VIII_URL,
  PROCESSO_JUDICIAL_ANO_LENGTH,
  PROCESSO_JUDICIAL_DV_LENGTH,
  PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
  PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
  PROCESSO_JUDICIAL_GOLDEN_SECONDARY,
  PROCESSO_JUDICIAL_GOLDEN_SECONDARY_MASKED,
  PROCESSO_JUDICIAL_GOLDEN_TJSP,
  PROCESSO_JUDICIAL_GOLDEN_TJSP_MASKED,
  PROCESSO_JUDICIAL_LENGTH,
  PROCESSO_JUDICIAL_MASKED_PATTERN,
  PROCESSO_JUDICIAL_MAX_SEGMENTO,
  PROCESSO_JUDICIAL_MIN_SEGMENTO,
  PROCESSO_JUDICIAL_NUMERIC_PATTERN,
  PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL,
  PROCESSO_JUDICIAL_ORIGEM_LENGTH,
  PROCESSO_JUDICIAL_SEGMENTO_LENGTH,
  PROCESSO_JUDICIAL_SEQUENCIAL_LENGTH,
  PROCESSO_JUDICIAL_TRIBUNAL_LENGTH,
} from './core/processo-judicial/index.js';
export { stripProcessoJudicial } from './strip/processo-judicial.js';
export { formatProcessoJudicial } from './format/processo-judicial.js';
export type {
  ProcessoJudicial,
  DocumentFormat,
  FormatResult,
  ValidationErrorCode,
  ValidationResult,
} from './types/validation-result.js';
export type { ProcessoJudicialSegments, ProcessoJudicialValidationResult } from './core/processo-judicial/types.js';

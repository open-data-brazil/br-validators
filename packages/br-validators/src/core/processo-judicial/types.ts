import type { ProcessoJudicial, ValidationErrorCode } from '../../types/validation-result.js';

export type ProcessoJudicialSegments = {
  sequencial: string;
  checkDigits: string;
  ano: string;
  segmentoJustica: string;
  tribunal: string;
  origem: string;
};

export type ProcessoJudicialValidationResult =
  | { ok: true; value: ProcessoJudicial; format: 'numeric'; segments: ProcessoJudicialSegments }
  | { ok: false; code: ValidationErrorCode; message: string };

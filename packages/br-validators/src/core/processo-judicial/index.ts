/**
 * Processo judicial CNJ (número único) — modulo 97-10 per Resolução 65/2008 Anexo VIII.
 * @see https://atos.cnj.jus.br/atos/detalhar/119
 */
import { stripProcessoJudicial } from '../../strip/processo-judicial.js';
import { brandProcessoJudicial } from '../../types/validation-result.js';
import { isValidProcessoJudicialCheckDigits } from './check-digits.js';
import {
  PROCESSO_JUDICIAL_LENGTH,
  PROCESSO_JUDICIAL_MAX_SEGMENTO,
  PROCESSO_JUDICIAL_MIN_SEGMENTO,
} from './constants.js';
import { parseProcessoJudicialParts } from './parse.js';
import type { ProcessoJudicialSegments, ProcessoJudicialValidationResult } from './types.js';

export {
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
} from './constants.js';
export { computeProcessoJudicialCheckDigits, isValidProcessoJudicialCheckDigits } from './check-digits.js';
export { parseProcessoJudicialParts } from './parse.js';
export type { ProcessoJudicialSegments, ProcessoJudicialValidationResult } from './types.js';

type FailedResult = Extract<ProcessoJudicialValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

function isValidSegmento(segmentoJustica: string): boolean {
  const code = Number(segmentoJustica);
  return code >= PROCESSO_JUDICIAL_MIN_SEGMENTO && code <= PROCESSO_JUDICIAL_MAX_SEGMENTO;
}

type StructureResult =
  | { ok: false; error: FailedResult }
  | { ok: true; segments: ProcessoJudicialSegments };

function validateStructure(input: string, stripped: string): StructureResult {
  if (stripped.length === 0) {
    return { ok: false, error: failure('EMPTY_INPUT', 'Processo judicial input is empty') };
  }

  const withoutMask = input.replace(/[-.]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return { ok: false, error: failure('INVALID_CHARACTER', 'Processo judicial contains invalid characters') };
  }

  if (stripped.length !== PROCESSO_JUDICIAL_LENGTH) {
    return {
      ok: false,
      error: failure(
        'INVALID_LENGTH',
        `Processo judicial must have ${PROCESSO_JUDICIAL_LENGTH} digits after normalization`,
      ),
    };
  }

  const segments = parseProcessoJudicialParts(stripped)!;

  if (!isValidSegmento(segments.segmentoJustica)) {
    return {
      ok: false,
      error: failure(
        'KNOWN_INVALID_PATTERN',
        `Processo judicial justice segment must be between ${PROCESSO_JUDICIAL_MIN_SEGMENTO} and ${PROCESSO_JUDICIAL_MAX_SEGMENTO}`,
      ),
    };
  }

  return { ok: true, segments };
}

export function isValidProcessoJudicial(input: string): boolean {
  return validateProcessoJudicial(input).ok;
}

export function validateProcessoJudicial(input: string): ProcessoJudicialValidationResult {
  const stripped = stripProcessoJudicial(input);
  const structure = validateStructure(input, stripped);
  if (!structure.ok) {
    return structure.error;
  }

  const { segments } = structure;

  if (
    !isValidProcessoJudicialCheckDigits(
      segments.sequencial,
      segments.checkDigits,
      segments.ano,
      segments.segmentoJustica,
      segments.tribunal,
      segments.origem,
    )
  ) {
    return failure('INVALID_CHECK_DIGIT', 'Processo judicial check digits are invalid');
  }

  return {
    ok: true,
    value: brandProcessoJudicial(stripped),
    format: 'numeric',
    segments,
  };
}

export function parseProcessoJudicial(input: string): ProcessoJudicialSegments | undefined {
  const result = validateProcessoJudicial(input);
  return result.ok ? result.segments : undefined;
}

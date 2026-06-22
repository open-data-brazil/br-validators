/**
 * São Paulo produtor rural IE — Regra II (SINTEGRA cad_SP.html Bloco II).
 * @see BR-IE-SP-RURAL-001
 * @see http://www.sintegra.gov.br/Cad_Estados/cad_SP.html
 */
import type { IeProdutorRuralValidationResult } from '../../types/validation-result.js';
import { brandInscricaoEstadualProdutorRural } from '../../types/validation-result.js';
import { IE_SP_DV1_WEIGHTS, IE_SP_RURAL_LENGTH } from './constants.js';
import { computeIeSpCheckDigit } from './modulo-ie.js';

type FailedResult = Extract<IeProdutorRuralValidationResult, { ok: false }>;

const SP_RURAL_MASK_PATTERN = /^[Pp0-9.\-\s/]+$/;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, uf: 'SP' };
}

export function isSpRuralIeInput(input: string): boolean {
  return /^[Pp]/.test(input.trim());
}

export function stripIeSpRural(input: string): string {
  const trimmed = input.trim().toUpperCase();
  const digits = trimmed.replace(/^[P]/, '').replace(/\D/g, '');
  return `P${digits}`;
}

export function validateIeSpRural(input: string): IeProdutorRuralValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Inscrição Estadual produtor rural input is empty', uf: 'SP' };
  }

  if (!/^[Pp]/.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'SP produtor rural Inscrição Estadual must start with P');
  }

  if (!SP_RURAL_MASK_PATTERN.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'SP produtor rural Inscrição Estadual contains invalid characters');
  }

  const stripped = stripIeSpRural(trimmed);
  if (stripped.length !== IE_SP_RURAL_LENGTH) {
    return failure(
      'INVALID_LENGTH',
      `SP produtor rural Inscrição Estadual must have ${IE_SP_RURAL_LENGTH} characters after normalization`,
    );
  }

  const dvInput = stripped.slice(1, 9);
  const expectedDv = computeIeSpCheckDigit(dvInput, IE_SP_DV1_WEIGHTS);
  const actualDv = Number(stripped.charAt(9));

  if (actualDv !== expectedDv) {
    return failure('INVALID_CHECK_DIGIT', 'SP produtor rural Inscrição Estadual check digit is invalid');
  }

  return {
    ok: true,
    value: brandInscricaoEstadualProdutorRural(stripped),
    uf: 'SP',
    format: 'inscricao-estadual-produtor-rural',
  };
}

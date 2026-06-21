import { validateCnpj } from '../cnpj/index.js';
import type { PixValidationResult } from '../../types/validation-result.js';
import { brandPixKey } from '../../types/validation-result.js';

type FailedResult = Extract<PixValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, keyType: 'cnpj' };
}

export function validatePixCnpjKey(input: string): PixValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'PIX CNPJ key input is empty');
  }

  const result = validateCnpj(trimmed);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message, keyType: 'cnpj' };
  }

  return {
    ok: true,
    value: brandPixKey(result.value),
    keyType: 'cnpj',
    format: result.format,
  };
}

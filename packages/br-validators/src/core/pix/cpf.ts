import { validateCpf } from '../cpf/index.js';
import type { PixValidationResult } from '../../types/validation-result.js';
import { brandPixKey } from '../../types/validation-result.js';

type FailedResult = Extract<PixValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, keyType: 'cpf' };
}

export function validatePixCpfKey(input: string): PixValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'PIX CPF key input is empty');
  }

  const result = validateCpf(trimmed);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message, keyType: 'cpf' };
  }

  return {
    ok: true,
    value: brandPixKey(result.value),
    keyType: 'cpf',
    format: result.format,
  };
}

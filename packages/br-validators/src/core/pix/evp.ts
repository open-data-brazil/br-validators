import type { PixValidationResult } from '../../types/validation-result.js';
import { brandPixKey } from '../../types/validation-result.js';
import { PIX_EVP_PATTERN } from './constants.js';

type FailedResult = Extract<PixValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, keyType: 'evp' };
}

export function validatePixEvpKey(input: string): PixValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'PIX EVP key input is empty');
  }

  if (trimmed !== trimmed.toLowerCase()) {
    return failure('INVALID_CHARACTER', 'PIX EVP key must be lowercase');
  }

  if (!PIX_EVP_PATTERN.test(trimmed)) {
    return failure('UNSUPPORTED_FORMAT', 'PIX EVP key must be a lowercase UUID with hyphens');
  }

  return {
    ok: true,
    value: brandPixKey(trimmed),
    keyType: 'evp',
    format: 'evp',
  };
}

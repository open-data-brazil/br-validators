import type { PixValidationResult } from '../../types/validation-result.js';
import { brandPixKey } from '../../types/validation-result.js';
import { PIX_EMAIL_MAX_LENGTH, PIX_EMAIL_PATTERN } from './constants.js';

type FailedResult = Extract<PixValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, keyType: 'email' };
}

export function validatePixEmailKey(input: string): PixValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'PIX email key input is empty');
  }

  if (trimmed !== trimmed.toLowerCase()) {
    return failure('INVALID_CHARACTER', 'PIX email key must be lowercase');
  }

  if (trimmed.length > PIX_EMAIL_MAX_LENGTH) {
    return failure('INVALID_LENGTH', `PIX email key must have at most ${PIX_EMAIL_MAX_LENGTH} characters`);
  }

  if (!trimmed.includes('@') || !PIX_EMAIL_PATTERN.test(trimmed)) {
    return failure('UNSUPPORTED_FORMAT', 'PIX email key format is invalid');
  }

  return {
    ok: true,
    value: brandPixKey(trimmed),
    keyType: 'email',
    format: 'email',
  };
}

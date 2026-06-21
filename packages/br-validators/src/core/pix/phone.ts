import type { PixValidationResult } from '../../types/validation-result.js';
import { brandPixKey } from '../../types/validation-result.js';
import { PIX_PHONE_BR_MOBILE_PATTERN, PIX_PHONE_E164_PATTERN } from './constants.js';

type FailedResult = Extract<PixValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, keyType: 'phone' };
}

export function validatePixPhoneKey(input: string): PixValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'PIX phone key input is empty');
  }

  if (!trimmed.startsWith('+')) {
    return failure('INVALID_CHARACTER', 'PIX phone key must start with + (E.164)');
  }

  if (!PIX_PHONE_E164_PATTERN.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'PIX phone key contains invalid characters');
  }

  if (!trimmed.startsWith('+55')) {
    return failure('UNSUPPORTED_FORMAT', 'PIX phone key must use Brazilian country code +55');
  }

  if (!PIX_PHONE_BR_MOBILE_PATTERN.test(trimmed)) {
    return failure('UNSUPPORTED_FORMAT', 'PIX phone key must match Brazilian mobile format +55DD9XXXXXXXX');
  }

  return {
    ok: true,
    value: brandPixKey(trimmed),
    keyType: 'phone',
    format: 'phone',
  };
}

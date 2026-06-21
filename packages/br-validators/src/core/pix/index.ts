/**
 * PIX key validation — five Bacen types (CPF, CNPJ, email, phone, EVP).
 * @see docs/use-cases/UC-005-validate-pix-key.md
 */
import type { PixKeyType, PixValidationResult } from '../../types/validation-result.js';
import { validatePixCnpjKey } from './cnpj.js';
import { validatePixCpfKey } from './cpf.js';
import { detectPixKeyType } from './detect.js';
import { validatePixEmailKey } from './email.js';
import { validatePixEvpKey } from './evp.js';
import { validatePixPhoneKey } from './phone.js';

export {
  PIX_DICT_API_SOURCE_URL,
  PIX_GOLDEN_CNPJ_ALPHANUMERIC,
  PIX_GOLDEN_CNPJ_NUMERIC,
  PIX_GOLDEN_CPF,
  PIX_GOLDEN_EMAIL,
  PIX_GOLDEN_EMAIL_SECONDARY,
  PIX_GOLDEN_EVP,
  PIX_GOLDEN_PHONE,
  PIX_GOLDEN_PHONE_SECONDARY,
  PIX_OFFICIAL_SOURCE_URL,
} from './constants.js';
export { detectPixKeyType, type DetectedPixKeyType } from './detect.js';
export { validatePixCpfKey } from './cpf.js';
export { validatePixCnpjKey } from './cnpj.js';
export { validatePixEmailKey } from './email.js';
export { validatePixPhoneKey } from './phone.js';
export { validatePixEvpKey } from './evp.js';

export type ValidatePixKeyOptions = {
  type?: PixKeyType;
};

type FailedResult = Extract<PixValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string, keyType?: PixKeyType): FailedResult {
  return { ok: false, code, message, ...(keyType ? { keyType } : {}) };
}

function validateByType(input: string, keyType: PixKeyType): PixValidationResult {
  switch (keyType) {
    case 'cpf':
      return validatePixCpfKey(input);
    case 'cnpj':
      return validatePixCnpjKey(input);
    case 'email':
      return validatePixEmailKey(input);
    case 'phone':
      return validatePixPhoneKey(input);
    case 'evp':
      return validatePixEvpKey(input);
    default: {
      const _exhaustive: never = keyType;
      return failure('UNSUPPORTED_FORMAT', `Unknown PIX key type: ${_exhaustive}`);
    }
  }
}

export function isValidPixKey(input: string, options?: ValidatePixKeyOptions): boolean {
  return validatePixKey(input, options).ok;
}

export function validatePixKey(input: string, options?: ValidatePixKeyOptions): PixValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'PIX key input is empty');
  }

  const detected = detectPixKeyType(trimmed);

  if (options?.type !== undefined) {
    if (detected !== 'unknown' && detected !== options.type) {
      return failure(
        'UNSUPPORTED_FORMAT',
        `PIX key detected as ${detected} but forced type is ${options.type}`,
        options.type,
      );
    }
    return validateByType(trimmed, options.type);
  }

  if (detected === 'unknown') {
    return failure('UNSUPPORTED_FORMAT', 'PIX key type could not be determined');
  }

  return validateByType(trimmed, detected);
}

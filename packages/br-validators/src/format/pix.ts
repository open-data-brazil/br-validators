/**
 * Format decorator — strip → validate → apply official mask (UC-003).
 * @see docs/use-cases/UC-003-format-document.md
 * @see docs/VALIDATION-RULES.md BR-GLOBAL-002
 */
import type { ValidatePixKeyOptions } from '../core/pix/index.js';
import { validatePixKey } from '../core/pix/index.js';
import {
  applyPixCnpjKeyMask,
  applyPixCpfKeyMask,
  applyPixEmailKeyMask,
  applyPixEvpKeyMask,
  applyPixPhoneKeyMask,
} from '../core/pix/mask.js';
import type { FormatResult, PixKeyType } from '../types/validation-result.js';

function applyPixMask(keyType: PixKeyType, value: string): string {
  switch (keyType) {
    case 'cpf':
      return applyPixCpfKeyMask(value);
    case 'cnpj':
      return applyPixCnpjKeyMask(value);
    case 'phone':
      return applyPixPhoneKeyMask(value);
    case 'email':
      return applyPixEmailKeyMask(value);
    case 'evp':
      return applyPixEvpKeyMask(value);
  }
}

export function formatPixKey(input: string, options?: ValidatePixKeyOptions): FormatResult {
  const result = validatePixKey(input, options);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }

  return { ok: true, formatted: applyPixMask(result.keyType, result.value) };
}

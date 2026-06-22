import { applyTelefoneMask } from '../core/telefone/mask.js';
import { validateTelefone } from '../core/telefone/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatTelefone(input: string): FormatResult {
  const result = validateTelefone(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyTelefoneMask(result.value, result.tipo) };
}

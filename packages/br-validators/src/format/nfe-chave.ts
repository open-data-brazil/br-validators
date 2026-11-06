import { applyNfeChaveMask } from '../core/nfe-chave/mask.js';
import { validateNfeChave } from '../core/nfe-chave/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatNfeChave(input: string): FormatResult {
  const result = validateNfeChave(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyNfeChaveMask(result.value) };
}

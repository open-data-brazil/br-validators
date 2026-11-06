import { applyIeSpRuralMask } from '../core/inscricao-estadual/mask.js';
import { validateIeSpRural } from '../core/inscricao-estadual/sp-rural.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatIeProdutorRural(input: string): FormatResult {
  const result = validateIeSpRural(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyIeSpRuralMask(result.value) };
}

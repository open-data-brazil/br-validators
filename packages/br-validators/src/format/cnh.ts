import { applyCnhCanonicalFormat } from '../core/cnh/mask.js';
import { validateCnh } from '../core/cnh/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatCnh(input: string): FormatResult {
  const result = validateCnh(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyCnhCanonicalFormat(result.value) };
}

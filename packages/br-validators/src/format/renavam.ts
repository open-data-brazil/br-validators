import { applyRenavamCanonicalFormat } from '../core/renavam/mask.js';
import { validateRenavam } from '../core/renavam/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatRenavam(input: string): FormatResult {
  const result = validateRenavam(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyRenavamCanonicalFormat(result.value) };
}

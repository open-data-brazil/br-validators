import { validatePlaca } from '../core/placa/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatPlaca(input: string): FormatResult {
  const result = validatePlaca(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: result.value };
}

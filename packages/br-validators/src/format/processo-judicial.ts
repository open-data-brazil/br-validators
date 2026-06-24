import { applyProcessoJudicialMask } from '../core/processo-judicial/mask.js';
import { validateProcessoJudicial } from '../core/processo-judicial/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatProcessoJudicial(input: string): FormatResult {
  const result = validateProcessoJudicial(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyProcessoJudicialMask(result.value) };
}

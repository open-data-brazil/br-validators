import { applyCpfMask } from '../core/cpf/mask.js';
import { validateCpf } from '../core/cpf/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatCpf(input: string): FormatResult {
  const result = validateCpf(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyCpfMask(result.value) };
}

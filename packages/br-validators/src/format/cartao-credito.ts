import { applyCartaoCreditoMask } from '../core/cartao-credito/mask.js';
import { validateCartaoCredito } from '../core/cartao-credito/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatCartaoCredito(input: string): FormatResult {
  const result = validateCartaoCredito(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyCartaoCreditoMask(result.value) };
}

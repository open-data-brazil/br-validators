/**
 * Format decorator — strip → validate → apply official mask (UC-003).
 * @see docs/use-cases/UC-003-format-document.md
 * @see docs/VALIDATION-RULES.md BR-GLOBAL-002
 */
import { applyLinhaDigitavelMask } from '../core/boleto/mask.js';
import { detectBoletoInputKind } from '../core/boleto/detect.js';
import { validateLinhaDigitavel } from '../core/boleto/linha-digitavel.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatBoleto(input: string): FormatResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Boleto input is empty' };
  }

  const kind = detectBoletoInputKind(trimmed);
  if (kind === 'codigo-barras') {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'Boleto barcode formatting is not supported in v1',
    };
  }

  const result = validateLinhaDigitavel(trimmed);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }

  return { ok: true, formatted: applyLinhaDigitavelMask(result.value) };
}

/**
 * Legacy → Mercosul plate conversion (CONTRAN digit-to-letter table).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf
 */
import type { FormatResult } from '../../types/validation-result.js';
import { stripPlaca } from '../../strip/index.js';
import { PLACA_LEGACY_TO_MERCOSUL_MAP } from './constants.js';
import { detectPlacaFormat } from './detect.js';

type FailedResult = Extract<FormatResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

export function convertPlacaToMercosul(input: string): FormatResult {
  const stripped = stripPlaca(input);
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'Placa input is empty');
  }

  if (detectPlacaFormat(input) !== 'legacy') {
    return failure('UNSUPPORTED_FORMAT', 'Conversion requires a valid legacy plate (LLLNNNN)');
  }

  const prefix = stripped.slice(0, 4);
  const mapped = PLACA_LEGACY_TO_MERCOSUL_MAP[stripped.charAt(4)];
  const suffix = stripped.slice(5);
  return { ok: true, formatted: `${prefix}${mapped}${suffix}` };
}

/**
 * License plate validation — legacy (LLLNNNN) + Mercosul (LLLNLNN). CONTRAN 729/2018.
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf
 * @see docs/use-cases/UC-004-validate-placa.md — golden vectors ABC1D23, ABC1234
 */
import { stripPlaca } from '../../strip/index.js';
import type { DocumentFormat, Placa, ValidationResult } from '../../types/validation-result.js';
import { brandPlaca } from '../../types/validation-result.js';
import { detectPlacaFormat } from './detect.js';
import { PLACA_LENGTH } from './constants.js';

export {
  PLACA_GOLDEN_CONVERSION_FROM,
  PLACA_GOLDEN_CONVERSION_TO,
  PLACA_GOLDEN_LEGACY,
  PLACA_GOLDEN_MERCOSUL,
  PLACA_OFFICIAL_SOURCE_URL,
} from './constants.js';
export { detectPlacaFormat, type PlacaFormat } from './detect.js';
export { isValidPlacaLegacy } from './legacy.js';
export { isValidPlacaMercosul } from './mercosul.js';
export { convertPlacaToMercosul } from './convert.js';

type FailedResult = Extract<ValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

function validateStructure(input: string, stripped: string): FailedResult | null {
  if (stripped.length === 0) {
    return failure('EMPTY_INPUT', 'Placa input is empty');
  }

  const withoutSeparators = input.replace(/[-\s]/g, '');
  if (/[^A-Za-z0-9]/.test(withoutSeparators)) {
    return failure('INVALID_CHARACTER', 'Placa contains invalid characters');
  }

  if (stripped.length !== PLACA_LENGTH) {
    return failure('INVALID_LENGTH', `Placa must have ${PLACA_LENGTH} characters after normalization`);
  }

  return null;
}

export function isValidPlaca(input: string): boolean {
  return validatePlaca(input).ok;
}

export function validatePlaca(input: string): ValidationResult<Placa> {
  const stripped = stripPlaca(input);
  const structural = validateStructure(input, stripped);
  if (structural) {
    return structural;
  }

  const format = detectPlacaFormat(input);
  if (format === 'unknown') {
    return failure('UNSUPPORTED_FORMAT', 'Placa does not match legacy or Mercosul format');
  }

  return { ok: true, value: brandPlaca(stripped), format: format as DocumentFormat };
}

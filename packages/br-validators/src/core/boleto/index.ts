/**
 * Boleto validation — linha digitável + código de barras (FEBRABAN cobrança).
 * @see docs/use-cases/UC-007-validate-boleto.md
 */
import type { BoletoInputKind, BoletoValidationResult } from '../../types/validation-result.js';
import { brandCodigoBarras, brandLinhaDigitavel } from '../../types/validation-result.js';
import { validateCodigoBarras } from './codigo-barras.js';
import {
  convertCodigoBarrasToLinhaDigits,
  convertLinhaToCodigoBarrasDigits,
} from './convert.js';
import { detectBoletoInputKind } from './detect.js';
import { validateLinhaDigitavel } from './linha-digitavel.js';

export {
  BOLETO_CODIGO_BARRAS_LENGTH,
  BOLETO_CURRENCY_REAL,
  BOLETO_GOLDEN_CODIGO_BARRAS,
  BOLETO_GOLDEN_CODIGO_BARRAS_BB,
  BOLETO_GOLDEN_LINHA_BB_STRIPPED,
  BOLETO_GOLDEN_LINHA_MASKED,
  BOLETO_GOLDEN_LINHA_STRIPPED,
  BOLETO_LAYOUTS_PORTAL_URL,
  BOLETO_LINHA_LENGTH,
  BOLETO_OFFICIAL_SOURCE_URL,
} from './constants.js';
export { computeModulo10FieldDv } from './modulo10.js';
export { computeModulo11BarcodeDv } from './modulo11.js';
export { detectBoletoInputKind, type DetectedBoletoInputKind } from './detect.js';
export {
  convertCodigoBarrasToLinhaDigits,
  convertLinhaToCodigoBarrasDigits,
} from './convert.js';
export {
  formatLinhaDigitavel,
  stripLinhaDigitavel,
  validateLinhaDigitavel,
} from './linha-digitavel.js';
export { applyLinhaDigitavelMask } from './mask.js';
export { stripCodigoBarras, validateCodigoBarras } from './codigo-barras.js';

export type ValidateBoletoOptions = {
  kind?: BoletoInputKind;
};

type FailedResult = Extract<BoletoValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string, inputKind?: BoletoInputKind): FailedResult {
  return { ok: false, code, message, ...(inputKind ? { inputKind } : {}) };
}

function isArrecadacao48(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length === 48 && digits.startsWith('8');
}

function validateByKind(input: string, kind: BoletoInputKind): BoletoValidationResult {
  return kind === 'linha-digitavel' ? validateLinhaDigitavel(input) : validateCodigoBarras(input);
}

export function isValidBoleto(input: string, options?: ValidateBoletoOptions): boolean {
  return validateBoleto(input, options).ok;
}

export function validateBoleto(input: string, options?: ValidateBoletoOptions): BoletoValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return failure('EMPTY_INPUT', 'Boleto input is empty');
  }

  if (isArrecadacao48(trimmed)) {
    return failure('UNSUPPORTED_FORMAT', '48-digit arrecadação slips are not supported in v1');
  }

  const detected = detectBoletoInputKind(trimmed);

  if (options?.kind !== undefined) {
    if (detected !== 'unknown' && detected !== options.kind) {
      return failure(
        'UNSUPPORTED_FORMAT',
        `Boleto detected as ${detected} but forced kind is ${options.kind}`,
        options.kind,
      );
    }
    return validateByKind(trimmed, options.kind);
  }

  if (detected === 'unknown') {
    return failure('UNSUPPORTED_FORMAT', 'Boleto input kind could not be determined');
  }

  return validateByKind(trimmed, detected);
}

export function convertLinhaToCodigoBarras(input: string): BoletoValidationResult {
  const result = validateLinhaDigitavel(input);
  if (!result.ok) {
    return result;
  }
  const barcode = convertLinhaToCodigoBarrasDigits(result.value);
  return {
    ok: true,
    value: brandCodigoBarras(barcode),
    inputKind: 'codigo-barras',
    format: 'codigo-barras',
  };
}

export function convertCodigoBarrasToLinhaDigitavel(input: string): BoletoValidationResult {
  const result = validateCodigoBarras(input);
  if (!result.ok) {
    return result;
  }
  const linha = convertCodigoBarrasToLinhaDigits(result.value);
  return {
    ok: true,
    value: brandLinhaDigitavel(linha),
    inputKind: 'linha-digitavel',
    format: 'linha-digitavel',
  };
}

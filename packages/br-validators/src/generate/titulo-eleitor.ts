/**
 * Synthetic Título de Eleitor generation — reuses TSE modulo 11 helpers (BR-GENERATE-001).
 */
import {
  TITULO_ELEITOR_GOLDEN_PRIMARY,
  TITULO_ELEITOR_GOLDEN_SP_SPECIAL,
  TITULO_ELEITOR_SEQUENTIAL_LENGTH,
  TITULO_ELEITOR_UF_BY_CODE,
} from '../core/titulo-eleitor/constants.js';
import { computeTituloEleitorCheckDigits } from '../core/titulo-eleitor/check-digits.js';
import { validateTituloEleitor } from '../core/titulo-eleitor/index.js';
import type { UfCode } from '../types/validation-result.js';
import { hasRepeatedChars, type RandomSource } from './random.js';

const MAX_ATTEMPTS = 50;

const TITULO_ELEITOR_CODE_BY_UF = Object.fromEntries(
  Object.entries(TITULO_ELEITOR_UF_BY_CODE).map(([code, uf]) => [uf, Number(code)]),
) as Record<UfCode, number>;

const TITULO_GENERATE_FALLBACKS: Partial<Record<UfCode, string>> = {
  SP: TITULO_ELEITOR_GOLDEN_SP_SPECIAL,
  SC: TITULO_ELEITOR_GOLDEN_PRIMARY,
};

function deterministicTituloFallback(uf: UfCode): string {
  const ufCode = TITULO_ELEITOR_CODE_BY_UF[uf];
  const ufDigits = String(ufCode).padStart(2, '0');
  const sequential = '12345678';
  const checkDigits = computeTituloEleitorCheckDigits(sequential, ufDigits, ufCode);
  return `${sequential}${ufDigits}${checkDigits}`;
}

export function resolveTituloEleitorUfCode(uf: UfCode): number {
  return TITULO_ELEITOR_CODE_BY_UF[uf];
}

export function generateTituloEleitorValue(
  uf: UfCode,
  rng: RandomSource,
  validate: (input: string) => ReturnType<typeof validateTituloEleitor> = validateTituloEleitor,
): string {
  const ufCode = TITULO_ELEITOR_CODE_BY_UF[uf];
  const ufDigits = String(ufCode).padStart(2, '0');

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const sequential = rng.digits(TITULO_ELEITOR_SEQUENTIAL_LENGTH);
    if (hasRepeatedChars(sequential)) {
      continue;
    }
    const checkDigits = computeTituloEleitorCheckDigits(sequential, ufDigits, ufCode);
    const candidate = `${sequential}${ufDigits}${checkDigits}`;
    if (validate(candidate).ok) {
      return candidate;
    }
  }

  return TITULO_GENERATE_FALLBACKS[uf] ?? deterministicTituloFallback(uf);
}

export function isSupportedTituloGenerateUf(uf: string): uf is UfCode {
  return uf in TITULO_ELEITOR_CODE_BY_UF;
}

/** @internal Test hooks for titulo generator branches. */
export const __generateTituloTesting = {
  fallback: (uf: UfCode) => TITULO_GENERATE_FALLBACKS[uf] ?? deterministicTituloFallback(uf),
  generateWithAlwaysInvalidValidation: (uf: UfCode, rng: RandomSource) =>
    generateTituloEleitorValue(uf, rng, () => ({
      ok: false,
      code: 'INVALID_CHECK_DIGIT',
      message: 'forced invalid for test',
    })),
};

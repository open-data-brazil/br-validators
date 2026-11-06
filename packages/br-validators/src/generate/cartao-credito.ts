/**
 * Synthetic credit card PAN generation — Luhn + brand IIN prefixes (BR-GENERATE-001).
 */
import type { CardBrand } from '../core/cartao-credito/constants.js';
import {
  CARTAO_GOLDEN_AMEX,
  CARTAO_GOLDEN_MASTERCARD,
  CARTAO_GOLDEN_VISA,
  ELO_IIN_PREFIXES,
  HIPERCARD_IIN_PREFIXES,
} from '../core/cartao-credito/constants.js';
import { detectCardBrand } from '../core/cartao-credito/detect-brand.js';
import { validateCartaoCredito } from '../core/cartao-credito/index.js';
import { computeLuhnCheckDigit, hasRepeatedChars, type RandomSource } from './random.js';

const MAX_ATTEMPTS = 50;

export type GeneratableCardBrand = Exclude<CardBrand, 'unknown'>;

export const GENERATABLE_CARD_BRANDS: readonly GeneratableCardBrand[] = [
  'visa',
  'mastercard',
  'amex',
  'elo',
  'hipercard',
] as const;

const BRAND_FALLBACKS: Record<GeneratableCardBrand, string> = {
  visa: CARTAO_GOLDEN_VISA,
  mastercard: CARTAO_GOLDEN_MASTERCARD,
  amex: CARTAO_GOLDEN_AMEX,
  elo: '401178000000006',
  hipercard: '606282000000003',
};

function buildBrandPartial(rng: RandomSource, brand: GeneratableCardBrand): string {
  switch (brand) {
    case 'visa':
      return `411111${rng.digits(9)}`;
    case 'mastercard':
      return `${rng.pick(['51', '52', '53', '54', '55'])}${rng.digits(13)}`;
    case 'amex':
      return `${rng.pick(['34', '37'])}${rng.digits(12)}`;
    case 'elo': {
      const prefix = rng.pick(ELO_IIN_PREFIXES);
      return `${prefix}${rng.digits(16 - prefix.length - 1)}`;
    }
    case 'hipercard': {
      const prefix = rng.pick(HIPERCARD_IIN_PREFIXES);
      return `${prefix}${rng.digits(16 - prefix.length - 1)}`;
    }
    default: {
      const _exhaustive: never = brand;
      return _exhaustive;
    }
  }
}

function buildRandomPartial(rng: RandomSource): string {
  const length = rng.int(13, 16);
  return rng.digits(length - 1);
}

export function generateCartaoCreditoValue(
  rng: RandomSource,
  brand?: GeneratableCardBrand,
  detectBrand: (pan: string) => CardBrand = detectCardBrand,
  validate: (input: string) => ReturnType<typeof validateCartaoCredito> = validateCartaoCredito,
): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const partial = brand ? buildBrandPartial(rng, brand) : buildRandomPartial(rng);
    if (hasRepeatedChars(partial)) {
      continue;
    }
    const candidate = partial + computeLuhnCheckDigit(partial);
    if (!validate(candidate).ok) {
      continue;
    }
    if (brand && detectBrand(candidate) !== brand) {
      continue;
    }
    return candidate;
  }

  if (brand) {
    return BRAND_FALLBACKS[brand];
  }
  return CARTAO_GOLDEN_VISA;
}

export function isGeneratableCardBrand(brand: string): brand is GeneratableCardBrand {
  return (GENERATABLE_CARD_BRANDS as readonly string[]).includes(brand);
}

const brandHookRng: RandomSource = {
  next: () => 0,
  int: (min: number) => min,
  digit: () => '1',
  digits: (count: number) => '1'.repeat(count),
  letter: () => 'A',
  pick: <T>(items: readonly T[]) => items[0],
};

const randomHookRng: RandomSource = {
  ...brandHookRng,
  int: () => 16,
};

/** @internal Test hooks for cartao generator branches. */
export const __generateCartaoTesting = {
  fallback: (brand: GeneratableCardBrand) => BRAND_FALLBACKS[brand],
  buildBrandPartial: (brand: GeneratableCardBrand) => buildBrandPartial(brandHookRng, brand),
  buildRandomPartial: () => buildRandomPartial(randomHookRng),
  generateWithAlwaysWrongBrand: (brand: GeneratableCardBrand, rng: RandomSource) =>
    generateCartaoCreditoValue(rng, brand, () => 'unknown'),
  generateWithAlwaysInvalidValidation: (rng: RandomSource) =>
    generateCartaoCreditoValue(rng, undefined, detectCardBrand, () => ({
      ok: false,
      code: 'INVALID_CHECK_DIGIT',
      message: 'forced invalid for test',
    })),
  invokeBuildBrandPartialDefault: () =>
    buildBrandPartial(brandHookRng, 'invalid' as GeneratableCardBrand),
  touchHookRngMethods: () => {
    for (const rng of [brandHookRng, randomHookRng]) {
      rng.next();
      rng.int(1, 16);
      rng.digit();
      rng.digits(3);
      rng.letter();
      rng.pick(['a']);
    }
  },
};

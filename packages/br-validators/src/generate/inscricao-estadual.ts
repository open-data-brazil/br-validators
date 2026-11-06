/**
 * Synthetic Inscrição Estadual generation — reuses modulo-ie helpers (BR-GENERATE-001).
 * @see docs/IE-STATE-ALGORITHMS.md
 */
import {
  IE_AC_PREFIX,
  IE_AL_PREFIX,
  IE_AP_PREFIX,
  IE_DF_DV1_WEIGHTS,
  IE_DF_DV2_WEIGHTS,
  IE_DF_GOLDEN,
  IE_DF_PREFIX,
  IE_GO_PREFIXES,
  IE_MA_PREFIX,
  IE_MS_PREFIX,
  IE_MT_GOLDEN_LEGACY,
  IE_MT_PREFIX,
  IE_PA_PREFIX,
  IE_RN_PREFIX,
  IE_RR_PREFIX,
  IE_SP_DV1_WEIGHTS,
  IE_SP_DV2_WEIGHTS,
  IE_SP_GOLDEN,
  IE_SUPPORTED_UFS,
} from '../core/inscricao-estadual/constants.js';
import {
  computeIeAcCheckDigit,
  computeIeAlCheckDigit,
  computeIeAmCheckDigit,
  computeIeApCheckDigit,
  computeIeBaCheckDigit,
  computeIeBaModule,
  computeIeCeCheckDigit,
  computeIeCyclicMod11CheckDigit,
  computeIeDfCheckDigit,
  computeIeGoCheckDigit,
  computeIeMgFirstCheckDigit,
  computeIeMgSecondCheckDigit,
  computeIeMtCheckDigit,
  computeIePeCheckDigit,
  computeIePrStyleCheckDigit,
  computeIeRoCheckDigit,
  computeIeRrCheckDigit,
  computeIeSpCheckDigit,
  computeIeToCheckDigit,
} from '../core/inscricao-estadual/modulo-ie.js';
import { validateInscricaoEstadual } from '../core/inscricao-estadual/index.js';
import type { UfCode } from '../types/validation-result.js';
import type { RandomSource } from './random.js';

const MAX_ATTEMPTS = 50;

/** Official golden stripped values — fallback when random synthesis fails. */
export const IE_GENERATE_FALLBACKS: Record<UfCode, string> = {
  AC: '0113253877910',
  AL: '248682954',
  AM: '917050150',
  AP: '039045820',
  BA: '63984300',
  CE: '836182316',
  DF: IE_DF_GOLDEN,
  ES: '463921810',
  GO: '112237118',
  MA: '123517680',
  MG: '2490944173923',
  MS: '282570926',
  MT: IE_MT_GOLDEN_LEGACY,
  PA: '153662476',
  PB: '312029063',
  PE: '064970639',
  PI: '465180426',
  PR: '0031595584',
  RJ: '06540481',
  RN: '204502292',
  RO: '39206839474860',
  RR: '247681047',
  RS: '3288345503',
  SC: '632480718',
  SE: '826594042',
  SP: IE_SP_GOLDEN,
  TO: '27035910938',
};

function prefixBody8(rng: RandomSource, prefix: string): string {
  return prefix + rng.digits(8 - prefix.length);
}

function buildCeStyle(rng: RandomSource, prefix?: string): string {
  const body = prefix ? prefixBody8(rng, prefix) : rng.digits(8);
  return body + String(computeIeCeCheckDigit(body));
}

function buildDualTrailing(
  rng: RandomSource,
  prefix: string,
  bodyLength: number,
  computeFirst: (body: string) => number,
  computeSecond: (body: string) => number,
): string {
  const body = prefix + rng.digits(bodyLength - prefix.length);
  const first = computeFirst(body);
  const second = computeSecond(body + String(first));
  return body + String(first) + String(second);
}

function generateSpValue(rng: RandomSource): string {
  const head = rng.digits(8);
  const middle = rng.digits(2);
  let partial = `${head}0${middle}0`;
  const dv1 = computeIeSpCheckDigit(partial, IE_SP_DV1_WEIGHTS);
  partial = `${head}${String(dv1)}${middle}0`;
  const dv2 = computeIeSpCheckDigit(partial, IE_SP_DV2_WEIGHTS);
  return `${head}${String(dv1)}${middle}${String(dv2)}`;
}

function generateDfValue(rng: RandomSource): string {
  const core11 = IE_DF_PREFIX + rng.digits(9);
  const dv1 = computeIeDfCheckDigit(core11, IE_DF_DV1_WEIGHTS);
  const dv2 = computeIeDfCheckDigit(core11, IE_DF_DV2_WEIGHTS, true, dv1);
  return `${core11}${String(dv1)}${String(dv2)}`;
}

function generateMtValue(rng: RandomSource): string {
  const padded = `${IE_MT_PREFIX.padStart(4, '0')}${rng.digits(6)}`;
  const dv = computeIeMtCheckDigit(padded.slice(0, 10));
  return `${padded.slice(0, 10)}${String(dv)}`;
}

function generateMgValue(rng: RandomSource): string {
  const body = rng.digits(11);
  const first = computeIeMgFirstCheckDigit(body);
  const second = computeIeMgSecondCheckDigit(body + String(first));
  return body + String(first) + String(second);
}

function generateBaValue(rng: RandomSource): string {
  const body = rng.digits(6);
  const mod = computeIeBaModule(`${body}00`);
  const second = computeIeBaCheckDigit(body, mod);
  const first = computeIeBaCheckDigit(body + String(second), mod);
  return body + String(first) + String(second);
}

function generatePeValue(rng: RandomSource): string {
  const body = rng.digits(7);
  const first = computeIePeCheckDigit(body);
  const second = computeIePeCheckDigit(body + String(first));
  return body + String(first) + String(second);
}

function generateGoValue(rng: RandomSource): string {
  const prefix = rng.pick([...IE_GO_PREFIXES]);
  const body = prefix + rng.digits(6);
  return body + String(computeIeGoCheckDigit(body));
}

function generateApValue(rng: RandomSource): string {
  const body = IE_AP_PREFIX + rng.digits(6);
  const dv = computeIeApCheckDigit(body);
  return body + String(dv);
}

const GENERATORS: Record<UfCode, (rng: RandomSource) => string> = {
  SP: generateSpValue,
  DF: generateDfValue,
  MT: generateMtValue,
  MG: generateMgValue,
  BA: generateBaValue,
  PE: generatePeValue,
  GO: generateGoValue,
  AP: generateApValue,
  AC: (rng) =>
    buildDualTrailing(rng, IE_AC_PREFIX, 11, computeIeAcCheckDigit, computeIeAcCheckDigit),
  AL: (rng) => {
    const body = prefixBody8(rng, IE_AL_PREFIX);
    return body + String(computeIeAlCheckDigit(body));
  },
  AM: (rng) => {
    const body = rng.digits(8);
    return body + String(computeIeAmCheckDigit(body));
  },
  CE: (rng) => buildCeStyle(rng),
  ES: (rng) => buildCeStyle(rng),
  SC: (rng) => buildCeStyle(rng),
  SE: (rng) => buildCeStyle(rng),
  PB: (rng) => buildCeStyle(rng),
  PI: (rng) => buildCeStyle(rng),
  MS: (rng) => buildCeStyle(rng, IE_MS_PREFIX),
  PA: (rng) => buildCeStyle(rng, IE_PA_PREFIX),
  MA: (rng) => buildCeStyle(rng, IE_MA_PREFIX),
  RN: (rng) => buildCeStyle(rng, IE_RN_PREFIX),
  RR: (rng) => {
    const body = prefixBody8(rng, IE_RR_PREFIX);
    return body + String(computeIeRrCheckDigit(body));
  },
  PR: (rng) =>
    buildDualTrailing(rng, '', 8, computeIePrStyleCheckDigit, computeIePrStyleCheckDigit),
  RJ: (rng) => {
    const body = rng.digits(7);
    return body + String(computeIeCyclicMod11CheckDigit(body, 2, 7));
  },
  RS: (rng) => {
    const body = rng.digits(9);
    return body + String(computeIeCyclicMod11CheckDigit(body, 2, 9));
  },
  RO: (rng) => {
    const body = rng.digits(13);
    return body + String(computeIeRoCheckDigit(body));
  },
  TO: (rng) => {
    const body = rng.digits(8);
    return body + String(computeIeToCheckDigit(body));
  },
};

export function generateInscricaoEstadualValue(
  uf: UfCode,
  rng: RandomSource,
  validate: (input: string, options: { uf: UfCode }) => ReturnType<typeof validateInscricaoEstadual> = validateInscricaoEstadual,
): string {
  const generator = GENERATORS[uf];

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = generator(rng);
    if (validate(candidate, { uf }).ok) {
      return candidate;
    }
  }

  return IE_GENERATE_FALLBACKS[uf];
}

export function isSupportedGenerateUf(uf: string): uf is UfCode {
  return (IE_SUPPORTED_UFS as readonly string[]).includes(uf);
}

/** @internal Test hooks for IE generator branches. */
export const __generateIeTesting = {
  fallback: (uf: UfCode) => IE_GENERATE_FALLBACKS[uf],
  generateWithAlwaysInvalidValidation: (uf: UfCode, rng: RandomSource) =>
    generateInscricaoEstadualValue(uf, rng, () => ({
      ok: false,
      code: 'INVALID_CHECK_DIGIT',
      message: 'forced invalid for test',
    })),
};

/**
 * NF-e / NFC-e chave de acesso validation — 44 digits, modulo-11 DV (MOC §2.2.6).
 * @see http://moc.sped.fazenda.pr.gov.br/#2.2.6.2. Cálculo do Dígito Verificador da Chave de Acesso da NF-e
 */
import { stripNfeChave } from '../../strip/nfe-chave.js';
import type { NfeChaveValidationResult, UfCode } from '../../types/validation-result.js';
import { brandNfeChave } from '../../types/validation-result.js';
import {
  NFE_CHAVE_LENGTH,
  NFE_IBGE_UF_BY_CODE,
  NFE_IBGE_UF_CODES,
  NFE_MODELOS,
} from './constants.js';
import { isValidNfeChaveCheckDigit } from './dv.js';
import { parseNfeChaveParts, type NfeChaveParts } from './parse.js';

export {
  NFE_CHAVE_BASE_LENGTH,
  NFE_CHAVE_DFE_PORTAL_URL,
  NFE_CHAVE_GOLDEN_PRIMARY,
  NFE_CHAVE_GOLDEN_SECONDARY,
  NFE_CHAVE_LENGTH,
  NFE_CHAVE_MOD,
  NFE_CHAVE_MOC_DV_SECTION_URL,
  NFE_CHAVE_MOC_ONLINE_URL,
  NFE_CHAVE_MOC_PDF_URL,
  NFE_CHAVE_NFCE_QR_ILLUSTRATIVE,
  NFE_CHAVE_NFCE_QR_ILLUSTRATIVE_URL,
  NFE_CHAVE_NUMERIC_PATTERN,
  NFE_CHAVE_OFFICIAL_SOURCE_URL,
  NFE_CHAVE_WEIGHT_CYCLE,
  NFE_IBGE_UF_BY_CODE,
  NFE_IBGE_UF_CODES,
  NFE_MODELO_NFCE,
  NFE_MODELO_NFE,
  NFE_MODELOS,
} from './constants.js';
export {
  computeNfeChaveCheckDigit,
  computeNfeChaveWeightedSum,
  isValidNfeChaveCheckDigit,
  resolveNfeChaveCheckDigit,
} from './dv.js';
export { parseNfeChaveParts, type NfeChaveParts } from './parse.js';

type FailedResult = Extract<NfeChaveValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message };
}

function isKnownModel(mod: string): boolean {
  return (NFE_MODELOS as readonly string[]).includes(mod);
}

function resolveUf(cuf: string): UfCode | undefined {
  return NFE_IBGE_UF_BY_CODE[Number(cuf)];
}

type StructureResult =
  | { ok: false; error: FailedResult }
  | { ok: true; parts: NfeChaveParts };

function validateStructure(input: string, stripped: string): StructureResult {
  if (stripped.length === 0) {
    return { ok: false, error: failure('EMPTY_INPUT', 'NF-e chave de acesso input is empty') };
  }

  const withoutMask = input.replace(/[\s.]/g, '');
  if (/[^0-9]/.test(withoutMask)) {
    return { ok: false, error: failure('INVALID_CHARACTER', 'NF-e chave de acesso contains invalid characters') };
  }

  if (stripped.length !== NFE_CHAVE_LENGTH) {
    return {
      ok: false,
      error: failure(
        'INVALID_LENGTH',
        `NF-e chave de acesso must have ${NFE_CHAVE_LENGTH} digits after normalization`,
      ),
    };
  }

  const parts = parseNfeChaveParts(stripped)!;
  const cufCode = Number(parts.cUF);
  if (!NFE_IBGE_UF_CODES.has(cufCode)) {
    return {
      ok: false,
      error: failure(
        'KNOWN_INVALID_PATTERN',
        `NF-e chave cUF ${parts.cUF} is not a valid IBGE UF code`,
      ),
    };
  }

  if (!isKnownModel(parts.mod)) {
    return {
      ok: false,
      error: failure(
        'KNOWN_INVALID_PATTERN',
        `NF-e chave modelo ${parts.mod} is not 55 (NF-e) or 65 (NFC-e)`,
      ),
    };
  }

  return { ok: true, parts };
}

function buildSuccess(stripped: string, parts: NfeChaveParts): Extract<NfeChaveValidationResult, { ok: true }> {
  const uf = resolveUf(parts.cUF);
  const success: Extract<NfeChaveValidationResult, { ok: true }> = {
    ok: true,
    value: brandNfeChave(stripped),
    format: 'numeric',
    parsed: parts,
  };
  if (uf !== undefined) {
    success.uf = uf;
  }
  return success;
}

export function isValidNfeChave(input: string): boolean {
  return validateNfeChave(input).ok;
}

export function parseNfeChave(input: string): NfeChaveValidationResult {
  const stripped = stripNfeChave(input);
  const structure = validateStructure(input, stripped);
  if (!structure.ok) {
    return structure.error;
  }

  if (!isValidNfeChaveCheckDigit(stripped)) {
    return failure('INVALID_CHECK_DIGIT', 'NF-e chave de acesso check digit is invalid');
  }

  return buildSuccess(stripped, structure.parts);
}

export function validateNfeChave(input: string): NfeChaveValidationResult {
  return parseNfeChave(input);
}

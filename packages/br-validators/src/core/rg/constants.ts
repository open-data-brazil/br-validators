/**
 * RG (Registro Geral) — per-UF rules (phase 1: SP, RJ, MG, RS, PR, SC).
 * @see http://ghiorzi.org/DVnew.htm — SSP-SP, IFP-RJ, MaSP-MG check digits
 */
import type { RgUfCode } from '../../types/validation-result.js';
import type { RgUfRules } from './types.js';

export const RG_OFFICIAL_SOURCE_URL = 'http://ghiorzi.org/DVnew.htm';

export const RG_OFFICIAL_SOURCE_URLS: Record<RgUfCode, string> = {
  SP: 'http://ghiorzi.org/DVnew.htm',
  RJ: 'http://ghiorzi.org/DVnew.htm',
  MG: 'http://ghiorzi.org/DVnew.htm',
  PR: 'https://www.iipar.pr.gov.br/',
  RS: 'https://www.estado.rs.gov.br/',
  SC: 'https://www.ciasc.sc.gov.br/',
};

export const RG_SUPPORTED_UFS = ['SP', 'RJ', 'MG', 'PR', 'RS', 'SC'] as const satisfies readonly RgUfCode[];

export const RG_SP_GOLDEN = '120300011';
export const RG_SP_GOLDEN_MASKED = '12.030.001-1';
export const RG_SP_GOLDEN_X = '00000005X';
export const RG_SP_GOLDEN_X_MASKED = '00.000.005-X';

export const RG_RJ_GOLDEN = '27998111';
export const RG_RJ_GOLDEN_MASKED = '2.799.811-1';

export const RG_MG_GOLDEN = '27998111';
export const RG_MG_GOLDEN_MASKED = '2.799.811-1';
export const RG_MG_GOLDEN_PREFIXED = 'M27998111';

export const RG_PR_GOLDEN = '12345678';

export const RG_RS_GOLDEN = '1234567890';

export const RG_SC_GOLDEN = '123456789';

export const RG_UF_RULES: Record<RgUfCode, RgUfRules> = {
  SP: {
    uf: 'SP',
    canonicalLength: 9,
    baseLength: 8,
    dvAlgorithm: 'mod11-remainder',
    allowsCheckDigitX: true,
    supportsMask: true,
  },
  RJ: {
    uf: 'RJ',
    canonicalLength: 8,
    baseLength: 7,
    dvAlgorithm: 'mod10-alternating',
    allowsCheckDigitX: false,
    supportsMask: true,
  },
  MG: {
    uf: 'MG',
    canonicalLength: 8,
    baseLength: 7,
    dvAlgorithm: 'mod10-alternating',
    allowsCheckDigitX: false,
    allowsLetterPrefix: 'M',
    supportsMask: true,
  },
  PR: {
    uf: 'PR',
    canonicalLength: 8,
    baseLength: 8,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
  RS: {
    uf: 'RS',
    canonicalLength: 10,
    baseLength: 10,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: false,
  },
  SC: {
    uf: 'SC',
    canonicalLength: 9,
    baseLength: 9,
    dvAlgorithm: 'format-only',
    allowsCheckDigitX: false,
    supportsMask: true,
  },
};

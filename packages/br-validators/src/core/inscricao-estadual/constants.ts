/**
 * Inscrição Estadual — per-UF constants (Phase 8 v1: SP, MT, DF).
 * @see docs/IE-STATE-ALGORITHMS.md
 */
import type { UfCode } from '../../types/validation-result.js';

export type { UfCode };

export const IE_SUPPORTED_UFS: readonly UfCode[] = ['SP', 'MT', 'DF'];

export const IE_SP_LENGTH = 12;
export const IE_SP_DV1_WEIGHTS = [1, 3, 4, 5, 6, 7, 8, 10] as const;
export const IE_SP_DV2_WEIGHTS = [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const IE_SP_GOLDEN = '110042490114';
export const IE_SP_GOLDEN_MASKED = '110.042.490.114';
export const IE_SP_OFFICIAL_SOURCE_URL =
  'https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx';

export const IE_MT_CANONICAL_LENGTH = 9;
export const IE_MT_LEGACY_LENGTH = 11;
export const IE_MT_PREFIX = '13';
export const IE_MT_DV_WEIGHTS = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const IE_MT_GOLDEN_LEGACY = '00130000019';
export const IE_MT_GOLDEN_CANONICAL = '130000019';
export const IE_MT_OFFICIAL_SOURCE_URL =
  'https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=';

export const IE_DF_LENGTH = 13;
export const IE_DF_PREFIX = '07';
export const IE_DF_DV1_WEIGHTS = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const IE_DF_DV2_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const IE_DF_GOLDEN = '0730000100109';
export const IE_DF_GOLDEN_MASKED = '073.00001.001-09';
export const IE_DF_OFFICIAL_SOURCE_URL = 'https://www.receita.fazenda.df.gov.br/';

export const IE_OFFICIAL_SOURCE_URL = 'docs/IE-STATE-ALGORITHMS.md';

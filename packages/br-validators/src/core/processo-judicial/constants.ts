/**
 * CNJ número único de processo judicial — Resolução 65/2008, Anexo VIII (modulo 97-10).
 * @see https://atos.cnj.jus.br/atos/detalhar/119
 * @see https://www.cnj.jus.br/wp-content/uploads/2011/03/minuta_anexos_da_resoluo_numerao_nica_14_12_08.pdf
 */
export const PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL =
  'https://atos.cnj.jus.br/atos/detalhar/119';

export const PROCESSO_JUDICIAL_ANEXO_VIII_URL =
  'https://www.cnj.jus.br/wp-content/uploads/2011/03/minuta_anexos_da_resoluo_numerao_nica_14_12_08.pdf';

export const PROCESSO_JUDICIAL_LENGTH = 20;

export const PROCESSO_JUDICIAL_SEQUENCIAL_LENGTH = 7;
export const PROCESSO_JUDICIAL_DV_LENGTH = 2;
export const PROCESSO_JUDICIAL_ANO_LENGTH = 4;
export const PROCESSO_JUDICIAL_SEGMENTO_LENGTH = 1;
export const PROCESSO_JUDICIAL_TRIBUNAL_LENGTH = 2;
export const PROCESSO_JUDICIAL_ORIGEM_LENGTH = 4;

export const PROCESSO_JUDICIAL_MIN_SEGMENTO = 1;
export const PROCESSO_JUDICIAL_MAX_SEGMENTO = 9;

export const PROCESSO_JUDICIAL_NUMERIC_PATTERN = /^\d{20}$/;

export const PROCESSO_JUDICIAL_MASKED_PATTERN =
  /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/;

/** Fields from Resolução 65/2008 annex examples; DV computed per Anexo VIII. */
export const PROCESSO_JUDICIAL_GOLDEN_PRIMARY = '00001003420089210000';
export const PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED = '0000100-34.2008.9.21.0000';

export const PROCESSO_JUDICIAL_GOLDEN_SECONDARY = '00008354320154058000';
export const PROCESSO_JUDICIAL_GOLDEN_SECONDARY_MASKED = '0000835-43.2015.4.05.8000';

export const PROCESSO_JUDICIAL_GOLDEN_TJSP = '00000013920248260100';
export const PROCESSO_JUDICIAL_GOLDEN_TJSP_MASKED = '0000001-39.2024.8.26.0100';

/**
 * CNPJ constants — modulo 11 weights from RFB FAQ Q14.
 * @see https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf
 */
export const CNPJ_LENGTH = 14;
export const CNPJ_BASE_LENGTH = 12;

export const CNPJ_DV1_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const CNPJ_DV2_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

export const CNPJ_ALPHANUMERIC_PATTERN = /^[A-Z0-9]{12}[0-9]{2}$/;
export const CNPJ_NUMERIC_PATTERN = /^[0-9]{14}$/;

export const CNPJ_OFFICIAL_SOURCE_URL =
  'https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf';

/** RFB Q14 golden vector */
export const CNPJ_GOLDEN_ALPHANUMERIC = '12ABC34501DE35';

/** Valid numeric CNPJ for regression tests (modulo 11) */
export const CNPJ_GOLDEN_NUMERIC = '11222333000181';
export const CNPJ_GOLDEN_NUMERIC_MASKED = '11.222.333/0001-81';
export const CNPJ_GOLDEN_ALPHANUMERIC_MASKED = '12.ABC.345/01DE-35';

export const CNPJ_MASK_PATTERN = /^(.{2})(.{3})(.{3})(.{4})(.{2})$/;

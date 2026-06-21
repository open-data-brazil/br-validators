/**
 * PIS/PASEP/NIS/NIT constants — modulo 11 (CNIS unified registry).
 * @see https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf — RV_03
 * @see docs/use-cases/UC-006-validate-pis-pasep.md — golden vector 10027230888
 *
 * PIS, PASEP, NIS, and NIT share the same 11-digit algorithm and check-digit weights.
 */
export const PIS_PASEP_DV_WEIGHTS = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const PIS_PASEP_LENGTH = 11;
export const PIS_PASEP_BASE_LENGTH = 10;
export const PIS_PASEP_MASK_PATTERN = /^(\d{3})(\d{5})(\d{2})(\d{1})$/;

export const PIS_PASEP_GOLDEN_PRIMARY = '10027230888';
export const PIS_PASEP_GOLDEN_SECONDARY = '12056456402';
export const PIS_PASEP_GOLDEN_PRIMARY_MASKED = '100.27230.88-8';
export const PIS_PASEP_OFFICIAL_SOURCE_URL =
  'https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf';

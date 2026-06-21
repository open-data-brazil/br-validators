/**
 * CPF constants — modulo 11 weights (RFB standard).
 * @see https://www.gov.br/receitafederal/pt-br/assuntos/cpf
 * @see docs/use-cases/UC-001-validate-cpf.md — golden vector 12345678909
 */
export const CPF_DV1_WEIGHTS = [10, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const CPF_DV2_WEIGHTS = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const CPF_LENGTH = 11;
export const CPF_BASE_LENGTH = 9;
export const CPF_NUMERIC_PATTERN = /^\d{11}$/;
export const CPF_MASK_PATTERN = /^(\d{3})(\d{3})(\d{3})(\d{2})$/;

export const CPF_GOLDEN_PRIMARY = '12345678909';
export const CPF_GOLDEN_SECONDARY = '11144477735';
export const CPF_GOLDEN_PRIMARY_MASKED = '123.456.789-09';
export const CPF_OFFICIAL_SOURCE_URL =
  'https://www.gov.br/receitafederal/pt-br/assuntos/cpf';

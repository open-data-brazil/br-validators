/**
 * CEP constants — 8 digits, no check digit (Correios).
 * @see https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep
 * @see docs/VALIDATION-RULES.md BR-CEP-001 — golden vector 01310100
 */
export const CEP_LENGTH = 8;
export const CEP_MASK_PATTERN = /^(\d{5})(\d{3})$/;
export const CEP_NUMERIC_PATTERN = /^\d{8}$/;

export const CEP_GOLDEN_PRIMARY = '01310100';
export const CEP_GOLDEN_SECONDARY = '20040020';
export const CEP_GOLDEN_PRIMARY_MASKED = '01310-100';
export const CEP_OFFICIAL_SOURCE_URL =
  'https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep';

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

export const CEP_FAIXA_CNEFE_BASE_URL =
  'https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF';

export const CEP_FAIXA_GOLDEN_PREFIX_SP = '01310';
export const CEP_FAIXA_GOLDEN_PREFIX_RJ = '20040';
export const CEP_FAIXA_MIN_PREFIXES = 20_000;
export const CEP_FAIXA_MAX_PREFIXES = 50_000;

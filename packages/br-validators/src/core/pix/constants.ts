/**
 * PIX key constants — Bacen DICT API + Manual de Iniciação do Pix.
 * @see https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html
 * @see https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf
 * @see docs/use-cases/UC-005-validate-pix-key.md
 */
export const PIX_EMAIL_MAX_LENGTH = 77;
export const PIX_EMAIL_PATTERN =
  /^[a-z0-9.!#$'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

export const PIX_PHONE_E164_PATTERN = /^\+[1-9]\d{1,14}$/;
export const PIX_PHONE_BR_MOBILE_PATTERN = /^\+55\d{2}9\d{8}$/;

export const PIX_EVP_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const PIX_CPF_DIGITS_PATTERN = /^[0-9]{11}$/;

export const PIX_GOLDEN_CPF = '12345678909';
export const PIX_GOLDEN_CNPJ_NUMERIC = '11222333000181';
export const PIX_GOLDEN_CNPJ_ALPHANUMERIC = '12ABC34501DE35';
export const PIX_GOLDEN_EMAIL = 'pix@bcb.gov.br';
export const PIX_GOLDEN_PHONE = '+5510998765432';
export const PIX_GOLDEN_PHONE_SECONDARY = '+5561912345678';
export const PIX_GOLDEN_EVP = '123e4567-e89b-12d3-a456-426655440000';
export const PIX_GOLDEN_EMAIL_SECONDARY = 'fulano_da_silva.recebedor@example.com';

export const PIX_OFFICIAL_SOURCE_URL =
  'https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf';

export const PIX_DICT_API_SOURCE_URL =
  'https://aprendervalor.bcb.gov.br/content/estabilidadefinanceira/pix/API-DICT_v2-9-0.html';

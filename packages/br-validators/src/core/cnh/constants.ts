/**
 * CNH constants — Registro Nacional modulo 11 (CONTRAN / SENATRAN).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/Resolucao8862021.pdf
 * @see https://www.gov.br/pt-br/servicos/validar-cnh
 * @see https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-cnh/ — algorithm cross-check (AdvPL)
 * @see https://www.geravalida.com.br/validador-cnh — implementation cross-check
 * @see https://geradorbr.com/validador-de-cnh/ — implementation cross-check
 */
export const CNH_DV1_WEIGHTS = [9, 8, 7, 6, 5, 4, 3, 2, 1] as const;
export const CNH_DV2_WEIGHTS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const CNH_LENGTH = 11;
export const CNH_BASE_LENGTH = 9;
export const CNH_NUMERIC_PATTERN = /^\d{11}$/;

/** Golden primary — DV walkthrough: base `624729276` → DV `37`. */
export const CNH_GOLDEN_PRIMARY = '62472927637';
export const CNH_GOLDEN_SECONDARY = '69044271146';
export const CNH_GOLDEN_DISCOUNT_CASE = '00000001801';

/** Non-official CPF-style decoration — accepted on input via strip, never emitted by format. */
export const CNH_GOLDEN_PRIMARY_DECORATED_INPUT = '624.729.276-37';

export const CNH_OFFICIAL_SOURCE_URL =
  'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf';

/** SENATRAN online validation — requires plain 11-digit registration number. */
export const CNH_SENATRAN_VALIDAR_URL = 'https://www.gov.br/pt-br/servicos/validar-cnh';

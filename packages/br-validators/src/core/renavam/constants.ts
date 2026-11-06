/**
 * RENAVAM constants — modulo 11, peso 9 (DENATRAN / SENATRAN).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf
 * @see https://www.gov.br/pt-br/servicos/consultar-dados-de-veiculo-na-base-renavam
 * @see https://siga0984.wordpress.com/2019/05/01/algoritmos-validacao-de-renavam/ — algorithm cross-check (AdvPL)
 * @see https://www.geravalida.com.br/gerador-de-renavam — implementation cross-check
 * @see https://geradorfacil.com/geradores/renavam — implementation cross-check
 */
export const RENAVAM_DV_WEIGHTS = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
export const RENAVAM_LENGTH = 11;
export const RENAVAM_BASE_LENGTH = 10;
export const RENAVAM_NUMERIC_PATTERN = /^\d{11}$/;

/** Golden primary — DV walkthrough: base `6397779110` → DV `4`. */
export const RENAVAM_GOLDEN_PRIMARY = '63977791104';
export const RENAVAM_GOLDEN_SECONDARY = '72176426415';
export const RENAVAM_GOLDEN_LEADING_ZEROS = '00207104255';
export const RENAVAM_GOLDEN_DV_ZERO = '12345678900';

/** Optional dash before check digit — accepted on input via strip, never emitted by format. */
export const RENAVAM_GOLDEN_DASH_INPUT = '7217642641-5';

export const RENAVAM_OFFICIAL_SOURCE_URL =
  'https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf';

/** SENATRAN online vehicle lookup — requires RENAVAM + plate + owner CPF/CNPJ. */
export const RENAVAM_SENATRAN_CONSULTA_URL =
  'https://www.gov.br/pt-br/servicos/consultar-dados-de-veiculo-na-base-renavam';

/**
 * Brazilian telephone constants — Anatel national area codes (CN/DDD).
 * @see https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro
 * @see https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais
 * @see https://www.gov.br/anatel/pt-br/regulado/numeracao/nono-digito
 */
export const TELEFONE_COUNTRY_CODE = '55';

/** 67 official Anatel national area codes (CN / DDD). */
export const ANATEL_DDDS = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24',
  '27', '28',
  '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46',
  '47', '48', '49',
  '51', '53', '54', '55',
  '61',
  '62', '64',
  '63',
  '65', '66',
  '67',
  '68',
  '69',
  '71', '73', '74', '75', '77',
  '79',
  '81', '87',
  '82',
  '83',
  '84',
  '85', '88',
  '86', '89',
  '91', '93', '94',
  '92', '97',
  '95',
  '96',
  '98', '99',
] as const;

export const ANATEL_DDD_SET: ReadonlySet<string> = new Set(ANATEL_DDDS);

export const TELEFONE_CELULAR_LOCAL_LENGTH = 9;
export const TELEFONE_FIXO_LOCAL_LENGTH = 8;
export const TELEFONE_DDD_LENGTH = 2;

export const TELEFONE_CELULAR_MASK_PATTERN = /^(\d{2})(\d{5})(\d{4})$/;
export const TELEFONE_FIXO_MASK_PATTERN = /^(\d{2})(\d{4})(\d{4})$/;

/** Emergency / public utility short codes — out of subscriber scope (BR-TEL-007). */
export const TELEFONE_EMERGENCY_CODES = new Set(['190', '192', '193', '197', '198', '199']);

export const TELEFONE_GOLDEN_CELULAR = '11999999999';
export const TELEFONE_GOLDEN_CELULAR_MASKED = '(11) 99999-9999';
export const TELEFONE_GOLDEN_FIXO = '1133333333';
export const TELEFONE_GOLDEN_FIXO_MASKED = '(11) 3333-3333';

export const TELEFONE_OFFICIAL_SOURCE_URL =
  'https://www.gov.br/anatel/pt-br/regulado/numeracao/plano-de-numeracao-brasileiro';

export const TELEFONE_ANATEL_DDD_PANEL_URL =
  'https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais';

/**
 * Credit card PAN constants — ISO/IEC 7812-1 Annex B (Luhn).
 * @see https://www.iso.org/standard/70484.html
 * @see docs/use-cases/UC-008-validate-cartao-credito.md
 */
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'unknown';

export const CARTAO_PAN_MIN_LENGTH = 8;
export const CARTAO_PAN_MAX_LENGTH = 19;

export const CARTAO_GOLDEN_VISA = '4111111111111111';
export const CARTAO_GOLDEN_MASTERCARD = '5555555555554444';
export const CARTAO_GOLDEN_AMEX = '378282246310005';
export const CARTAO_GOLDEN_LUHN_WALKTHROUGH = '79927398713';
export const CARTAO_GOLDEN_VISA_MASKED = '4111 1111 1111 1111';
export const CARTAO_GOLDEN_MIN_LENGTH = '12345674';

export const CARTAO_OFFICIAL_SOURCE_URL = 'https://www.iso.org/standard/70484.html';
export const CARTAO_IEC_SOURCE_URL = 'https://webstore.iec.ch/en/publication/59763';

/** Best-effort IIN prefixes — longest match first (BR-LUHN-005, non-authoritative). */
export const ELO_IIN_PREFIXES = [
  '401178',
  '401179',
  '431274',
  '438935',
  '451416',
  '457393',
  '457631',
  '457632',
  '504175',
  '506699',
  '506770',
  '509048',
  '509049',
  '627780',
  '636297',
  '636368',
  '650031',
  '650032',
  '650033',
  '650035',
  '650051',
  '650405',
  '650439',
  '650485',
  '650486',
  '650487',
  '650488',
  '650489',
  '650490',
  '650491',
  '650492',
  '650493',
  '650494',
  '650495',
  '650496',
  '650497',
  '650498',
  '650499',
  '651652',
  '651653',
  '651654',
  '651655',
  '651656',
  '651657',
  '651658',
  '651659',
  '651660',
  '655000',
  '655001',
] as const;

export const HIPERCARD_IIN_PREFIXES = ['606282', '384100'] as const;

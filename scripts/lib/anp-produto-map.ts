/**
 * ANP fuel product label normalization — ported from TABELA-ANP-COMBUSTIVEIS FuelProductNormalizationRule.
 * @see https://github.com/AlexandreZanata/TABELA-ANP-COMBUSTIVEIS
 */

export const ANP_COMBUSTIVEL_VALUES = [
  'ETHANOL',
  'GASOLINE_REGULAR',
  'GASOLINE_PREMIUM',
  'DIESEL_S500',
  'DIESEL_S10',
  'CNG',
  'LPG_P13',
] as const;

export type AnpCombustivel = (typeof ANP_COMBUSTIVEL_VALUES)[number];

const LABEL_TO_PRODUCT: Readonly<Record<string, AnpCombustivel>> = {
  'ETANOL HIDRATADO': 'ETHANOL',
  ETANOL: 'ETHANOL',
  'GASOLINA COMUM': 'GASOLINE_REGULAR',
  'GASOLINA ADITIVADA': 'GASOLINE_PREMIUM',
  'OLEO DIESEL': 'DIESEL_S500',
  'DIESEL S500': 'DIESEL_S500',
  'OLEO DIESEL S10': 'DIESEL_S10',
  'DIESEL S10': 'DIESEL_S10',
  GNV: 'CNG',
  GLP: 'LPG_P13',
};

export function normalizeAnpProdutoLabel(rawLabel: string): AnpCombustivel | null {
  const normalized = rawLabel.trim().toUpperCase();
  if (normalized.length === 0) {
    return null;
  }
  return LABEL_TO_PRODUCT[normalized] ?? null;
}

export function isAnpCombustivel(value: string): value is AnpCombustivel {
  return (ANP_COMBUSTIVEL_VALUES as readonly string[]).includes(value);
}

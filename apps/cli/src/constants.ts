export const SUPPORTED_TYPES = ['cnpj', 'cpf', 'cep', 'placa', 'pis-pasep', 'pix'] as const;

export type SupportedType = (typeof SUPPORTED_TYPES)[number];

export const EXIT = {
  OK: 0,
  INVALID: 1,
  USAGE: 2,
} as const;

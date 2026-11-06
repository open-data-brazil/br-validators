import type { GeneratableDocumentType } from '@br-validators/core';
import type { Messages } from '@/lib/i18n/messages/en';

export type PlatformGeneratableTypeKey = keyof Messages['platform']['generate']['types'];

export type PlatformGeneratableEntry = {
  value: GeneratableDocumentType;
  labelKey: PlatformGeneratableTypeKey;
  formats?: readonly string[];
  ufSelector?: boolean;
  brandSelector?: boolean;
};

/** Core `generate()` types exposed on the platform Generate page. */
export const PLATFORM_GENERATABLE: readonly PlatformGeneratableEntry[] = [
  { value: 'cpf', labelKey: 'cpf' },
  { value: 'cnpj', labelKey: 'cnpj', formats: ['numeric', 'alphanumeric'] },
  { value: 'cep', labelKey: 'cep' },
  { value: 'telefone', labelKey: 'telefone', formats: ['celular', 'fixo'] },
  { value: 'placa', labelKey: 'placa', formats: ['mercosul', 'legacy'] },
  { value: 'pis-pasep', labelKey: 'pisPasep' },
  { value: 'cnh', labelKey: 'cnh' },
  { value: 'renavam', labelKey: 'renavam' },
  { value: 'inscricao-estadual', labelKey: 'inscricaoEstadual', ufSelector: true },
  { value: 'inscricao-estadual-produtor-rural', labelKey: 'inscricaoEstadualProdutorRural' },
  { value: 'titulo-eleitor', labelKey: 'tituloEleitor', ufSelector: true },
  {
    value: 'cartao-credito',
    labelKey: 'cartaoCredito',
    formats: ['visa', 'mastercard', 'amex', 'elo', 'hipercard'],
    brandSelector: true,
  },
  { value: 'pix', labelKey: 'pix' },
  { value: 'nfe-chave', labelKey: 'nfeChave' },
  { value: 'brcode', labelKey: 'brcode' },
  { value: 'boleto', labelKey: 'boleto' },
  { value: 'boleto-arrecadacao', labelKey: 'boletoArrecadacao' },
] as const;

export function findPlatformGeneratable(type: GeneratableDocumentType): PlatformGeneratableEntry | undefined {
  return PLATFORM_GENERATABLE.find((item) => item.value === type);
}

export function platformGeneratableLabel(
  messages: Messages,
  entry: PlatformGeneratableEntry,
): string {
  return messages.platform.generate.types[entry.labelKey];
}

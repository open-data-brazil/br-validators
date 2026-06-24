import type { UfCode, ValidationErrorCode } from '@br-validators/core';

/** Core validator type ids supported by `brValidate()`. */
export type BrValidatorTypeId =
  | 'cpf'
  | 'cnpj'
  | 'cep'
  | 'placa'
  | 'pis-pasep'
  | 'pix'
  | 'telefone'
  | 'boleto'
  | 'cartao-credito'
  | 'cnh'
  | 'renavam'
  | 'nfe-chave'
  | 'titulo-eleitor'
  | 'processo-judicial'
  | 'inscricao-estadual'
  | 'inscricao-estadual-produtor-rural'
  | 'brcode'
  | 'rg';

export const BR_VALIDATOR_TYPE_IDS = [
  'cpf',
  'cnpj',
  'cep',
  'placa',
  'pis-pasep',
  'pix',
  'telefone',
  'boleto',
  'cartao-credito',
  'cnh',
  'renavam',
  'nfe-chave',
  'titulo-eleitor',
  'processo-judicial',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'brcode',
  'rg',
] as const satisfies readonly BrValidatorTypeId[];

export type BrValidateLocation = 'body' | 'query' | 'params';

export type BrValidateFieldSchema = Record<string, BrValidatorTypeId>;

export type BrValidateUfSource =
  | { from: BrValidateLocation; field: string }
  | { value: UfCode };

export type BrValidateOptions = {
  body?: BrValidateFieldSchema;
  query?: BrValidateFieldSchema;
  params?: BrValidateFieldSchema;
  /** Required for `inscricao-estadual`, `inscricao-estadual-produtor-rural`, and `rg`. */
  uf?: BrValidateUfSource;
};

export type BrValidationErrorResponse = {
  ok: false;
  field: string;
  code: ValidationErrorCode;
  message: string;
};

export type BrValidateRequest = {
  body?: object;
  query?: object;
  params?: object;
};

export type BrValidateResponse = {
  status(code: number): BrValidateResponse;
  json(body: BrValidationErrorResponse): void;
};

export type BrValidateNext = () => void;

export function isBrValidatorTypeId(value: string): value is BrValidatorTypeId {
  return (BR_VALIDATOR_TYPE_IDS as readonly string[]).includes(value);
}

export type BrValidateFieldRef = {
  location: BrValidateLocation;
  field: string;
  typeId: BrValidatorTypeId;
};

export type DocumentFormat = 'numeric' | 'alphanumeric';

export type ValidationErrorCode =
  | 'INVALID_LENGTH'
  | 'INVALID_CHARACTER'
  | 'INVALID_CHECK_DIGIT'
  | 'KNOWN_INVALID_PATTERN'
  | 'UNSUPPORTED_FORMAT'
  | 'EMPTY_INPUT';

export type ValidationResult<T extends string = string> =
  | { ok: true; value: T; format: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string };

export type FormatResult =
  | { ok: true; formatted: string }
  | { ok: false; code: ValidationErrorCode; message: string };

export type Cnpj = string & { readonly __brand: 'Cnpj' };
export type Cpf = string & { readonly __brand: 'Cpf' };

export function brandCnpj(value: string): Cnpj {
  return value as Cnpj;
}

export function brandCpf(value: string): Cpf {
  return value as Cpf;
}

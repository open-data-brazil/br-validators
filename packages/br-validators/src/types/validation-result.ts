export type DocumentFormat =
  | 'numeric'
  | 'alphanumeric'
  | 'legacy'
  | 'mercosul'
  | 'email'
  | 'phone'
  | 'evp';

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

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
export type Cep = string & { readonly __brand: 'Cep' };
export type Placa = string & { readonly __brand: 'Placa' };
export type PisPasep = string & { readonly __brand: 'PisPasep' };
export type PixKey = string & { readonly __brand: 'PixKey' };

export type PixValidationResult =
  | { ok: true; value: PixKey; keyType: PixKeyType; format: DocumentFormat }
  | { ok: false; code: ValidationErrorCode; message: string; keyType?: PixKeyType };

export function brandCnpj(value: string): Cnpj {
  return value as Cnpj;
}

export function brandCpf(value: string): Cpf {
  return value as Cpf;
}

export function brandCep(value: string): Cep {
  return value as Cep;
}

export function brandPlaca(value: string): Placa {
  return value as Placa;
}

export function brandPisPasep(value: string): PisPasep {
  return value as PisPasep;
}

export function brandPixKey(value: string): PixKey {
  return value as PixKey;
}

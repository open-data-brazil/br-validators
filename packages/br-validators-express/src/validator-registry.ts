import {
  validateBoleto,
  validateBrCode,
  validateCartaoCredito,
  validateCep,
  validateCnh,
  validateCnpj,
  validateCpf,
  validateIeProdutorRural,
  validateInscricaoEstadual,
  validateNfeChave,
  validatePisPasep,
  validatePixKey,
  validatePlaca,
  validateProcessoJudicial,
  validateRenavam,
  validateRg,
  validateTelefone,
  validateTituloEleitor,
  RG_SUPPORTED_UFS,
  type RgUfCode,
  type UfCode,
  type ValidationErrorCode,
} from '@br-validators/core';
import type { BrValidatorTypeId } from './types.js';

export type ValidatorContext = {
  uf?: UfCode;
};

export type ValidatorOutcome =
  | { ok: true }
  | { ok: false; code: ValidationErrorCode; message: string };

export type ValidatorRunner = (value: string, context: ValidatorContext) => ValidatorOutcome;

const UF_REQUIRED_TYPES = new Set<BrValidatorTypeId>([
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'rg',
]);

export function requiresUf(typeId: BrValidatorTypeId): boolean {
  return UF_REQUIRED_TYPES.has(typeId);
}

function missingUfFailure(): ValidatorOutcome {
  return {
    ok: false,
    code: 'UNSUPPORTED_FORMAT',
    message: 'UF is required for this field — configure brValidate({ uf: { from, field } }) or { value }',
  };
}

function runWithUf(
  context: ValidatorContext,
  validate: (value: string, uf: UfCode) => ValidatorOutcome,
): (value: string, ctx: ValidatorContext) => ValidatorOutcome {
  return (value, ctx) => {
    const uf = ctx.uf ?? context.uf;
    if (!uf) {
      return missingUfFailure();
    }
    return validate(value, uf);
  };
}

function isRgUf(uf: UfCode): uf is RgUfCode {
  return (RG_SUPPORTED_UFS as readonly string[]).includes(uf);
}

const VALIDATORS: Record<BrValidatorTypeId, ValidatorRunner> = {
  cpf: (value) => validateCpf(value),
  cnpj: (value) => validateCnpj(value),
  cep: (value) => validateCep(value),
  placa: (value) => validatePlaca(value),
  'pis-pasep': (value) => validatePisPasep(value),
  pix: (value) => validatePixKey(value),
  telefone: (value) => validateTelefone(value),
  boleto: (value) => validateBoleto(value),
  'cartao-credito': (value) => validateCartaoCredito(value),
  cnh: (value) => validateCnh(value),
  renavam: (value) => validateRenavam(value),
  'nfe-chave': (value) => validateNfeChave(value),
  'titulo-eleitor': (value) => validateTituloEleitor(value),
  'processo-judicial': (value) => validateProcessoJudicial(value),
  brcode: (value) => validateBrCode(value),
  'inscricao-estadual': runWithUf({}, (value, uf) => validateInscricaoEstadual(value, { uf })),
  'inscricao-estadual-produtor-rural': runWithUf({}, (value, uf) => validateIeProdutorRural(uf, value)),
  rg: runWithUf({}, (value, uf) => {
    if (!isRgUf(uf)) {
      return {
        ok: false,
        code: 'UF_NOT_IMPLEMENTED',
        message: `UF ${uf} is not implemented for RG validation`,
      };
    }
    return validateRg(value, { uf });
  }),
};

export function runBrValidator(
  typeId: BrValidatorTypeId,
  value: string,
  context: ValidatorContext,
): ValidatorOutcome {
  return VALIDATORS[typeId](value, context);
}

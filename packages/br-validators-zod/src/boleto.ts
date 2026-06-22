import { validateBoleto } from '@br-validators/core/boleto';
import type { BoletoInputKind, BoletoSituacao, BoletoValidationResult, ValidateBoletoOptions } from '@br-validators/core';
import type { z } from 'zod';
import { createBrStringSchema } from './create-schema.js';

export type BoletoSchemaOutput = {
  value: string;
  inputKind: BoletoInputKind;
  situacao: BoletoSituacao;
};

type BoletoSuccess = Extract<BoletoValidationResult, { ok: true }>;

export function createBoletoSchema(
  options?: ValidateBoletoOptions,
): z.ZodType<BoletoSchemaOutput, z.ZodTypeDef, string> {
  return createBrStringSchema<BoletoSuccess, BoletoSchemaOutput>(
    (input) => validateBoleto(input, options),
    (success) => ({
      value: success.value,
      inputKind: success.inputKind,
      situacao: success.situacao,
    }),
  );
}

export const boletoSchema = createBoletoSchema();

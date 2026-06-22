import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';
import type {
  InscricaoEstadualValidationResult,
  UfCode,
  ValidateInscricaoEstadualOptions,
} from '@br-validators/core';
import type { z } from 'zod';
import { createBrStringSchema } from './create-schema.js';

export type InscricaoEstadualSchemaOutput = { value: string; uf: UfCode };

type IeSuccess = Extract<InscricaoEstadualValidationResult, { ok: true }>;

export function createInscricaoEstadualSchema(
  options: ValidateInscricaoEstadualOptions,
): z.ZodType<InscricaoEstadualSchemaOutput, z.ZodTypeDef, string> {
  return createBrStringSchema<IeSuccess, InscricaoEstadualSchemaOutput>(
    (input) => validateInscricaoEstadual(input, options),
    (success) => ({
      value: success.value,
      uf: success.uf,
    }),
  );
}

export const inscricaoEstadualSpSchema = createInscricaoEstadualSchema({ uf: 'SP' });

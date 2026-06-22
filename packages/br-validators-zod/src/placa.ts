import { validatePlaca } from '@br-validators/core/placa';
import type { DocumentFormat, ValidationResult, Placa } from '@br-validators/core';
import { createBrStringSchema } from './create-schema.js';

export type PlacaSchemaOutput = { value: string; format: Extract<DocumentFormat, 'legacy' | 'mercosul'> };

type PlacaSuccess = Extract<ValidationResult<Placa>, { ok: true }>;

export const placaSchema = createBrStringSchema<PlacaSuccess, PlacaSchemaOutput>(
  validatePlaca,
  (success) => ({
    value: success.value,
    format: success.format as PlacaSchemaOutput['format'],
  }),
);

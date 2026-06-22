import { validateTelefone } from '@br-validators/core/telefone';
import type { TelefoneTipo, TelefoneValidationResult } from '@br-validators/core';
import { createBrStringSchema } from './create-schema.js';

export type TelefoneSchemaOutput = { value: string; tipo: TelefoneTipo };

type TelefoneSuccess = Extract<TelefoneValidationResult, { ok: true }>;

export const telefoneSchema = createBrStringSchema<TelefoneSuccess, TelefoneSchemaOutput>(
  validateTelefone,
  (success) => ({
    value: success.value,
    tipo: success.tipo,
  }),
);

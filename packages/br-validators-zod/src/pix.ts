import { validatePixKey } from '@br-validators/core/pix';
import type { PixKeyType, PixValidationResult, ValidatePixKeyOptions } from '@br-validators/core';
import type { z } from 'zod';
import { createBrStringSchema } from './create-schema.js';

export type PixKeySchemaOutput = { value: string; keyType: PixKeyType };

type PixSuccess = Extract<PixValidationResult, { ok: true }>;

export function createPixKeySchema(
  options?: ValidatePixKeyOptions,
): z.ZodType<PixKeySchemaOutput, z.ZodTypeDef, string> {
  return createBrStringSchema<PixSuccess, PixKeySchemaOutput>(
    (input) => validatePixKey(input, options),
    (success) => ({
      value: success.value,
      keyType: success.keyType,
    }),
  );
}

/** Detects PIX key type via Bacen precedence rules. */
export const pixKeySchema = createPixKeySchema();

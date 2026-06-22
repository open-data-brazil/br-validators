import { z } from 'zod';

export type BrValidationFailure = { ok: false; message: string };

export type BrValidationSuccess<T extends Record<string, unknown>> = { ok: true } & T;

export type BrValidateFn<TSuccess extends BrValidationSuccess<{ value: string }>> = (
  input: string,
) => TSuccess | BrValidationFailure;

/**
 * Builds a Zod string schema that delegates validation to @br-validators/core validate*.
 * Invalid input surfaces core `message` via Zod custom issues.
 */
export function createBrStringSchema<
  TSuccess extends BrValidationSuccess<{ value: string }>,
  TOutput,
>(
  validate: BrValidateFn<TSuccess>,
  mapOutput: (success: TSuccess) => TOutput,
): z.ZodType<TOutput, z.ZodTypeDef, string> {
  return z.string().transform((input, ctx) => {
    const result = validate(input);
    if (!result.ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.message,
      });
      return z.NEVER;
    }
    return mapOutput(result);
  });
}

/** Maps success to canonical `value` only — CPF, CNPJ, CEP pattern. */
export function mapCanonicalValue(success: { value: string }): string {
  return success.value;
}

import type { FieldValues, RegisterOptions, Resolver, ResolverResult, ValidateResult } from 'react-hook-form';

export function runRuleValidate(rule: RegisterOptions, value: unknown): ValidateResult {
  const { validate } = rule;
  if (typeof validate !== 'function') {
    throw new Error('Expected validate function on rule');
  }
  const result = validate(value, {});
  if (result instanceof Promise) {
    throw new Error('Expected sync validate');
  }
  return result;
}

export function runResolver<TFieldValues extends FieldValues>(
  resolver: Resolver<TFieldValues>,
  values: TFieldValues,
): ResolverResult<TFieldValues, TFieldValues> {
  const result = resolver(values, undefined, { fields: {}, shouldUseNativeValidation: false });
  if (result instanceof Promise) {
    throw new Error('Expected sync resolver');
  }
  return result;
}

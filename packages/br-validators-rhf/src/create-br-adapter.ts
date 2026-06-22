import type { FieldErrors, FieldValues, RegisterOptions, Resolver } from 'react-hook-form';

export type BrValidateResult = { ok: true } | { ok: false; message: string };

export type BrValidateFn = (input: string) => BrValidateResult;

export type BrRuleOptions = {
  required?: boolean | string;
};

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

function requiredMessage(required: boolean | string): string {
  return typeof required === 'string' ? required : 'Required';
}

export function createBrRule<TFieldValues extends FieldValues>(
  validate: BrValidateFn,
  options?: BrRuleOptions,
): RegisterOptions<TFieldValues> {
  const validateFn = (value: unknown): string | boolean => {
    if (isEmptyValue(value)) {
      if (options?.required) {
        return requiredMessage(options.required);
      }
      return true;
    }
    if (typeof value !== 'string') {
      return 'Value must be a string';
    }
    const result = validate(value);
    return result.ok || result.message;
  };

  return {
    required: options?.required,
    validate: validateFn,
  };
}

export function createBrResolver<TFieldValues extends FieldValues>(
  fieldName: keyof TFieldValues & string,
  validate: BrValidateFn,
): Resolver<TFieldValues> {
  return (values) => {
    const raw = values[fieldName];
    if (isEmptyValue(raw)) {
      return { values, errors: {} };
    }
    if (typeof raw !== 'string') {
      const errors = {
        [fieldName]: { type: 'custom', message: 'Value must be a string' },
      } as FieldErrors<TFieldValues>;
      return { values: {}, errors };
    }
    const result = validate(raw);
    if (result.ok) {
      return { values, errors: {} };
    }
    const errors = {
      [fieldName]: { type: 'custom', message: result.message },
    } as FieldErrors<TFieldValues>;
    return { values: {}, errors };
  };
}

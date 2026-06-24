import type {
  BrValidateFieldRef,
  BrValidateLocation,
  BrValidateNext,
  BrValidateOptions,
  BrValidateRequest,
  BrValidateResponse,
  BrValidateUfSource,
  BrValidationErrorResponse,
} from './types.js';
import type { UfCode } from '@br-validators/core';
import { requiresUf, runBrValidator } from './validator-registry.js';

function readRecordField(record: object | undefined, field: string): unknown {
  if (!record) {
    return undefined;
  }
  return Object.prototype.hasOwnProperty.call(record, field)
    ? record[field as keyof typeof record]
    : undefined;
}

function collectFieldRefs(
  location: BrValidateLocation,
  schema: Record<string, import('./types.js').BrValidatorTypeId> | undefined,
): BrValidateFieldRef[] {
  if (!schema) {
    return [];
  }
  return Object.entries(schema).map(([field, typeId]) => ({
    location,
    field,
    typeId,
  }));
}

export function listBrValidateFields(options: BrValidateOptions): BrValidateFieldRef[] {
  return [
    ...collectFieldRefs('body', options.body),
    ...collectFieldRefs('query', options.query),
    ...collectFieldRefs('params', options.params),
  ];
}

function readLocationRecord(req: BrValidateRequest, location: BrValidateLocation): object | undefined {
  switch (location) {
    case 'body':
      return req.body;
    case 'query':
      return req.query;
    case 'params':
      return req.params;
  }
}

export function resolveBrValidateUf(
  source: BrValidateUfSource | undefined,
  req: BrValidateRequest,
): UfCode | undefined {
  if (!source) {
    return undefined;
  }
  if ('value' in source) {
    return source.value;
  }
  const raw = readRecordField(readLocationRecord(req, source.from), source.field);
  if (typeof raw !== 'string' || raw.trim() === '') {
    return undefined;
  }
  return raw.trim().toUpperCase() as UfCode;
}

function validationError(
  field: string,
  code: BrValidationErrorResponse['code'],
  message: string,
): BrValidationErrorResponse {
  return { ok: false, field, code, message };
}

function respondValidationError(res: BrValidateResponse, error: BrValidationErrorResponse): void {
  res.status(400).json(error);
}

export function createBrValidateHandler(options: BrValidateOptions) {
  const fields = listBrValidateFields(options);

  return (req: BrValidateRequest, res: BrValidateResponse, next: BrValidateNext): void => {
    const uf = resolveBrValidateUf(options.uf, req);

    for (const { location, field, typeId } of fields) {
      if (requiresUf(typeId) && !uf) {
        respondValidationError(
          res,
          validationError(
            field,
            'UNSUPPORTED_FORMAT',
            'UF is required for this field — configure brValidate({ uf: { from, field } }) or { value }',
          ),
        );
        return;
      }

      const raw = readRecordField(readLocationRecord(req, location), field);

      if (raw === undefined || raw === null) {
        respondValidationError(res, validationError(field, 'EMPTY_INPUT', 'Field is required'));
        return;
      }

      if (typeof raw !== 'string') {
        respondValidationError(res, validationError(field, 'UNSUPPORTED_FORMAT', 'Value must be a string'));
        return;
      }

      if (raw.trim() === '') {
        respondValidationError(res, validationError(field, 'EMPTY_INPUT', 'Field must not be empty'));
        return;
      }

      const result = runBrValidator(typeId, raw, { uf });
      if (!result.ok) {
        respondValidationError(res, validationError(field, result.code, result.message));
        return;
      }
    }

    next();
  };
}

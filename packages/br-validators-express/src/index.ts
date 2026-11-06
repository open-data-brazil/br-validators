import type { RequestHandler } from 'express';
import { createBrValidateHandler } from './br-validate.js';
import type { BrValidateOptions } from './types.js';

/**
 * Express middleware factory — validates request fields with @br-validators/core.
 * Invalid input responds with HTTP 400 and `{ ok: false, field, code, message }`.
 */
export function brValidate(options: BrValidateOptions): RequestHandler {
  const handler = createBrValidateHandler(options);
  return (req, res, next) => {
    handler(req, res, next);
  };
}

export { createBrValidateHandler } from './br-validate.js';
export {
  BR_VALIDATOR_TYPE_IDS,
  isBrValidatorTypeId,
  type BrValidateFieldSchema,
  type BrValidateLocation,
  type BrValidateOptions,
  type BrValidateUfSource,
  type BrValidationErrorResponse,
  type BrValidatorTypeId,
} from './types.js';
export { requiresUf } from './validator-registry.js';

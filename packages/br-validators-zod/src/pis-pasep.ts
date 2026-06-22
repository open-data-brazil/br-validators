import { validatePisPasep } from '@br-validators/core/pis-pasep';
import { createBrStringSchema, mapCanonicalValue } from './create-schema.js';

export const pisPasepSchema = createBrStringSchema(validatePisPasep, mapCanonicalValue);

/** Alias aligned with TASKS draft naming. */
export const pisSchema = pisPasepSchema;

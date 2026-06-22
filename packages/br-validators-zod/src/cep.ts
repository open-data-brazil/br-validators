import { validateCep } from '@br-validators/core/cep';
import { createBrStringSchema, mapCanonicalValue } from './create-schema.js';

export const cepSchema = createBrStringSchema(validateCep, mapCanonicalValue);

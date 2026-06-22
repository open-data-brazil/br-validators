import { validateCnpj } from '@br-validators/core/cnpj';
import { createBrStringSchema, mapCanonicalValue } from './create-schema.js';

export const cnpjSchema = createBrStringSchema(validateCnpj, mapCanonicalValue);

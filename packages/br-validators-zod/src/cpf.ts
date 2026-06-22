import { validateCpf } from '@br-validators/core/cpf';
import { createBrStringSchema, mapCanonicalValue } from './create-schema.js';

export const cpfSchema = createBrStringSchema(validateCpf, mapCanonicalValue);

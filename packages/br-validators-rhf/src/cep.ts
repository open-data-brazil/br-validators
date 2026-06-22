import { validateCep } from '@br-validators/core/cep';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function cepRule(options?: BrRuleOptions) {
  return createBrRule(validateCep, options);
}

export function cepResolver() {
  return createBrResolver<{ cep: string }>('cep', validateCep);
}

import { validateCnpj } from '@br-validators/core/cnpj';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function cnpjRule(options?: BrRuleOptions) {
  return createBrRule(validateCnpj, options);
}

export function cnpjResolver() {
  return createBrResolver<{ cnpj: string }>('cnpj', validateCnpj);
}

import { validateCpf } from '@br-validators/core/cpf';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function cpfRule(options?: BrRuleOptions) {
  return createBrRule(validateCpf, options);
}

export function cpfResolver() {
  return createBrResolver<{ cpf: string }>('cpf', validateCpf);
}

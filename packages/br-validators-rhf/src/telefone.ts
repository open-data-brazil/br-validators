import { validateTelefone } from '@br-validators/core/telefone';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function telefoneRule(options?: BrRuleOptions) {
  return createBrRule(validateTelefone, options);
}

export function telefoneResolver() {
  return createBrResolver<{ telefone: string }>('telefone', validateTelefone);
}

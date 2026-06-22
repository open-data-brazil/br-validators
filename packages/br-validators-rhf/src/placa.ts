import { validatePlaca } from '@br-validators/core/placa';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function placaRule(options?: BrRuleOptions) {
  return createBrRule(validatePlaca, options);
}

export function placaResolver() {
  return createBrResolver<{ placa: string }>('placa', validatePlaca);
}

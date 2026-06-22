import { validateCartaoCredito } from '@br-validators/core/cartao-credito';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function cartaoCreditoRule(options?: BrRuleOptions) {
  return createBrRule(validateCartaoCredito, options);
}

export function cartaoCreditoResolver() {
  return createBrResolver<{ cartaoCredito: string }>(
    'cartaoCredito',
    validateCartaoCredito,
  );
}

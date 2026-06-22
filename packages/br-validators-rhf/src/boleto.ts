import { validateBoleto } from '@br-validators/core/boleto';
import type { ValidateBoletoOptions } from '@br-validators/core';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function createBoletoRule(options?: BrRuleOptions & ValidateBoletoOptions) {
  const { required, ...boletoOptions } = options ?? {};
  return createBrRule((input) => validateBoleto(input, boletoOptions), { required });
}

export function boletoRule(options?: BrRuleOptions) {
  return createBoletoRule(options);
}

export function createBoletoResolver(boletoOptions?: ValidateBoletoOptions) {
  return createBrResolver<{ boleto: string }>(
    'boleto',
    (input) => validateBoleto(input, boletoOptions),
  );
}

export function boletoResolver() {
  return createBoletoResolver();
}

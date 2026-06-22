import { validatePisPasep } from '@br-validators/core/pis-pasep';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function pisPasepRule(options?: BrRuleOptions) {
  return createBrRule(validatePisPasep, options);
}

export function pisRule(options?: BrRuleOptions) {
  return pisPasepRule(options);
}

export function pisPasepResolver() {
  return createBrResolver<{ pisPasep: string }>('pisPasep', validatePisPasep);
}

export function pisResolver() {
  return createBrResolver<{ pis: string }>('pis', validatePisPasep);
}

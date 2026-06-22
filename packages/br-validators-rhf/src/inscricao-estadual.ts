import { validateInscricaoEstadual } from '@br-validators/core/inscricao-estadual';
import type { UfCode, ValidateInscricaoEstadualOptions } from '@br-validators/core';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function createInscricaoEstadualRule(
  ieOptions: ValidateInscricaoEstadualOptions,
  options?: BrRuleOptions,
) {
  return createBrRule((input) => validateInscricaoEstadual(input, ieOptions), options);
}

export function inscricaoEstadualSpRule(options?: BrRuleOptions) {
  return createInscricaoEstadualRule({ uf: 'SP' }, options);
}

export function createInscricaoEstadualResolver(ieOptions: ValidateInscricaoEstadualOptions) {
  return createBrResolver<{ inscricaoEstadual: string }>(
    'inscricaoEstadual',
    (input) => validateInscricaoEstadual(input, ieOptions),
  );
}

export function inscricaoEstadualSpResolver() {
  return createInscricaoEstadualResolver({ uf: 'SP' });
}

export type { UfCode };

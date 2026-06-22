import { validatePixKey } from '@br-validators/core/pix';
import type { ValidatePixKeyOptions } from '@br-validators/core';
import type { BrRuleOptions } from './create-br-adapter.js';
import { createBrResolver, createBrRule } from './create-br-adapter.js';

export function createPixKeyRule(options?: BrRuleOptions & ValidatePixKeyOptions) {
  const { required, type } = options ?? {};
  return createBrRule((input) => validatePixKey(input, type ? { type } : undefined), { required });
}

export function pixKeyRule(options?: BrRuleOptions) {
  return createPixKeyRule(options);
}

export function createPixKeyResolver(pixOptions?: ValidatePixKeyOptions) {
  return createBrResolver<{ pixKey: string }>(
    'pixKey',
    (input) => validatePixKey(input, pixOptions),
  );
}

export function pixKeyResolver() {
  return createPixKeyResolver();
}

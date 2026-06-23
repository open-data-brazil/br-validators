/**
 * Normalize identifiers for Transparência adapter queries — delegates to core strip helpers.
 * @see docs/ADAPTERS-TRANSPARENCIA-RFC.md
 */

import { stripCnpj } from '../strip/cnpj.js';
import { stripCpf } from '../strip/cpf.js';

export function normalizeTransparenciaCpf(input: string): string {
  return stripCpf(input);
}

export function normalizeTransparenciaCnpj(input: string): string {
  return stripCnpj(input);
}

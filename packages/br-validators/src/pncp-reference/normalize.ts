/**
 * Normalize CNPJ for PNCP adapter queries — delegates to core strip helper.
 * @see docs/ADAPTERS-PNCP-RFC.md
 */

import { stripCnpj } from '../strip/cnpj.js';

export function normalizePncpCnpj(input: string): string {
  return stripCnpj(input);
}

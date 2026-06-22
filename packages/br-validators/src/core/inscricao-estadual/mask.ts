import { IE_DF_LENGTH, IE_SP_LENGTH, IE_SP_RURAL_LENGTH } from './constants.js';

export function applyIeSpMask(stripped: string): string {
  if (stripped.length !== IE_SP_LENGTH) {
    throw new Error('SP IE must have exactly 12 digits to apply mask');
  }
  return `${stripped.slice(0, 3)}.${stripped.slice(3, 6)}.${stripped.slice(6, 9)}.${stripped.slice(9)}`;
}

export function applyIeSpRuralMask(stripped: string): string {
  if (stripped.length !== IE_SP_RURAL_LENGTH || !stripped.startsWith('P')) {
    throw new Error('SP produtor rural IE must have exactly 13 characters starting with P to apply mask');
  }
  const body = stripped.slice(1);
  return `P-${body.slice(0, 8)}.${body.charAt(8)}/${body.slice(9)}`;
}

export function applyIeDfMask(stripped: string): string {
  if (stripped.length !== IE_DF_LENGTH) {
    throw new Error('DF IE must have exactly 13 digits to apply mask');
  }
  return `${stripped.slice(0, 3)}.${stripped.slice(3, 8)}.${stripped.slice(8, 11)}-${stripped.slice(11)}`;
}

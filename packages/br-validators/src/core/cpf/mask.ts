import { CPF_MASK_PATTERN } from './constants.js';

/** Mask XXX.XXX.XXX-DD (BR-CPF-005). */
export function applyCpfMask(canonical: string): string {
  const match = CPF_MASK_PATTERN.exec(canonical);
  if (!match) {
    throw new Error('CPF must have exactly 11 digits to apply mask');
  }
  return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
}

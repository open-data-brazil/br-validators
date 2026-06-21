import { CARTAO_PAN_MAX_LENGTH, CARTAO_PAN_MIN_LENGTH } from './constants.js';

/** Grouped display mask (BR-LUHN-007). */
export function applyCartaoCreditoMask(canonical: string): string {
  if (canonical.length < CARTAO_PAN_MIN_LENGTH || canonical.length > CARTAO_PAN_MAX_LENGTH) {
    throw new Error(`PAN must have between ${CARTAO_PAN_MIN_LENGTH} and ${CARTAO_PAN_MAX_LENGTH} digits to apply mask`);
  }

  if (canonical.length === 15) {
    return `${canonical.slice(0, 4)} ${canonical.slice(4, 10)} ${canonical.slice(10)}`;
  }

  const groups: string[] = [];
  for (let i = 0; i < canonical.length; i += 4) {
    groups.push(canonical.slice(i, i + 4));
  }
  return groups.join(' ');
}

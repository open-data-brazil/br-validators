/**
 * RG check-digit helpers — Ghiorzi DV reference (SSP-SP, IFP-RJ, MaSP-MG).
 * @see http://ghiorzi.org/DVnew.htm
 */

const SP_WEIGHTS = [9, 8, 7, 6, 5, 4, 3, 2] as const;

/** SSP-SP: remainder mod 11; 10 → X. */
export function computeRgSpCheckDigit(base8: string): string {
  let sum = 0;
  for (let i = 0; i < SP_WEIGHTS.length; i++) {
    sum += Number(base8.charAt(i)) * SP_WEIGHTS[i];
  }
  const remainder = sum % 11;
  return remainder === 10 ? 'X' : String(remainder);
}

function reduceMod10Digit(product: number): number {
  if (product > 9) {
    return Math.floor(product / 10) + (product % 10);
  }
  return product;
}

/** IFP-RJ / MaSP-MG: alternating 2,1 from unit with noves fora; complement to 10. */
export function computeRgMod10AlternatingCheckDigit(base: string): string {
  let sum = 0;
  for (let i = base.length - 1, position = 0; i >= 0; i--, position++) {
    const weight = position % 2 === 0 ? 2 : 1;
    sum += reduceMod10Digit(Number(base.charAt(i)) * weight);
  }
  const digit = (10 - (sum % 10)) % 10;
  return String(digit);
}

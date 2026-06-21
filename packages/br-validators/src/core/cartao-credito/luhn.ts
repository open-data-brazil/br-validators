/**
 * Luhn checksum — ISO/IEC 7812-1 Annex B (modulus-10 double-add-double).
 * @see BR-LUHN-003
 */

export function computeLuhnSum(pan: string): number {
  let sum = 0;
  let double = false;
  for (let i = pan.length - 1; i >= 0; i--) {
    let digit = Number(pan.charAt(i));
    if (double) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    double = !double;
  }
  return sum;
}

/** ISO/IEC 7812-1 Annex B — returns true when PAN passes Luhn. */
export function passesLuhn(pan: string): boolean {
  return computeLuhnSum(pan) % 10 === 0;
}

/**
 * Modulo 97 remainder for arbitrary-length digit strings (ISO 7064 / CNJ Anexo VIII).
 */
export function mod97(digits: string): number {
  let remainder = 0;
  for (const digit of digits) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder;
}

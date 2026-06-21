/**
 * Shared modulo helpers for IE check digits.
 */

export function computeIeSpCheckDigit(digits: string, weights: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += Number(digits[i]) * weights[i];
  }
  const remainder = sum % 11;
  return remainder === 10 ? 0 : remainder % 10;
}

export function computeIeMtCheckDigit(digits10: string): number {
  let sum = 0;
  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 10; i++) {
    sum += Number(digits10[i]) * weights[i];
  }
  const remainder = sum % 11;
  return remainder <= 1 ? 0 : 11 - remainder;
}

export function computeIeDfCheckDigit(
  digits: string,
  weights: readonly number[],
  includeDv1 = false,
  dv1 = 0,
): number {
  let sum = 0;
  const digitCount = includeDv1 ? 11 : digits.length;
  for (let i = 0; i < digitCount; i++) {
    sum += Number(digits[i]) * weights[i];
  }
  if (includeDv1) {
    sum += dv1 * weights[11];
  }
  const remainder = sum % 11;
  return remainder <= 1 ? 0 : 11 - remainder;
}

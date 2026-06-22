import { validatePisPasep } from '@br-validators/core';
import { randomDigits } from './random';

const WEIGHTS = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function computePisDigit(values: number[]) {
  const sum = values.reduce((acc, value, index) => acc + value * WEIGHTS[index], 0);
  const remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) return 0;
  return remainder;
}

export function generatePisPasep() {
  for (;;) {
    const base = randomDigits(10).split('').map(Number);
    const checkDigit = computePisDigit(base);
    const candidate = [...base, checkDigit].join('');
    if (validatePisPasep(candidate).ok) {
      return candidate;
    }
  }
}

import { validateCnpj } from '@br-validators/core';
import { randomDigits } from './random';

const FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function computeCnpjDigit(values: number[], weights: number[]) {
  const sum = values.reduce((acc, value, index) => acc + value * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function generateCnpj() {
  for (;;) {
    const base = randomDigits(12).split('').map(Number);
    const first = computeCnpjDigit(base, FIRST_WEIGHTS);
    const second = computeCnpjDigit([...base, first], SECOND_WEIGHTS);
    const candidate = [...base, first, second].join('');
    if (validateCnpj(candidate).ok) {
      return candidate;
    }
  }
}

import { validateCpf } from '@br-validators/core';
import { randomDigits } from './random';

function computeCpfCheckDigit(values: number[]) {
  const sum = values.reduce((acc, value, index) => acc + value * (values.length + 1 - index), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function generateCpf() {
  for (;;) {
    const base = randomDigits(9).split('').map(Number);
    const first = computeCpfCheckDigit(base);
    const second = computeCpfCheckDigit([...base, first]);
    const candidate = [...base, first, second].join('');
    if (validateCpf(candidate).ok) {
      return candidate;
    }
  }
}

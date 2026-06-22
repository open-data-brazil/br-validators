import { validateCartaoCredito } from '@br-validators/core';
import { randomDigits } from './random';

function luhnCheckDigit(partial: string) {
  const values = `${partial}0`
    .split('')
    .map(Number)
    .reverse()
    .map((digit, index) => {
      if (index % 2 === 0) return digit;
      const doubled = digit * 2;
      return doubled > 9 ? doubled - 9 : doubled;
    });
  const sum = values.reduce((acc, value) => acc + value, 0);
  return (10 - (sum % 10)) % 10;
}

export function generateCreditCard() {
  for (;;) {
    const partial = `4${randomDigits(14)}`;
    const checkDigit = luhnCheckDigit(partial);
    const value = `${partial}${checkDigit}`;
    if (validateCartaoCredito(value).ok) return value;
  }
}

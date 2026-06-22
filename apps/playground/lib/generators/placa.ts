import { detectPlacaFormat, validatePlaca } from '@br-validators/core';
import { randomDigits, randomLetters } from './random';

export function generatePlaca(format: 'legacy' | 'mercosul' = 'mercosul') {
  for (;;) {
    const value =
      format === 'legacy'
        ? `${randomLetters(3)}${randomDigits(4)}`
        : `${randomLetters(3)}${randomDigits(1)}${randomLetters(1)}${randomDigits(2)}`;
    const validation = validatePlaca(value);
    if (validation.ok && detectPlacaFormat(value) === format) {
      return value;
    }
  }
}

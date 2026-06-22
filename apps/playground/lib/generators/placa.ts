import { detectPlacaFormat, validatePlaca } from '@br-validators/core';
import { randomAlpha, randomDigits } from './random';

export function generatePlaca(format: 'legacy' | 'mercosul' = 'mercosul') {
  for (;;) {
    const value =
      format === 'legacy'
        ? `${randomAlpha(3)}${randomDigits(4)}`
        : `${randomAlpha(3)}${randomDigits(1)}${randomAlpha(1)}${randomDigits(2)}`;
    const validation = validatePlaca(value);
    if (validation.ok && detectPlacaFormat(value) === format) {
      return value;
    }
  }
}

import { formatTelefone, validateTelefone } from '@br-validators/core';
import { randomDigits } from './random';

export function generateTelefone() {
  for (;;) {
    const digits = `119${randomDigits(8)}`;
    const validation = validateTelefone(digits);
    const formatted = formatTelefone(digits);
    if (validation.ok && formatted.ok) return formatted.formatted;
  }
}

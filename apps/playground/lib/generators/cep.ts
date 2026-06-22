import { randomDigits } from './random';

export function generateCep() {
  return randomDigits(8);
}

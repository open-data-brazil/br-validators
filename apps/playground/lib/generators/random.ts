export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomDigits(length: number) {
  return Array.from({ length }, () => String(randomInt(0, 9))).join('');
}

export function randomAlpha(length: number) {
  return Array.from({ length }, () => String.fromCharCode(65 + randomInt(0, 25))).join('');
}

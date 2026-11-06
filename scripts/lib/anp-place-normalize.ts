/**
 * Normalize ANP municipality / state names for IBGE cross-reference.
 */

export function normalizeAnpPlaceName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAnpUf(value: string): string {
  return value.trim().toUpperCase();
}

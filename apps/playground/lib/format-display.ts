import type { DocumentSlug } from './nav';

/** Playground display mask — ABC-1D23 / ABC-1234 (validation accepts with or without hyphen). */
export function formatPlacaDisplay(value: string): string {
  const stripped = value.replace(/[-\s.]/g, '').toUpperCase();
  if (stripped.length !== 7) {
    return value;
  }
  return `${stripped.slice(0, 3)}-${stripped.slice(3)}`;
}

export function applyPlaygroundDisplayMask(slug: DocumentSlug, value: string, masked: boolean): string {
  if (!masked || slug !== 'placa') {
    return value;
  }
  return formatPlacaDisplay(value);
}

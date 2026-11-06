import { RG_UF_RULES } from './constants.js';

/** SP / RJ / MG mask: XX.XXX.XXX-X */
export function applyRgSpStyleMask(canonical: string): string {
  if (canonical.length !== 9) {
    throw new Error('RG must have 9 characters for SP-style mask');
  }
  return `${canonical.slice(0, 2)}.${canonical.slice(2, 5)}.${canonical.slice(5, 8)}-${canonical.slice(8)}`;
}

/** RJ / MG (8 digits): X.XXX.XXX-X */
export function applyRgRjStyleMask(canonical: string): string {
  if (canonical.length !== 8) {
    throw new Error('RG must have 8 digits for RJ-style mask');
  }
  return `${canonical.charAt(0)}.${canonical.slice(1, 4)}.${canonical.slice(4, 7)}-${canonical.charAt(7)}`;
}

/** SC mask: XXX.XXX.XXX */
export function applyRgScMask(canonical: string): string {
  if (canonical.length !== 9) {
    throw new Error('RG must have 9 digits for SC mask');
  }
  return `${canonical.slice(0, 3)}.${canonical.slice(3, 6)}.${canonical.slice(6)}`;
}

export function applyRgMask(canonical: string, uf: keyof typeof RG_UF_RULES): string {
  if (uf === 'SP') {
    return applyRgSpStyleMask(canonical);
  }
  if (uf === 'RJ' || uf === 'MG') {
    const digits = canonical.startsWith('M') ? canonical.slice(1) : canonical;
    const masked = applyRgRjStyleMask(digits);
    return canonical.startsWith('M') ? `M${masked}` : masked;
  }
  if (uf === 'SC') {
    return applyRgScMask(canonical);
  }
  return canonical;
}

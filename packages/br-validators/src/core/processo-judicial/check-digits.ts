import { mod97 } from './mod97.js';

/**
 * Compute CNJ check digits — Anexo VIII factorization (R1 → R2 → R3, DV = 98 − R3).
 */
export function computeProcessoJudicialCheckDigits(
  sequencial: string,
  ano: string,
  segmentoJustica: string,
  tribunal: string,
  origem: string,
): string {
  const r1 = mod97(sequencial);
  const r2 = mod97(`${r1}${ano}${segmentoJustica}${tribunal}`);
  const r3 = mod97(`${r2}${origem}00`);
  const dv = 98 - r3;
  return String(dv).padStart(2, '0');
}

/**
 * Verify DV — Anexo VIII §VI factorization (result must equal 1).
 */
export function isValidProcessoJudicialCheckDigits(
  sequencial: string,
  checkDigits: string,
  ano: string,
  segmentoJustica: string,
  tribunal: string,
  origem: string,
): boolean {
  const r1 = mod97(sequencial);
  const r2 = mod97(`${r1}${ano}${segmentoJustica}${tribunal}`);
  return mod97(`${r2}${origem}${checkDigits}`) === 1;
}

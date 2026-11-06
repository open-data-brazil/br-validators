import { NFE_CHAVE_NUMERIC_PATTERN } from './constants.js';

/**
 * Display mask — 11 groups of 4 digits (BR-NFE-CHAVE-006).
 * @see http://moc.sped.fazenda.pr.gov.br/ — chave de acesso layout
 */
export function applyNfeChaveMask(canonical: string): string {
  if (!NFE_CHAVE_NUMERIC_PATTERN.test(canonical)) {
    throw new Error('NF-e chave must have exactly 44 digits to apply mask');
  }

  const groups: string[] = [];
  for (let i = 0; i < canonical.length; i += 4) {
    groups.push(canonical.slice(i, i + 4));
  }
  return groups.join(' ');
}

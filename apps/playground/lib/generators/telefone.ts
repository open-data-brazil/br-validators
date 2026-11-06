import { formatTelefone, validateTelefone, type UfCode } from '@br-validators/core';
import { dddsForUf } from '../telefone-ddd-by-uf';
import { mulberry32, pickItem, randomDigits } from './random';

export function generateTelefoneDocument(
  uf: UfCode,
  format: 'celular' | 'fixo',
  masked: boolean,
  seed: number,
): string {
  const rng = mulberry32(seed);
  const ddds = dddsForUf(uf);
  const useFixo = format === 'fixo';

  for (let attempt = 0; attempt < 80; attempt++) {
    const ddd = pickItem(rng, ddds);
    const localPrefix = useFixo ? String(2 + Math.floor(rng() * 4)) : '9';
    const local = useFixo ? localPrefix + randomDigits(rng, 7) : localPrefix + randomDigits(rng, 8);
    const candidate = ddd + local;

    if (!validateTelefone(candidate).ok) {
      continue;
    }

    if (!masked) {
      return candidate;
    }

    const formatted = formatTelefone(candidate);
    return formatted.ok ? formatted.formatted : candidate;
  }

  const fallbackDdd = ddds[0] ?? '11';
  const fallback = useFixo ? `${fallbackDdd}33333333` : `${fallbackDdd}999999999`;
  if (!masked) {
    return fallback;
  }

  const formatted = formatTelefone(fallback);
  return formatted.ok ? formatted.formatted : fallback;
}

/** @deprecated Use generateTelefoneDocument */
export function generateTelefone() {
  return generateTelefoneDocument('SP', 'celular', false, Date.now());
}

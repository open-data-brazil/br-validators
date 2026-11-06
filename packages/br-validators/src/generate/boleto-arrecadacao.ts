/**
 * Synthetic boleto arrecadação — FEBRABAN Layout v7 (BR-GENERATE-001).
 * @see BOLETO_ARRECADACAO_OFFICIAL_SOURCE_URL in core/boleto/constants.ts
 */
import { buildArrecadacaoGoldenPair } from '../core/boleto/arrecadacao.js';
import type { ArrecadacaoValueType } from '../core/boleto/arrecadacao-modulo.js';
import { validateArrecadacao } from '../core/boleto/arrecadacao.js';
import type { RandomSource } from './random.js';

/** FEBRABAN Layout v7 golden linha — matches tests/vectors/boleto-arrecadacao.official.json primary. */
const ARRECADACAO_GOLDEN_LINHA = buildArrecadacaoGoldenPair({
  segment: '4',
  valueType: '6',
  value: '00000008123',
  company: '4567',
  free: '89012345678901234567890123',
}).linha;

const MAX_ATTEMPTS = 80;
const VALUE_TYPES: readonly ArrecadacaoValueType[] = ['6', '7', '8', '9'];
const SEGMENTS = ['1', '2', '3', '4', '5', '6', '7', '9'] as const;

/** FEBRABAN arrecadação linha display mask (48 digits). */
export function applyArrecadacaoLinhaMask(linha: string): string {
  return (
    `${linha.slice(0, 11)} ${linha.slice(11, 23)} ${linha.slice(23, 35)} ` +
    `${linha.slice(35, 47)} ${linha.charAt(47)}`
  );
}

export function generateBoletoArrecadacaoValue(
  rng: RandomSource,
  validate: (input: string) => { ok: boolean } = validateArrecadacao,
): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const pair = buildArrecadacaoGoldenPair({
      segment: rng.pick(SEGMENTS),
      valueType: rng.pick(VALUE_TYPES),
      value: rng.digits(11),
      company: rng.digits(4),
      free: rng.digits(25),
    });

    if (validate(pair.linha).ok) {
      return pair.linha;
    }
  }

  return ARRECADACAO_GOLDEN_LINHA;
}

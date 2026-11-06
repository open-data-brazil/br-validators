import {
  PROCESSO_JUDICIAL_ANO_LENGTH,
  PROCESSO_JUDICIAL_DV_LENGTH,
  PROCESSO_JUDICIAL_LENGTH,
  PROCESSO_JUDICIAL_ORIGEM_LENGTH,
  PROCESSO_JUDICIAL_SEGMENTO_LENGTH,
  PROCESSO_JUDICIAL_SEQUENCIAL_LENGTH,
  PROCESSO_JUDICIAL_TRIBUNAL_LENGTH,
} from './constants.js';
import type { ProcessoJudicialSegments } from './types.js';

export function parseProcessoJudicialParts(stripped: string): ProcessoJudicialSegments | null {
  if (stripped.length !== PROCESSO_JUDICIAL_LENGTH) {
    return null;
  }

  let offset = 0;
  const sequencial = stripped.slice(offset, offset + PROCESSO_JUDICIAL_SEQUENCIAL_LENGTH);
  offset += PROCESSO_JUDICIAL_SEQUENCIAL_LENGTH;

  const checkDigits = stripped.slice(offset, offset + PROCESSO_JUDICIAL_DV_LENGTH);
  offset += PROCESSO_JUDICIAL_DV_LENGTH;

  const ano = stripped.slice(offset, offset + PROCESSO_JUDICIAL_ANO_LENGTH);
  offset += PROCESSO_JUDICIAL_ANO_LENGTH;

  const segmentoJustica = stripped.slice(offset, offset + PROCESSO_JUDICIAL_SEGMENTO_LENGTH);
  offset += PROCESSO_JUDICIAL_SEGMENTO_LENGTH;

  const tribunal = stripped.slice(offset, offset + PROCESSO_JUDICIAL_TRIBUNAL_LENGTH);
  offset += PROCESSO_JUDICIAL_TRIBUNAL_LENGTH;

  const origem = stripped.slice(offset, offset + PROCESSO_JUDICIAL_ORIGEM_LENGTH);

  return {
    sequencial,
    checkDigits,
    ano,
    segmentoJustica,
    tribunal,
    origem,
  };
}

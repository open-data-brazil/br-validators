/**
 * ANTAQ publishes Portos.xlsx with U+FFFD in place of every accented letter.
 * `municipioNome` is restored from IBGE by code; free-text fields use the
 * deterministic dictionary repair.
 */

import type { PortoRecord } from './parse-portos-xlsx.js';
import { PT_BR_REPAIR_PREFERRED, PT_BR_REPAIR_WORDS } from './pt-br-repair-words.js';
import { buildRepairDictionary, repairReplacementChars } from './repair-replacement-chars.js';

export interface IbgeMunicipioName {
  codigo: number;
  nome: string;
}

const MUNICIPIO_WORD_PATTERN = /\p{L}+/gu;

export function repairPortosText(
  portos: readonly PortoRecord[],
  municipios: readonly IbgeMunicipioName[],
): { portos: PortoRecord[]; unresolved: string[] } {
  const nomePorCodigo = new Map(municipios.map((municipio) => [municipio.codigo, municipio.nome]));
  const municipioWords = municipios.flatMap((municipio) => municipio.nome.match(MUNICIPIO_WORD_PATTERN) ?? []);
  const dictionary = buildRepairDictionary([...PT_BR_REPAIR_WORDS, ...municipioWords], PT_BR_REPAIR_PREFERRED);
  const unresolved = new Set<string>();

  const repair = (value: string): string => {
    const result = repairReplacementChars(value, dictionary);
    for (const token of result.unresolved) {
      unresolved.add(token);
    }
    return result.text;
  };

  const repaired = portos.map((porto) => {
    const ibgeNome = porto.municipioIbge === null ? undefined : nomePorCodigo.get(porto.municipioIbge);
    return {
      ...porto,
      nome: repair(porto.nome),
      tipo: repair(porto.tipo),
      situacao: repair(porto.situacao),
      municipioNome: ibgeNome ?? repair(porto.municipioNome),
    };
  });

  return { portos: repaired, unresolved: [...unresolved].sort() };
}

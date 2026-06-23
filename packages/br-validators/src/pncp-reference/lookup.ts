/**
 * PNCP domain reference lookup — offline embedded tables from Cadastro API.
 * @see docs/OFFICIAL-SOURCES.md#pncp-reference
 */

import amparosLegaisData from './data/amparos-legais.json';
import criteriosJulgamentoData from './data/criterios-julgamento.json';
import fontesOrcamentariasData from './data/fontes-orcamentarias.json';
import modalidadesData from './data/modalidades.json';
import modosDisputaData from './data/modos-disputa.json';
import tiposContratoData from './data/tipos-contrato.json';
import tiposInstrumentosCobrancaData from './data/tipos-instrumentos-cobranca.json';
import tiposInstrumentosConvocatoriosData from './data/tipos-instrumentos-convocatorios.json';
import type { PncpReferenceItem, PncpReferenceTableId } from './types.js';

const tables: Record<PncpReferenceTableId, readonly PncpReferenceItem[]> = {
  modalidades: modalidadesData,
  'amparos-legais': amparosLegaisData,
  'modos-disputa': modosDisputaData,
  'tipos-instrumentos-convocatorios': tiposInstrumentosConvocatoriosData,
  'tipos-contrato': tiposContratoData,
  'criterios-julgamento': criteriosJulgamentoData,
  'tipos-instrumentos-cobranca': tiposInstrumentosCobrancaData,
  'fontes-orcamentarias': fontesOrcamentariasData,
};

function normalizeId(id: number | string): number | null {
  const parsed = typeof id === 'number' ? id : Number.parseInt(id, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function getPncpReferenceTable(tableId: PncpReferenceTableId): readonly PncpReferenceItem[] {
  return tables[tableId];
}

export function getPncpReferenceItem(
  tableId: PncpReferenceTableId,
  id: number | string,
): PncpReferenceItem | undefined {
  const normalizedId = normalizeId(id);
  if (normalizedId === null) {
    return undefined;
  }
  return tables[tableId].find((item) => item.id === normalizedId);
}

export function getPncpModalidades(): readonly PncpReferenceItem[] {
  return tables.modalidades;
}

export function getPncpModalidadePorId(id: number | string): PncpReferenceItem | undefined {
  return getPncpReferenceItem('modalidades', id);
}

export function getPncpAmparosLegais(): readonly PncpReferenceItem[] {
  return tables['amparos-legais'];
}

export function getPncpAmparoLegalPorId(id: number | string): PncpReferenceItem | undefined {
  return getPncpReferenceItem('amparos-legais', id);
}

export function searchPncpReference(
  tableId: PncpReferenceTableId,
  query: string,
  options?: { limit?: number },
): readonly PncpReferenceItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) {
    return [];
  }

  const limit = options?.limit ?? 10;
  const results: PncpReferenceItem[] = [];

  for (const item of tables[tableId]) {
    const matchesNome = item.nome.toLowerCase().includes(normalizedQuery);
    const matchesDescricao = item.descricao.toLowerCase().includes(normalizedQuery);
    if (matchesNome || matchesDescricao) {
      results.push(item);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}

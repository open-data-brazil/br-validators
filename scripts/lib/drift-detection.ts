import type { DatasetChanges } from './diff-dataset.js';

export const ZERO_CHANGES: DatasetChanges = {
  adicionados: 0,
  removidos: 0,
  alterados: 0,
  comparadoCom: null,
};

export function hasChangeCounts(changes: DatasetChanges): boolean {
  return changes.adicionados > 0 || changes.removidos > 0 || changes.alterados > 0;
}

/** First-embed metadata never reconciled by a second fetch (comparadoCom still null). */
export function isStaleBaseline(changes: DatasetChanges): boolean {
  return changes.comparadoCom === null && hasChangeCounts(changes);
}

/** Drift since a known previous capture date. */
export function isRealDrift(changes: DatasetChanges): boolean {
  return changes.comparadoCom !== null && hasChangeCounts(changes);
}

export function sealedBaselineChanges(capturadoEm: string): DatasetChanges {
  return {
    adicionados: 0,
    removidos: 0,
    alterados: 0,
    comparadoCom: capturadoEm,
  };
}

export function effectiveReportChanges(
  changes: DatasetChanges,
  capturadoEm: string,
): DatasetChanges {
  if (isStaleBaseline(changes)) {
    return sealedBaselineChanges(capturadoEm);
  }
  return changes;
}

export interface DriftResolutionInput {
  metadataChanges: DatasetChanges;
  capturadoEm: string;
  fieldStatus?: 'changed' | 'unchanged';
  fieldAdicionados?: number;
  fieldRemovidos?: number;
  fieldAlterados?: number;
}

export interface DriftResolution {
  status: 'changed' | 'unchanged';
  alteracoes: DatasetChanges;
  staleBaseline: boolean;
}

export function resolveDatasetDrift(input: DriftResolutionInput): DriftResolution {
  const staleBaseline = isStaleBaseline(input.metadataChanges);
  const reportAlteracoes = effectiveReportChanges(input.metadataChanges, input.capturadoEm);

  if (input.fieldStatus === 'changed') {
    return {
      status: 'changed',
      alteracoes: {
        adicionados: input.fieldAdicionados ?? reportAlteracoes.adicionados,
        removidos: input.fieldRemovidos ?? reportAlteracoes.removidos,
        alterados: input.fieldAlterados ?? reportAlteracoes.alterados,
        comparadoCom: reportAlteracoes.comparadoCom,
      },
      staleBaseline,
    };
  }

  if (input.fieldStatus === 'unchanged') {
    return {
      status: 'unchanged',
      alteracoes: reportAlteracoes,
      staleBaseline,
    };
  }

  if (isRealDrift(input.metadataChanges)) {
    return {
      status: 'changed',
      alteracoes: reportAlteracoes,
      staleBaseline,
    };
  }

  return {
    status: 'unchanged',
    alteracoes: reportAlteracoes,
    staleBaseline,
  };
}

export function sumReportTotals(
  entries: readonly { status: 'changed' | 'unchanged'; alteracoes: DatasetChanges }[],
): Pick<
  { totalAdicionados: number; totalRemovidos: number; totalAlterados: number; datasetsAlterados: number },
  'totalAdicionados' | 'totalRemovidos' | 'totalAlterados' | 'datasetsAlterados'
> {
  let totalAdicionados = 0;
  let totalRemovidos = 0;
  let totalAlterados = 0;
  let datasetsAlterados = 0;

  for (const entry of entries) {
    if (entry.status !== 'changed') {
      continue;
    }
    datasetsAlterados += 1;
    totalAdicionados += entry.alteracoes.adicionados;
    totalRemovidos += entry.alteracoes.removidos;
    totalAlterados += entry.alteracoes.alterados;
  }

  return { totalAdicionados, totalRemovidos, totalAlterados, datasetsAlterados };
}

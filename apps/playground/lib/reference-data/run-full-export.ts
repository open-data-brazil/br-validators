import type { DatasetAdapter, NormalizedRow } from './dataset-adapter';
import {
  ExportCancelledError,
  formatTxtSectionAsync,
  loadFullExportRows,
  type AsyncExportProgress,
} from './async-export';
import {
  assertExportRowCap,
  planFullDatasetExport,
  type FullExportContext,
} from './dataset-export-rules';
import {
  buildExportFilename,
  downloadTextFile,
  formatExportByteSize,
  formatTxtSection,
  getUtf8ByteLength,
  shouldConfirmLargeExport,
  shouldShowExportSizeHint,
  TXT_EXPORT_ROW_COUNT_CONFIRM_THRESHOLD,
  type TxtSectionMeta,
} from './txt-export';

export interface RunFullDatasetExportParams {
  adapter: DatasetAdapter;
  context: FullExportContext;
  confirm: (message: string) => boolean;
  onProgress: (progress: AsyncExportProgress) => void;
  signal: AbortSignal;
}

export interface RunFullDatasetExportResult {
  ok: boolean;
  errorMessage?: string;
  rowCount?: number;
}

function buildExportMeta(adapterId: string, context: FullExportContext): TxtSectionMeta {
  return {
    mode: 'single-dataset',
    uf: context.uf,
    year: context.year,
    moeda: context.moeda,
    desde: context.desde,
    ate: context.ate,
  };
}

/** Full dataset export with guards, async formatting, progress, and cancel. */
export async function runFullDatasetExport(
  params: RunFullDatasetExportParams,
): Promise<RunFullDatasetExportResult> {
  const plan = planFullDatasetExport(params.adapter.id, params.context);
  if (!plan.allowed) {
    return { ok: false, errorMessage: plan.message };
  }
  if (plan.confirmMessage !== undefined && !params.confirm(plan.confirmMessage)) {
    return { ok: false };
  }

  const rows = await loadFullExportRows(params.adapter, plan.loadOptions);

  const cap = assertExportRowCap(rows.length);
  if (!cap.allowed) {
    return { ok: false, errorMessage: cap.message };
  }

  if (
    shouldConfirmLargeExport(rows.length) &&
    !params.confirm(
      `This export has ${String(rows.length)} rows (over ${String(TXT_EXPORT_ROW_COUNT_CONFIRM_THRESHOLD)}). Continue?`,
    )
  ) {
    return { ok: false };
  }

  const meta = buildExportMeta(params.adapter.id, {
    ...params.context,
    uf: plan.loadOptions?.uf ?? params.context.uf,
    year: plan.loadOptions?.year ?? params.context.year,
    moeda: plan.loadOptions?.moeda ?? params.context.moeda,
    desde: plan.loadOptions?.desde ?? params.context.desde,
    ate: plan.loadOptions?.ate ?? params.context.ate,
  });

  params.onProgress({ processedRows: 0, totalRows: rows.length });

  const content = await formatTxtSectionAsync(params.adapter, rows, meta, {
    onProgress: params.onProgress,
    signal: params.signal,
  });

  if (
    shouldShowExportSizeHint(getUtf8ByteLength(content)) &&
    !params.confirm(`Export is about ${formatExportByteSize(getUtf8ByteLength(content))}. Continue?`)
  ) {
    return { ok: false };
  }

  downloadTextFile(buildExportFilename(params.adapter.id, 'single-dataset'), content);
  return { ok: true, rowCount: rows.length };
}

export { ExportCancelledError };

/** Export a pre-built row list (existing explorers — current filter only). */
export function exportNormalizedRows(
  adapter: DatasetAdapter,
  rows: readonly NormalizedRow[],
  meta: Omit<TxtSectionMeta, 'mode'> & { mode?: TxtSectionMeta['mode'] },
): void {
  const cap = assertExportRowCap(rows.length);
  if (!cap.allowed) {
    window.alert(cap.message);
    return;
  }
  const content = formatTxtSection(adapter, rows, { mode: 'search-results', ...meta });
  downloadTextFile(buildExportFilename(adapter.id, 'search-results'), content);
}

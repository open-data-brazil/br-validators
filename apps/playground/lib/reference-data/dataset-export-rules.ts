import type { SearchOptions } from './dataset-adapter';
import { exceedsExportRowCap, EXPORT_ROW_CAP } from './export-limits';

export interface FullExportContext {
  uf?: string;
  year?: number;
  moeda?: string;
  desde?: string;
  ate?: string;
}

export interface FullExportPlan {
  allowed: boolean;
  message?: string;
  confirmMessage?: string;
  loadOptions?: SearchOptions;
}

const NCM_FULL_EXPORT_CONFIRM =
  'Full NCM export loads ~10k rows from a ~900 KB gzip embed. Continue?';

function trimUpper(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (trimmed === undefined || trimmed.length === 0) {
    return undefined;
  }
  return trimmed.toUpperCase();
}

/** Dataset-specific guards before `loadAll` / full export (EXP-36-C02 rules). */
export function planFullDatasetExport(datasetId: string, context: FullExportContext = {}): FullExportPlan {
  switch (datasetId) {
    case 'ibge': {
      const uf = trimUpper(context.uf);
      if (uf === undefined) {
        return {
          allowed: false,
          message: 'Select a UF before exporting IBGE municipalities.',
        };
      }
      return { allowed: true, loadOptions: { uf } };
    }
    case 'ncm':
      return {
        allowed: true,
        confirmMessage: NCM_FULL_EXPORT_CONFIRM,
      };
    case 'iss-municipal': {
      const uf = trimUpper(context.uf);
      if (uf === undefined) {
        return {
          allowed: false,
          message: 'Select a UF before exporting ISS municipal data.',
        };
      }
      return {
        allowed: true,
        loadOptions: { uf, limit: EXPORT_ROW_CAP },
        confirmMessage: 'ISS export includes all municipalities for the selected UF (with fonte). Continue?',
      };
    }
    case 'feriados': {
      const year = context.year ?? new Date().getFullYear();
      if (!Number.isFinite(year) || year < 1900 || year > 2100) {
        return { allowed: false, message: 'Enter a valid year for feriados export.' };
      }
      return { allowed: true, loadOptions: { year } };
    }
    case 'ptax': {
      const moeda = trimUpper(context.moeda) ?? 'USD';
      const loadOptions: SearchOptions = { moeda };
      if (context.desde !== undefined && context.ate !== undefined) {
        loadOptions.desde = context.desde;
        loadOptions.ate = context.ate;
      }
      return { allowed: true, loadOptions };
    }
    default:
      return { allowed: true };
  }
}

export function assertExportRowCap(rowCount: number): { allowed: boolean; message?: string } {
  if (exceedsExportRowCap(rowCount)) {
    return {
      allowed: false,
      message: `Export exceeds ${String(EXPORT_ROW_CAP)} row cap.`,
    };
  }
  return { allowed: true };
}

/** ISS full export uses search with empty query scoped by UF — not raw getAllIssMunicipal(). */
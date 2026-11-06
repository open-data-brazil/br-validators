/** Max rows rendered in explorer search preview (per dataset). */
export const PREVIEW_ROW_CAP = 100;

/** Hard stop for full TXT export — aligns with parent owner decision (50k cap). */
export const EXPORT_ROW_CAP = 50_000;

/** Rows processed per async chunk before yielding to the main thread. */
export const EXPORT_CHUNK_SIZE = 500;

export function exceedsExportRowCap(rowCount: number): boolean {
  return rowCount > EXPORT_ROW_CAP;
}

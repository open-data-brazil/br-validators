/**
 * Convert ANP XLSX Excel serial dates to ISO YYYY-MM-DD.
 */

const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);

export function excelSerialToIsoDate(serial: number): string | null {
  if (!Number.isFinite(serial) || serial <= 0) {
    return null;
  }
  const wholeDays = Math.floor(serial);
  const date = new Date(EXCEL_EPOCH_MS + wholeDays * 86_400_000);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

export function parseAnpExcelDateCell(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const serial = Number.parseFloat(trimmed);
  if (!Number.isFinite(serial)) {
    return null;
  }
  return excelSerialToIsoDate(serial);
}

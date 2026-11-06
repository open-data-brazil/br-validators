import { describe, expect, it } from 'vitest';
import { EXPORT_CHUNK_SIZE, EXPORT_ROW_CAP, exceedsExportRowCap, PREVIEW_ROW_CAP } from '../lib/reference-data/export-limits';

describe('export-limits', () => {
  it('PREVIEW_ROW_CAP defaults to 100', () => {
    expect(PREVIEW_ROW_CAP).toBe(100);
  });

  it('EXPORT_ROW_CAP is 50_000', () => {
    expect(EXPORT_ROW_CAP).toBe(50_000);
  });

  it('EXPORT_CHUNK_SIZE is 500', () => {
    expect(EXPORT_CHUNK_SIZE).toBe(500);
  });

  it('exceedsExportRowCap triggers above cap', () => {
    expect(exceedsExportRowCap(EXPORT_ROW_CAP)).toBe(false);
    expect(exceedsExportRowCap(EXPORT_ROW_CAP + 1)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { excelSerialToIsoDate, parseAnpExcelDateCell } from './anp-excel-date.js';

describe('anp-excel-date', () => {
  it('converts ANP Excel serial dates to ISO', () => {
    expect(excelSerialToIsoDate(46180)).toBe('2026-06-07');
    expect(excelSerialToIsoDate(46186)).toBe('2026-06-13');
  });

  it('parses serial or ISO date cells', () => {
    expect(parseAnpExcelDateCell('46180')).toBe('2026-06-07');
    expect(parseAnpExcelDateCell('2026-06-07')).toBe('2026-06-07');
    expect(parseAnpExcelDateCell('')).toBeNull();
    expect(parseAnpExcelDateCell('invalid')).toBeNull();
  });
});

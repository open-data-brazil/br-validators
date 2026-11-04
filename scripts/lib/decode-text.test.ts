import { describe, expect, it } from 'vitest';

import { decodeTextBuffer } from './decode-text.js';

describe('decodeTextBuffer', () => {
  it('keeps valid UTF-8 untouched', () => {
    expect(decodeTextBuffer(new TextEncoder().encode('aeronáutica'))).toBe('aeronáutica');
  });

  it('strips the UTF-8 BOM', () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('São Paulo')]);
    expect(decodeTextBuffer(bytes)).toBe('São Paulo');
  });

  it('falls back to Windows-1252 for ISO-8859-1 payloads (MTE CBO, TSE)', () => {
    // "Oficial general da aeronáutica" / "Guajará-Mirim" as published (ISO-8859-1)
    const cbo = new Uint8Array([...Buffer.from('aeron', 'latin1'), 0xe1, ...Buffer.from('utica', 'latin1')]);
    const tse = Buffer.from('Guajará-Mirim', 'latin1');
    expect(decodeTextBuffer(cbo)).toBe('aeronáutica');
    expect(decodeTextBuffer(new Uint8Array(tse))).toBe('Guajará-Mirim');
    expect(decodeTextBuffer(new Uint8Array(tse))).not.toContain('�');
  });
});

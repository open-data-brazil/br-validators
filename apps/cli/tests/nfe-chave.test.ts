import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runNfeChave, runNfeChaveCommand } from '../src/commands/nfe-chave.js';
import { printNfeChaveValidation } from '../src/output.js';
import {
  NFE_CHAVE_GOLDEN_PRIMARY,
  NFE_CHAVE_OFFICIAL_SOURCE_URL,
  type NfeChave,
} from '@br-validators/core';

const FORMATTED_PRIMARY = '5206 0433 0099 1100 2506 5501 2000 0007 8002 6730 1615';

describe('resolveInput (nfe-chave)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runNfeChaveCommand', () => {
  it('validates golden primary vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runNfeChaveCommand('validate', NFE_CHAVE_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('parses golden primary vector with plain output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runNfeChaveCommand('parse', NFE_CHAVE_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.includes('33009911002506'))).toBe(true);
  });

  it('parses golden primary vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runNfeChaveCommand('parse', NFE_CHAVE_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; parsed?: { cnpj: string } };
    expect(parsed.ok).toBe(true);
    expect(parsed.parsed?.cnpj).toBe('33009911002506');
  });

  it('parses with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runNfeChaveCommand('parse', NFE_CHAVE_GOLDEN_PRIMARY, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string; uf?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(NFE_CHAVE_OFFICIAL_SOURCE_URL);
    expect(parsed.uf).toBe('GO');
  });

  it('parses with plain output and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runNfeChaveCommand('parse', NFE_CHAVE_GOLDEN_PRIMARY, { json: false, quiet: false, source: true }, io);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
    expect(io.stdout.some((line) => line.startsWith('uf: GO'))).toBe(true);
  });

  it('parses json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeChaveCommand('parse', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('parses invalid with stderr output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeChaveCommand('parse', 'bad', { json: false, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toBe('valid: no');
  });

  it('parses quiet invalid', () => {
    expect(runNfeChaveCommand('parse', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('parses quiet valid', () => {
    expect(
      runNfeChaveCommand('parse', NFE_CHAVE_GOLDEN_PRIMARY, { json: false, quiet: true, source: false }),
    ).toBe(EXIT.OK);
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runNfeChaveCommand('validate', NFE_CHAVE_GOLDEN_PRIMARY, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(NFE_CHAVE_OFFICIAL_SOURCE_URL);
  });

  it('validates json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeChaveCommand('validate', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('validates invalid with stderr output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeChaveCommand('validate', 'bad', { json: false, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toBe('valid: no');
  });

  it('validates quiet mode', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runNfeChaveCommand('validate', NFE_CHAVE_GOLDEN_PRIMARY, { json: false, quiet: true, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(0);
  });

  it('formats valid input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runNfeChaveCommand('format', NFE_CHAVE_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain(FORMATTED_PRIMARY);
  });

  it('formats with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runNfeChaveCommand('format', NFE_CHAVE_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; formatted?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.formatted).toBe(FORMATTED_PRIMARY);
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeChaveCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(
      runNfeChaveCommand('format', NFE_CHAVE_GOLDEN_PRIMARY, { json: false, quiet: true, source: false }),
    ).toBe(EXIT.OK);
  });

  it('strips formatted input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runNfeChaveCommand('strip', FORMATTED_PRIMARY, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(NFE_CHAVE_GOLDEN_PRIMARY);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runNfeChaveCommand('strip', NFE_CHAVE_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { stripped: string };
    expect(parsed.stripped).toBe(NFE_CHAVE_GOLDEN_PRIMARY);
  });
});

describe('runNfeChave', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runNfeChave('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing NF-e chave');
  });

  it('reads from file content', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runNfeChave('validate', undefined, { json: false, quiet: true, source: false, file: NFE_CHAVE_GOLDEN_PRIMARY }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runNfeChaveCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runNfeChaveCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});

describe('printNfeChaveValidation', () => {
  it('omits uf in json when not present on result', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printNfeChaveValidation(
      {
        ok: true,
        value: NFE_CHAVE_GOLDEN_PRIMARY as NfeChave,
        format: 'numeric',
        parsed: {
          cUF: '52',
          aamm: '0604',
          cnpj: '33009911002506',
          mod: '55',
          serie: '012',
          nNF: '000000780',
          tpEmis: '0',
          cNF: '26730161',
          cDV: '5',
        },
      },
      { json: true, quiet: false },
      io,
    );
    const parsed = JSON.parse(io.stdout[0]) as { uf?: string };
    expect(parsed.uf).toBeUndefined();
  });
});

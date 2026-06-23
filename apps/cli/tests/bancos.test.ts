import { describe, expect, it } from 'vitest';
import { getBancoPorCodigo } from '@br-validators/core/bancos';
import { EXIT } from '../src/constants.js';
import {
  formatBancoHuman,
  lookupBanco,
  normalizeBancosLookupInput,
  runBancosLookup,
  runBancosLookupCommand,
} from '../src/commands/bancos/lookup.js';
import { runBancosList, runBancosListCommand } from '../src/commands/bancos/list.js';

const NUBANK_ISPB = '18236120';

describe('normalizeBancosLookupInput', () => {
  it('accepts 3-digit COMPE', () => {
    expect(normalizeBancosLookupInput('001')).toEqual({ kind: 'codigo', value: '001' });
    expect(normalizeBancosLookupInput('1')).toEqual({ kind: 'codigo', value: '001' });
  });

  it('accepts 8-digit ISPB', () => {
    expect(normalizeBancosLookupInput(NUBANK_ISPB)).toEqual({ kind: 'ispb', value: NUBANK_ISPB });
  });

  it('rejects invalid lengths', () => {
    expect(normalizeBancosLookupInput('12345')).toBeNull();
    expect(normalizeBancosLookupInput('')).toBeNull();
  });
});

describe('lookupBanco golden vectors', () => {
  it('resolves BB COMPE 001', () => {
    const banco = lookupBanco('001');
    expect(banco?.codigo).toBe('001');
    expect(banco?.nome).toContain('Brasil');
  });

  it('resolves Itaú COMPE 341', () => {
    const banco = lookupBanco('341');
    expect(banco?.codigo).toBe('341');
    expect(banco?.nome.toUpperCase()).toContain('ITA');
  });

  it('resolves Nubank ISPB', () => {
    const banco = lookupBanco(NUBANK_ISPB);
    expect(banco?.ispb).toBe(NUBANK_ISPB);
    expect(banco?.nome.toUpperCase()).toContain('NU PAGAMENTOS');
  });

  it('returns undefined for invalid input shape', () => {
    expect(lookupBanco('12345')).toBeUndefined();
  });

  it('returns undefined for unknown code', () => {
    expect(lookupBanco('999')).toBeUndefined();
  });
});

describe('runBancosLookupCommand', () => {
  it('prints human output for BB', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBancosLookupCommand('001', { json: false, verbose: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('001');
    expect(io.stdout[0]).toContain('Brasil');
  });

  it('prints JSON shape', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBancosLookupCommand('341', { json: true, verbose: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; banco: { codigo: string }; capturadoEm?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.banco.codigo).toBe('341');
    expect(parsed.capturadoEm).toBeTruthy();
  });

  it('prints human output with verbose footer', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBancosLookupCommand('001', { json: false, verbose: true }, io);
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('returns invalid for unknown bank', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBancosLookupCommand('999', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toContain('not found');
  });

  it('returns usage for invalid input length', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBancosLookupCommand('12345', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

describe('runBancosLookup', () => {
  it('returns usage when value missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBancosLookup(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

describe('runBancosListCommand', () => {
  it('returns limit rows', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBancosListCommand({ json: false, verbose: false, limit: 5 }, io)).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(5);
  });

  it('returns JSON list with verbose', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBancosListCommand({ json: true, verbose: true, limit: 2 }, io);
    const parsed = JSON.parse(io.stdout[0]) as { capturadoEm?: string };
    expect(parsed.capturadoEm).toBeTruthy();
  });

  it('prints human list with verbose footer', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBancosListCommand({ json: false, verbose: true, limit: 1 }, io);
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('returns all banks when limit omitted', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBancosListCommand({ json: true, verbose: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { total: number };
    expect(parsed.total).toBeGreaterThan(250);
  });

  it('returns JSON list', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runBancosListCommand({ json: true, verbose: false, limit: 3 }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; total: number; bancos: unknown[] };
    expect(parsed.ok).toBe(true);
    expect(parsed.total).toBe(3);
    expect(parsed.bancos).toHaveLength(3);
  });
});

describe('runBancosList', () => {
  it('delegates to list command', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBancosList({ json: false, verbose: false, limit: 1 }, io)).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(1);
  });
});

describe('formatBancoHuman', () => {
  it('formats known bank', () => {
    const banco = getBancoPorCodigo('001');
    expect(banco).toBeDefined();
    expect(formatBancoHuman(banco!)).toContain('00000000');
  });
});

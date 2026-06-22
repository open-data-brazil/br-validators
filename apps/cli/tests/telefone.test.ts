import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runTelefone, runTelefoneCommand } from '../src/commands/telefone.js';
import {
  TELEFONE_GOLDEN_CELULAR,
  TELEFONE_GOLDEN_CELULAR_MASKED,
  TELEFONE_OFFICIAL_SOURCE_URL,
} from '@br-validators/core';

describe('resolveInput (telefone)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runTelefoneCommand', () => {
  it('validates golden celular vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTelefoneCommand('validate', TELEFONE_GOLDEN_CELULAR, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes (celular)');
  });

  it('validates golden celular with json without source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTelefoneCommand('validate', TELEFONE_GOLDEN_CELULAR, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBeUndefined();
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTelefoneCommand('validate', TELEFONE_GOLDEN_CELULAR, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; tipo?: string; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.tipo).toBe('celular');
    expect(parsed.source).toBe(TELEFONE_OFFICIAL_SOURCE_URL);
  });

  it('validates with plain output and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTelefoneCommand('validate', TELEFONE_GOLDEN_CELULAR, { json: false, quiet: false, source: true }, io);
    expect(io.stdout[0]).toBe('valid: yes (celular)');
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('validates json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTelefoneCommand('validate', 'bad', { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('validates invalid with stderr output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTelefoneCommand('validate', 'bad', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toBe('valid: no');
    expect(io.stderr[1]).toContain('code:');
  });

  it('validates quiet invalid', () => {
    expect(runTelefoneCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('formats valid celular', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTelefoneCommand('format', TELEFONE_GOLDEN_CELULAR, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(TELEFONE_GOLDEN_CELULAR_MASKED);
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runTelefoneCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(
      runTelefoneCommand('format', TELEFONE_GOLDEN_CELULAR, { json: false, quiet: true, source: false }),
    ).toBe(EXIT.OK);
  });

  it('strips input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTelefoneCommand('strip', TELEFONE_GOLDEN_CELULAR_MASKED, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(TELEFONE_GOLDEN_CELULAR);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runTelefoneCommand('strip', TELEFONE_GOLDEN_CELULAR, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(TELEFONE_GOLDEN_CELULAR);
  });
});

describe('runTelefone', () => {
  it('returns usage when value missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runTelefone('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing telephone value');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTelefone('validate', undefined, {
        json: false,
        quiet: true,
        source: false,
        file: TELEFONE_GOLDEN_CELULAR,
      }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runTelefoneCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTelefoneCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});

import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runCpf, runCpfCommand } from '../src/commands/cpf.js';
import { CPF_GOLDEN_PRIMARY, CPF_OFFICIAL_SOURCE_URL } from 'br-validators';

describe('resolveInput (cpf)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runCpfCommand', () => {
  it('validates golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCpfCommand('validate', CPF_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCpfCommand('validate', CPF_GOLDEN_PRIMARY, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(CPF_OFFICIAL_SOURCE_URL);
  });

  it('validates quiet invalid', () => {
    expect(runCpfCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('formats valid CPF', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCpfCommand('format', CPF_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('123.456.789-09');
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCpfCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(runCpfCommand('format', CPF_GOLDEN_PRIMARY, { json: false, quiet: true, source: false })).toBe(EXIT.OK);
  });

  it('strips input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCpfCommand('strip', '123.456.789-09', { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(CPF_GOLDEN_PRIMARY);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCpfCommand('strip', CPF_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(CPF_GOLDEN_PRIMARY);
  });
});

describe('runCpf', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCpf('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing CPF');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCpf('validate', undefined, { json: false, quiet: true, source: false, file: CPF_GOLDEN_PRIMARY }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runCpfCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCpfCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});

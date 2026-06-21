import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  printPixDetect,
  printPixValidation,
  resolveInput,
  runPix,
  runPixCommand,
} from '../src/commands/pix.js';
import { PIX_GOLDEN_CPF, PIX_GOLDEN_EMAIL, PIX_OFFICIAL_SOURCE_URL } from 'br-validators';

describe('resolveInput (pix)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runPixCommand validate', () => {
  it('validates email golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPixCommand('validate', PIX_GOLDEN_EMAIL, { json: false, quiet: false, source: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes (email)');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPixCommand('validate', PIX_GOLDEN_EMAIL, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; keyType?: string; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.keyType).toBe('email');
    expect(parsed.source).toBe(PIX_OFFICIAL_SOURCE_URL);
  });

  it('validates json failure with keyType', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPixCommand('validate', PIX_GOLDEN_CPF, { json: true, quiet: false, source: false, type: 'email' }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; keyType?: string };
    expect(parsed.ok).toBe(false);
    expect(parsed.keyType).toBe('email');
  });

  it('validates json failure without keyType', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPixCommand('validate', 'not-a-key', { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; keyType?: string };
    expect(parsed.ok).toBe(false);
    expect(parsed.keyType).toBeUndefined();
  });

  it('validates json success without source field', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPixCommand('validate', PIX_GOLDEN_EMAIL, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBeUndefined();
  });

  it('validates human output with source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPixCommand('validate', PIX_GOLDEN_EMAIL, { json: false, quiet: false, source: true }, io);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('validates quiet invalid', () => {
    expect(runPixCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('validates with forced type mismatch', () => {
    expect(
      runPixCommand('validate', PIX_GOLDEN_CPF, { json: false, quiet: true, source: false, type: 'email' }),
    ).toBe(EXIT.INVALID);
  });
});

describe('runPixCommand detect', () => {
  it('detects cpf type', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPixCommand('detect', PIX_GOLDEN_CPF, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('cpf');
  });

  it('detects with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPixCommand('detect', PIX_GOLDEN_CPF, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).keyType).toBe('cpf');
  });

  it('detects quiet', () => {
    expect(runPixCommand('detect', PIX_GOLDEN_CPF, { json: false, quiet: true, source: false })).toBe(EXIT.OK);
  });
});

describe('runPix', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPix('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing PIX key');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPix('validate', undefined, { json: false, quiet: true, source: false, file: PIX_GOLDEN_EMAIL }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runPixCommand format', () => {
  it('formats CPF-shaped PIX key', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPixCommand('format', PIX_GOLDEN_CPF, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('123.456.789-09');
  });

  it('formats phone key with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPixCommand('format', '+5511999887766', { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).formatted).toBe('+55 (11) 99988-7766');
  });

  it('format quiet invalid', () => {
    expect(runPixCommand('format', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });
});

describe('runPixCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPixCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});

describe('printPixValidation', () => {
  it('prints human error with keyType', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printPixValidation(
      { ok: false, code: 'UNSUPPORTED_FORMAT', message: 'fail', keyType: 'email' },
      { json: false, quiet: false },
      io,
    );
    expect(io.stderr.some((line) => line.includes('keyType: email'))).toBe(true);
  });
});

describe('printPixDetect', () => {
  it('uses default io', () => {
    expect(printPixDetect('cpf', { json: false, quiet: false })).toBe(EXIT.OK);
  });
});

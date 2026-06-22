import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runCnh, runCnhCommand } from '../src/commands/cnh.js';
import {
  CNH_GOLDEN_PRIMARY,
  CNH_GOLDEN_PRIMARY_DECORATED_INPUT,
  CNH_OFFICIAL_SOURCE_URL,
} from '@br-validators/core';

describe('resolveInput (cnh)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runCnhCommand', () => {
  it('validates golden primary vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnhCommand('validate', CNH_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('validates golden primary with json without source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnhCommand('validate', CNH_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBeUndefined();
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnhCommand('validate', CNH_GOLDEN_PRIMARY, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(CNH_OFFICIAL_SOURCE_URL);
  });

  it('validates with plain output and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnhCommand('validate', CNH_GOLDEN_PRIMARY, { json: false, quiet: false, source: true }, io);
    expect(io.stdout[0]).toContain('valid: yes');
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('validates json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnhCommand('validate', 'bad', { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('validates invalid with stderr output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnhCommand('validate', 'bad', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toBe('valid: no');
    expect(io.stderr[1]).toContain('code:');
  });

  it('validates quiet invalid', () => {
    expect(runCnhCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('formats valid CNH', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnhCommand('format', CNH_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(CNH_GOLDEN_PRIMARY);
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnhCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(
      runCnhCommand('format', CNH_GOLDEN_PRIMARY, { json: false, quiet: true, source: false }),
    ).toBe(EXIT.OK);
  });

  it('strips input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnhCommand('strip', CNH_GOLDEN_PRIMARY_DECORATED_INPUT, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(CNH_GOLDEN_PRIMARY);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCnhCommand('strip', CNH_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(CNH_GOLDEN_PRIMARY);
  });
});

describe('runCnh', () => {
  it('returns usage when value missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCnh('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing CNH value');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnh('validate', undefined, {
        json: false,
        quiet: true,
        source: false,
        file: CNH_GOLDEN_PRIMARY,
      }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runCnhCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCnhCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});

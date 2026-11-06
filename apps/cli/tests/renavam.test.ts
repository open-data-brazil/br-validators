import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runRenavam, runRenavamCommand } from '../src/commands/renavam.js';
import {
  RENAVAM_GOLDEN_DASH_INPUT,
  RENAVAM_GOLDEN_PRIMARY,
  RENAVAM_OFFICIAL_SOURCE_URL,
} from '@br-validators/core';

describe('resolveInput (renavam)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runRenavamCommand', () => {
  it('validates golden primary vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRenavamCommand('validate', RENAVAM_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('validates golden primary with json without source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runRenavamCommand('validate', RENAVAM_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBeUndefined();
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runRenavamCommand('validate', RENAVAM_GOLDEN_PRIMARY, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(RENAVAM_OFFICIAL_SOURCE_URL);
  });

  it('validates with plain output and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runRenavamCommand('validate', RENAVAM_GOLDEN_PRIMARY, { json: false, quiet: false, source: true }, io);
    expect(io.stdout[0]).toContain('valid: yes');
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('validates json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRenavamCommand('validate', 'bad', { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('validates invalid with stderr output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRenavamCommand('validate', 'bad', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toBe('valid: no');
    expect(io.stderr[1]).toContain('code:');
  });

  it('validates quiet invalid', () => {
    expect(runRenavamCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('validates quiet mode', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRenavamCommand('validate', RENAVAM_GOLDEN_PRIMARY, { json: false, quiet: true, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(0);
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runRenavamCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(
      runRenavamCommand('format', RENAVAM_GOLDEN_PRIMARY, { json: false, quiet: true, source: false }),
    ).toBe(EXIT.OK);
  });

  it('formats valid input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRenavamCommand('format', RENAVAM_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain(RENAVAM_GOLDEN_PRIMARY);
  });

  it('formats with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runRenavamCommand('format', RENAVAM_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; formatted?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.formatted).toBe(RENAVAM_GOLDEN_PRIMARY);
  });

  it('strips dash-decorated input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runRenavamCommand('strip', RENAVAM_GOLDEN_DASH_INPUT, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('72176426415');
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runRenavamCommand('strip', RENAVAM_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    const parsed = JSON.parse(io.stdout[0]) as { stripped: string };
    expect(parsed.stripped).toBe(RENAVAM_GOLDEN_PRIMARY);
  });
});

describe('runRenavam', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runRenavam('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing RENAVAM');
  });

  it('reads from file content', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRenavam('validate', undefined, { json: false, quiet: true, source: false, file: RENAVAM_GOLDEN_PRIMARY }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runRenavamCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runRenavamCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});

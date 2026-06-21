import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runPlaca, runPlacaCommand } from '../src/commands/placa.js';
import {
  PLACA_GOLDEN_CONVERSION_FROM,
  PLACA_GOLDEN_CONVERSION_TO,
  PLACA_GOLDEN_LEGACY,
  PLACA_GOLDEN_MERCOSUL,
  PLACA_OFFICIAL_SOURCE_URL,
} from 'br-validators';

describe('resolveInput (placa)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runPlacaCommand', () => {
  it('validates Mercosul golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPlacaCommand('validate', PLACA_GOLDEN_MERCOSUL, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('validates legacy golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPlacaCommand('validate', PLACA_GOLDEN_LEGACY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('legacy');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPlacaCommand('validate', PLACA_GOLDEN_MERCOSUL, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(PLACA_OFFICIAL_SOURCE_URL);
  });

  it('validates quiet invalid', () => {
    expect(runPlacaCommand('validate', 'ABC123', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('formats valid placa', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPlacaCommand('format', 'abc1d23', { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(PLACA_GOLDEN_MERCOSUL);
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPlacaCommand('format', 'ABC123', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(runPlacaCommand('format', PLACA_GOLDEN_MERCOSUL, { json: false, quiet: true, source: false })).toBe(EXIT.OK);
  });

  it('converts legacy to Mercosul', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPlacaCommand('convert', PLACA_GOLDEN_CONVERSION_FROM, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(PLACA_GOLDEN_CONVERSION_TO);
  });

  it('converts with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPlacaCommand('convert', PLACA_GOLDEN_CONVERSION_FROM, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).formatted).toBe(PLACA_GOLDEN_CONVERSION_TO);
  });

  it('converts quiet invalid', () => {
    expect(runPlacaCommand('convert', PLACA_GOLDEN_MERCOSUL, { json: false, quiet: true, source: false })).toBe(
      EXIT.INVALID,
    );
  });

  it('strips input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPlacaCommand('strip', 'ABC-1234', { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(PLACA_GOLDEN_LEGACY);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPlacaCommand('strip', PLACA_GOLDEN_MERCOSUL, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(PLACA_GOLDEN_MERCOSUL);
  });
});

describe('runPlaca', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPlaca('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing placa');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPlaca('validate', undefined, { json: false, quiet: true, source: false, file: PLACA_GOLDEN_MERCOSUL }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runPlacaCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPlacaCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});

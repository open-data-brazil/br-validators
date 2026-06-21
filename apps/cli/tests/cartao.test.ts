import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runCartao, runCartaoCommand, printCartaoValidation } from '../src/commands/cartao.js';
import {
  CARTAO_GOLDEN_AMEX,
  CARTAO_GOLDEN_VISA,
  CARTAO_GOLDEN_VISA_MASKED,
  CARTAO_OFFICIAL_SOURCE_URL,
} from 'br-validators';

describe('resolveInput (cartao)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('printCartaoValidation', () => {
  it('prints json failure with optional brand', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printCartaoValidation(
      { ok: false, code: 'INVALID_CHECK_DIGIT', message: 'bad digit', brand: 'visa' },
      { json: true, quiet: false },
      io,
    );
    expect(JSON.parse(io.stdout[0]).brand).toBe('visa');
  });

  it('prints json failure without brand when omitted', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printCartaoValidation({ ok: false, code: 'EMPTY_INPUT', message: 'empty' }, { json: true, quiet: false }, io);
    expect(JSON.parse(io.stdout[0])).not.toHaveProperty('brand');
  });

  it('prints human failure with optional brand', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printCartaoValidation(
      { ok: false, code: 'INVALID_CHECK_DIGIT', message: 'bad digit', brand: 'mastercard' },
      { json: false, quiet: false },
      io,
    );
    expect(io.stderr).toContain('brand: mastercard');
  });
});

describe('runCartaoCommand', () => {
  it('validates golden Visa vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCartaoCommand('validate', CARTAO_GOLDEN_VISA, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
    expect(io.stdout[1]).toBe('brand: visa');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCommand('validate', CARTAO_GOLDEN_VISA, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; brand?: string; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.brand).toBe('visa');
    expect(parsed.source).toBe(CARTAO_OFFICIAL_SOURCE_URL);
  });

  it('validates with json without source field', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCommand('validate', CARTAO_GOLDEN_VISA, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0])).not.toHaveProperty('source');
  });

  it('validates human output with source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCommand('validate', CARTAO_GOLDEN_VISA, { json: false, quiet: false, source: true }, io);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('validates quiet invalid', () => {
    expect(runCartaoCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('prints human validation error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCommand('validate', '1111111111111111', { json: false, quiet: false, source: false }, io);
    expect(io.stderr[0]).toBe('valid: no');
  });

  it('detects Amex brand', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCommand('detect', CARTAO_GOLDEN_AMEX, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('amex');
  });

  it('detects with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCommand('detect', CARTAO_GOLDEN_VISA, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).brand).toBe('visa');
  });

  it('detects quiet', () => {
    expect(runCartaoCommand('detect', CARTAO_GOLDEN_VISA, { json: false, quiet: true, source: false })).toBe(EXIT.OK);
  });

  it('formats valid PAN', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCommand('format', CARTAO_GOLDEN_VISA, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(CARTAO_GOLDEN_VISA_MASKED);
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCartaoCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(runCartaoCommand('format', CARTAO_GOLDEN_VISA, { json: false, quiet: true, source: false })).toBe(EXIT.OK);
  });

  it('strips masked input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCommand('strip', CARTAO_GOLDEN_VISA_MASKED, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(CARTAO_GOLDEN_VISA);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCommand('strip', CARTAO_GOLDEN_VISA, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(CARTAO_GOLDEN_VISA);
  });
});

describe('runCartao', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCartao('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing credit card PAN');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCartao('validate', undefined, { json: false, quiet: true, source: false, file: CARTAO_GOLDEN_VISA }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runCartaoCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCartaoCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});

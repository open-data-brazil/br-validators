import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runCartaoCredito, runCartaoCreditoCommand } from '../src/commands/cartao-credito.js';
import { CARTAO_GOLDEN_VISA, CARTAO_GOLDEN_VISA_MASKED } from 'br-validators';

describe('resolveInput (cartao-credito)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runCartaoCreditoCommand', () => {
  it('formats golden Visa vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCartaoCreditoCommand('format', CARTAO_GOLDEN_VISA, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(CARTAO_GOLDEN_VISA_MASKED);
  });

  it('validates quiet', () => {
    expect(
      runCartaoCreditoCommand('validate', CARTAO_GOLDEN_VISA, { json: false, quiet: true, source: false }),
    ).toBe(EXIT.OK);
  });
});

describe('runCartaoCredito', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCartaoCredito('format', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
  });
});

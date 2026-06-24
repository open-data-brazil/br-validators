import { describe, expect, it } from 'vitest';
import { CEP_FAIXA_GOLDEN_PREFIX_SP } from '@br-validators/core/cep';
import { EXIT } from '../src/constants.js';
import {
  formatCepFaixaHuman,
  lookupCepFaixa,
  runCepFaixa,
  runCepFaixaCommand,
} from '../src/commands/cep/faixa.js';

describe('lookupCepFaixa', () => {
  it('resolves SP golden prefix', () => {
    const faixa = lookupCepFaixa(CEP_FAIXA_GOLDEN_PREFIX_SP);
    expect(faixa?.uf).toBe('SP');
  });

  it('returns undefined for invalid prefix', () => {
    expect(lookupCepFaixa('12')).toBeUndefined();
  });
});

describe('runCepFaixaCommand', () => {
  it('prints JSON for golden prefix', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCepFaixaCommand(CEP_FAIXA_GOLDEN_PREFIX_SP, { json: true, verbose: true }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { faixa: { prefixo: string }; capturadoEm?: string };
    expect(parsed.faixa.prefixo).toBe(CEP_FAIXA_GOLDEN_PREFIX_SP);
    expect(parsed.capturadoEm).toBeTruthy();
  });

  it('prints human output with verbose footer', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCepFaixaCommand(CEP_FAIXA_GOLDEN_PREFIX_SP, { json: false, verbose: true }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain(CEP_FAIXA_GOLDEN_PREFIX_SP);
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('prints human output', () => {
    const faixa = lookupCepFaixa(CEP_FAIXA_GOLDEN_PREFIX_SP);
    expect(faixa).toBeDefined();
    if (faixa) {
      expect(formatCepFaixaHuman(faixa)).toContain(CEP_FAIXA_GOLDEN_PREFIX_SP);
    }
  });

  it('returns invalid for unknown prefix', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCepFaixaCommand('00000', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
  });

  it('returns usage for short prefix', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCepFaixaCommand('12', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

describe('runCepFaixa', () => {
  it('returns usage when value missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCepFaixa(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

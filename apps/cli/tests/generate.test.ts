import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  runGenerate,
  printGenerate,
  isGeneratableType,
  buildGenerateOptions,
} from '../src/commands/generate.js';
import { validateCpf } from '@br-validators/core';

describe('generate command', () => {
  it('generates CPF', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runGenerate('cpf', { json: true, quiet: false, seed: 42 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0] ?? '{}') as { value: string };
    expect(validateCpf(parsed.value).ok).toBe(true);
  });

  it('rejects unknown type', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runGenerate('boleto', { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('isGeneratableType and buildGenerateOptions', () => {
    expect(isGeneratableType('cpf')).toBe(true);
    expect(buildGenerateOptions({ json: false, quiet: false, masked: true, seed: 1, format: 'legacy' })).toEqual({
      masked: true,
      seed: 1,
      format: 'legacy',
    });
  });

  it('printGenerate human output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(printGenerate('12345678909', { json: false, quiet: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toBe('12345678909');
  });

  it('printGenerate quiet', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(printGenerate('123', { json: false, quiet: true }, io)).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(0);
  });

  it('buildGenerateOptions empty', () => {
    expect(buildGenerateOptions({ json: false, quiet: false })).toEqual({});
  });
});

import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EXIT } from '../src/constants.js';
import { handleCnpjCli, handleCpfCli, handleListCli, readInputFile, writeCliIo } from '../src/handlers.js';
import { createProgram, run } from '../src/program.js';
import { CNPJ_GOLDEN_ALPHANUMERIC, CPF_GOLDEN_PRIMARY } from 'br-validators';

describe('handlers', () => {
  it('handleListCli lists types', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleListCli(io)).toBe(0);
    expect(io.stdout).toContain('cnpj');
    expect(io.stdout).toContain('cpf');
  });

  it('handleCpfCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCpfCli('validate', CPF_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCpfCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cpf.txt');
    writeFileSync(file, CPF_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCpfCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCpfCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCpfCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleCnpjCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnpjCli('validate', CNPJ_GOLDEN_ALPHANUMERIC, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('readInputFile returns null on missing file', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(readInputFile('/no/such/file.txt', io)).toBeNull();
    expect(io.stderr[0]).toContain('Cannot read file');
  });

  it('handleCnpjCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cnpj.txt');
    writeFileSync(file, CNPJ_GOLDEN_ALPHANUMERIC, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnpjCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCnpjCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCnpjCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('writeCliIo prints to console', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    writeCliIo({ stdout: ['a'], stderr: ['b'] });
    expect(log).toHaveBeenCalledWith('a');
    expect(err).toHaveBeenCalledWith('b');
    log.mockRestore();
    err.mockRestore();
  });
});

describe('program', () => {
  it('createProgram exposes list and cnpj commands', () => {
    const program = createProgram();
    expect(program.commands.map((c) => c.name())).toEqual(expect.arrayContaining(['list', 'cnpj', 'cpf']));
  });

  it('run parses list without throwing', () => {
    expect(() => { run(['node', 'br-validators', 'list']); }).not.toThrow();
  });

  it('run parses cnpj validate', () => {
    expect(() =>
      { run(['node', 'br-validators', 'cnpj', 'validate', CNPJ_GOLDEN_ALPHANUMERIC, '--quiet']); },
    ).not.toThrow();
  });

  it('run parses cpf validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'cpf', 'validate', CPF_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
  });

  it('run parses cnpj format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'cnpj', 'format', CNPJ_GOLDEN_ALPHANUMERIC]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'cnpj', 'strip', CNPJ_GOLDEN_ALPHANUMERIC]); }).not.toThrow();
  });

  it('run parses cpf format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'cpf', 'format', CPF_GOLDEN_PRIMARY]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'cpf', 'strip', CPF_GOLDEN_PRIMARY]); }).not.toThrow();
  });
});

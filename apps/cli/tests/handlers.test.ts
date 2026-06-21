import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EXIT } from '../src/constants.js';
import { handleCepCli, handleCnpjCli, handleCpfCli, handleListCli, handlePisPasepCli, handlePixCli, handleBoletoCli, handleCartaoCli, handlePlacaCli, readInputFile, writeCliIo } from '../src/handlers.js';
import { createProgram, run } from '../src/program.js';
import { CEP_GOLDEN_PRIMARY, CNPJ_GOLDEN_ALPHANUMERIC, CPF_GOLDEN_PRIMARY, PIX_GOLDEN_EMAIL, PIS_PASEP_GOLDEN_PRIMARY, PLACA_GOLDEN_MERCOSUL, BOLETO_GOLDEN_LINHA_STRIPPED, CARTAO_GOLDEN_VISA } from 'br-validators';

describe('handlers', () => {
  it('handleListCli lists types', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleListCli(io)).toBe(0);
    expect(io.stdout).toContain('cnpj');
    expect(io.stdout).toContain('cpf');
    expect(io.stdout).toContain('cep');
    expect(io.stdout).toContain('placa');
    expect(io.stdout).toContain('pis-pasep');
    expect(io.stdout).toContain('pix');
    expect(io.stdout).toContain('boleto');
    expect(io.stdout).toContain('cartao');
  });

  it('handleCartaoCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCli('validate', CARTAO_GOLDEN_VISA, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCartaoCli detects brand', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCli('detect', CARTAO_GOLDEN_VISA, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCartaoCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cartao.txt');
    writeFileSync(file, CARTAO_GOLDEN_VISA, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCartaoCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCartaoCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleBoletoCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBoletoCli('validate', BOLETO_GOLDEN_LINHA_STRIPPED, { quiet: true }, undefined, io)).toBe(EXIT.OK);
  });

  it('handleBoletoCli detects value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBoletoCli('detect', BOLETO_GOLDEN_LINHA_STRIPPED, { quiet: true }, undefined, io)).toBe(EXIT.OK);
  });

  it('handleBoletoCli converts linha to barras', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      handleBoletoCli('convert', BOLETO_GOLDEN_LINHA_STRIPPED, { quiet: true }, 'linha-to-barras', io),
    ).toBe(EXIT.OK);
  });

  it('handleBoletoCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'boleto.txt');
    writeFileSync(file, BOLETO_GOLDEN_LINHA_STRIPPED, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBoletoCli('validate', undefined, { file, quiet: true }, undefined, io)).toBe(EXIT.OK);
  });

  it('handleBoletoCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleBoletoCli('validate', undefined, { file: '/no/such/file.txt' }, undefined, io)).toBe(EXIT.USAGE);
  });

  it('handlePixCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePixCli('validate', PIX_GOLDEN_EMAIL, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePixCli detects value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePixCli('detect', PIX_GOLDEN_EMAIL, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePixCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'pix.txt');
    writeFileSync(file, PIX_GOLDEN_EMAIL, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePixCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePixCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePixCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handlePisPasepCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePisPasepCli('validate', PIS_PASEP_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePisPasepCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'pis-pasep.txt');
    writeFileSync(file, PIS_PASEP_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePisPasepCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePisPasepCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePisPasepCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handlePlacaCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePlacaCli('validate', PLACA_GOLDEN_MERCOSUL, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePlacaCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'placa.txt');
    writeFileSync(file, PLACA_GOLDEN_MERCOSUL, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePlacaCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handlePlacaCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handlePlacaCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
  });

  it('handleCepCli validates value', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCepCli('validate', CEP_GOLDEN_PRIMARY, { quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCepCli reads value from file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'br-validators-'));
    const file = join(dir, 'cep.txt');
    writeFileSync(file, CEP_GOLDEN_PRIMARY, 'utf8');
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCepCli('validate', undefined, { file, quiet: true }, io)).toBe(EXIT.OK);
  });

  it('handleCepCli returns usage when file unreadable', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleCepCli('validate', undefined, { file: '/no/such/file.txt' }, io)).toBe(EXIT.USAGE);
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
    expect(program.commands.map((c) => c.name())).toEqual(expect.arrayContaining(['list', 'cnpj', 'cpf', 'cep', 'placa', 'pis-pasep', 'pix', 'boleto', 'cartao']));
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

  it('run parses cep validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'cep', 'validate', CEP_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
  });

  it('run parses cep format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'cep', 'format', CEP_GOLDEN_PRIMARY]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'cep', 'strip', CEP_GOLDEN_PRIMARY]); }).not.toThrow();
  });

  it('run parses placa validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'placa', 'validate', PLACA_GOLDEN_MERCOSUL, '--quiet']);
    }).not.toThrow();
  });

  it('run parses placa format strip and convert', () => {
    expect(() => { run(['node', 'br-validators', 'placa', 'format', PLACA_GOLDEN_MERCOSUL]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'placa', 'strip', PLACA_GOLDEN_MERCOSUL]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'placa', 'convert', 'ABC1234', '--quiet']); }).not.toThrow();
  });

  it('run parses pis-pasep validate', () => {
    expect(() => {
      run(['node', 'br-validators', 'pis-pasep', 'validate', PIS_PASEP_GOLDEN_PRIMARY, '--quiet']);
    }).not.toThrow();
  });

  it('run parses pis-pasep format and strip', () => {
    expect(() => { run(['node', 'br-validators', 'pis-pasep', 'format', PIS_PASEP_GOLDEN_PRIMARY]); }).not.toThrow();
    expect(() => { run(['node', 'br-validators', 'pis-pasep', 'strip', PIS_PASEP_GOLDEN_PRIMARY]); }).not.toThrow();
  });

  it('run parses pix validate and detect', () => {
    expect(() => {
      run(['node', 'br-validators', 'pix', 'validate', PIX_GOLDEN_EMAIL, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'pix', 'detect', PIX_GOLDEN_EMAIL]);
    }).not.toThrow();
  });

  it('run parses boleto validate detect convert format strip', () => {
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'validate', BOLETO_GOLDEN_LINHA_STRIPPED, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'detect', BOLETO_GOLDEN_LINHA_STRIPPED]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'convert', 'linha-to-barras', BOLETO_GOLDEN_LINHA_STRIPPED, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'format', BOLETO_GOLDEN_LINHA_STRIPPED]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'boleto', 'strip', BOLETO_GOLDEN_LINHA_STRIPPED]);
    }).not.toThrow();
  });

  it('run parses cartao validate detect format strip', () => {
    expect(() => {
      run(['node', 'br-validators', 'cartao', 'validate', CARTAO_GOLDEN_VISA, '--quiet']);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'cartao', 'detect', CARTAO_GOLDEN_VISA]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'cartao', 'format', CARTAO_GOLDEN_VISA]);
    }).not.toThrow();
    expect(() => {
      run(['node', 'br-validators', 'cartao', 'strip', CARTAO_GOLDEN_VISA]);
    }).not.toThrow();
  });
});

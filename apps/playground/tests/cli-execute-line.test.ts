import { describe, expect, it } from 'vitest';
import { executeTerminalLine } from '../lib/cli/execute-line';

describe('executeTerminalLine', () => {
  it('runs list command like the real CLI', () => {
    const result = executeTerminalLine('list');
    expect(result.type).toBe('output');
    if (result.type !== 'output') {
      return;
    }
    expect(result.isError).toBe(false);
    expect(result.text).toMatch(/cpf/i);
  });

  it('validates CPF with exit semantics', () => {
    const valid = executeTerminalLine('cpf validate 123.456.789-09');
    expect(valid.type).toBe('output');
    if (valid.type !== 'output') {
      return;
    }
    expect(valid.isError).toBe(false);

    const invalid = executeTerminalLine('cpf validate 000.000.000-00');
    expect(invalid.type).toBe('output');
    if (invalid.type !== 'output') {
      return;
    }
    expect(invalid.isError).toBe(true);
  });

  it('supports clear and exit shell commands', () => {
    expect(executeTerminalLine('clear')).toEqual({ type: 'clear' });
    expect(executeTerminalLine('exit')).toEqual({ type: 'close' });
  });
});

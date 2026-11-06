import { describe, expect, it } from 'vitest';
import { CPF_GOLDEN_PRIMARY_MASKED } from '@br-validators/core';
import { EXIT } from '../src/constants.js';
import { runCaptured } from '../src/run-captured.js';

describe('runCaptured', () => {
  it('captures list output and exit code', () => {
    const result = runCaptured(['node', 'br-validators', 'list']);
    expect(result.exitCode).toBe(EXIT.OK);
    expect(result.stdout).toContain('cpf');
    expect(result.stdout).toContain('cnpj');
  });

  it('captures validate output', () => {
    const result = runCaptured([
      'node',
      'br-validators',
      'cpf',
      'validate',
      CPF_GOLDEN_PRIMARY_MASKED,
    ]);
    expect(result.exitCode).toBe(EXIT.OK);
    expect(result.stdout).toContain('valid: yes');
  });

  it('captures help to stdout', () => {
    const result = runCaptured(['node', 'br-validators', '--help']);
    expect(result.exitCode).toBe(EXIT.OK);
    expect(result.stdout.toLowerCase()).toContain('usage');
  });

  it('returns usage for unknown command', () => {
    const result = runCaptured(['node', 'br-validators', 'not-a-command']);
    expect(result.exitCode).not.toBe(EXIT.OK);
    expect(result.stderr.length + result.stdout.length).toBeGreaterThan(0);
  });

  it('accepts br-validators-prefixed argv', () => {
    const result = runCaptured(['br-validators', 'list']);
    expect(result.exitCode).toBe(EXIT.OK);
    expect(result.stdout).toContain('cpf');
  });

  it('accepts raw command tokens', () => {
    const result = runCaptured(['list']);
    expect(result.exitCode).toBe(EXIT.OK);
    expect(result.stdout).toContain('cpf');
  });
});

import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { runDetect, printDetect, resolveInput } from '../src/commands/detect.js';
import { CPF_GOLDEN_PRIMARY } from '@br-validators/core';

describe('detect command', () => {
  it('detects CPF', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDetect(CPF_GOLDEN_PRIMARY, { json: true, quiet: false }, io)).toBe(EXIT.OK);
    expect(JSON.parse(io.stdout[0] ?? '{}')).toMatchObject({ type: 'cpf', ok: true });
  });

  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDetect(undefined, { json: false, quiet: false }, io)).toBe(EXIT.USAGE);
  });

  it('resolveInput reads file content', () => {
    expect(resolveInput(undefined, `  ${CPF_GOLDEN_PRIMARY}  `)).toBe(CPF_GOLDEN_PRIMARY);
    expect(resolveInput(undefined, undefined)).toBeNull();
  });

  it('runDetect reads from file option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDetect(undefined, { json: false, quiet: true, file: CPF_GOLDEN_PRIMARY }, io)).toBe(EXIT.OK);
  });

  it('runDetect passes uf option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDetect('123456789012', { json: false, quiet: true, uf: 'sp' }, io)).toBe(EXIT.INVALID);
  });

  it('printDetect human output with meta', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    printDetect(
      { type: 'cpf', ok: true, value: CPF_GOLDEN_PRIMARY, format: 'numeric', meta: { note: 'x' } },
      { json: false, quiet: false },
      io,
    );
    expect(io.stdout.some((l) => l.includes('cpf'))).toBe(true);
    expect(io.stdout.some((l) => l.includes('format:'))).toBe(true);
    expect(io.stdout.some((l) => l.includes('meta:'))).toBe(true);
  });

  it('printDetect json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printDetect(
        { type: 'unknown', ok: false, code: 'UNSUPPORTED_FORMAT', message: 'No match' },
        { json: true, quiet: false },
        io,
      ),
    ).toBe(EXIT.INVALID);
  });

  it('printDetect quiet valid and invalid', () => {
    expect(
      printDetect({ type: 'cpf', ok: true, value: CPF_GOLDEN_PRIMARY }, { json: false, quiet: true }),
    ).toBe(EXIT.OK);
    expect(
      printDetect(
        { type: 'unknown', ok: false, code: 'UNSUPPORTED_FORMAT', message: 'No match' },
        { json: false, quiet: true },
      ),
    ).toBe(EXIT.INVALID);
  });

  it('printDetect failure', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printDetect(
        { type: 'unknown', ok: false, code: 'UNSUPPORTED_FORMAT', message: 'No match' },
        { json: false, quiet: false },
        io,
      ),
    ).toBe(EXIT.INVALID);
  });
});

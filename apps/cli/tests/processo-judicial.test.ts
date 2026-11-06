import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import {
  resolveInput,
  runProcessoJudicial,
  runProcessoJudicialCommand,
} from '../src/commands/processo-judicial.js';
import { printProcessoJudicialValidation } from '../src/output.js';
import {
  PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
  PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
  PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL,
  validateProcessoJudicial,
  type ProcessoJudicial,
} from '@br-validators/core/processo-judicial';

describe('resolveInput (processo-judicial)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runProcessoJudicialCommand', () => {
  it('validates golden primary vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicialCommand(
        'validate',
        PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
        { json: false, quiet: false, source: false },
        io,
      ),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runProcessoJudicialCommand(
      'validate',
      PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
      { json: true, quiet: false, source: true },
      io,
    );
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL);
  });

  it('parses golden primary with plain output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicialCommand(
        'parse',
        PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
        { json: false, quiet: false, source: false },
        io,
      ),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.startsWith('sequencial:'))).toBe(true);
    expect(io.stdout.some((line) => line.startsWith('origem:'))).toBe(true);
  });

  it('parses golden primary vector with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runProcessoJudicialCommand(
      'parse',
      PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
      { json: true, quiet: false, source: true },
      io,
    );
    const parsed = JSON.parse(io.stdout[0]) as {
      ok: boolean;
      segments?: { sequencial: string };
      source?: string;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.segments?.sequencial).toBe('0000100');
    expect(parsed.source).toBe(PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL);
  });

  it('parses json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicialCommand('parse', 'bad', { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('parses invalid with stderr output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicialCommand('parse', 'bad', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toBe('valid: no');
  });

  it('parses quiet valid and invalid', () => {
    expect(
      runProcessoJudicialCommand(
        'parse',
        PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
        { json: false, quiet: true, source: false },
      ),
    ).toBe(EXIT.OK);
    expect(runProcessoJudicialCommand('parse', 'bad', { json: false, quiet: true, source: false })).toBe(
      EXIT.INVALID,
    );
  });

  it('validates json invalid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicialCommand('validate', 'bad', { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('validates quiet mode', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicialCommand(
        'validate',
        PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
        { json: false, quiet: true, source: false },
        io,
      ),
    ).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(0);
  });

  it('formats with json error and success', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicialCommand('format', 'bad', { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
    runProcessoJudicialCommand(
      'format',
      PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
      { json: true, quiet: false, source: false },
      io,
    );
    const parsed = JSON.parse(io.stdout[1]) as { ok: boolean; formatted?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.formatted).toBe(PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED);
  });

  it('formats quiet and plain', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicialCommand(
        'format',
        PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
        { json: false, quiet: true, source: false },
      ),
    ).toBe(EXIT.OK);
    expect(
      runProcessoJudicialCommand(
        'format',
        PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
        { json: false, quiet: false, source: false },
        io,
      ),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain(PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED);
  });

  it('strips masked and json input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runProcessoJudicialCommand(
      'strip',
      PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
      { json: false, quiet: false, source: false },
      io,
    );
    expect(io.stdout[0]).toBe(PROCESSO_JUDICIAL_GOLDEN_PRIMARY);
    runProcessoJudicialCommand(
      'strip',
      PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED,
      { json: true, quiet: false, source: false },
      io,
    );
    const parsed = JSON.parse(io.stdout[1]) as { stripped: string };
    expect(parsed.stripped).toBe(PROCESSO_JUDICIAL_GOLDEN_PRIMARY);
  });
});

describe('runProcessoJudicial', () => {
  it('returns usage when value missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicial('validate', undefined, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing processo judicial');
  });

  it('reads from file content', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicial(
        'validate',
        undefined,
        { json: false, quiet: true, source: false, file: PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED },
        io,
      ),
    ).toBe(EXIT.OK);
  });
});

describe('runProcessoJudicialCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runProcessoJudicialCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});

describe('printProcessoJudicialValidation', () => {
  it('prints json success without source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    const result = validateProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED);
    expect(
      printProcessoJudicialValidation(result, { json: true, quiet: false }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; segments?: { sequencial: string }; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.segments?.sequencial).toBe('0000100');
    expect(parsed.source).toBeUndefined();
  });

  it('prints plain success with source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    const result = validateProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED);
    expect(
      printProcessoJudicialValidation(
        result,
        { json: false, quiet: false, source: PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL },
        io,
      ),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.startsWith('segmentoJustica:'))).toBe(true);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('prints quiet success and failure branches', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    const ok = validateProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED);
    expect(printProcessoJudicialValidation(ok, { json: false, quiet: true }, io)).toBe(EXIT.OK);
    const bad = validateProcessoJudicial('bad');
    expect(printProcessoJudicialValidation(bad, { json: false, quiet: true }, io)).toBe(EXIT.INVALID);
    expect(printProcessoJudicialValidation(bad, { json: true, quiet: false }, io)).toBe(EXIT.INVALID);
    expect(printProcessoJudicialValidation(bad, { json: false, quiet: false }, io)).toBe(EXIT.INVALID);
  });

  it('types success value as ProcessoJudicial brand', () => {
    const result = validateProcessoJudicial(PROCESSO_JUDICIAL_GOLDEN_PRIMARY_MASKED);
    if (result.ok) {
      const branded: ProcessoJudicial = result.value;
      expect(branded).toBe(PROCESSO_JUDICIAL_GOLDEN_PRIMARY);
    }
  });
});

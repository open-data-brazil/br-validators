import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { formatFeriadoHuman, runFeriadosList, runFeriadosListCommand } from '../src/commands/feriados/list.js';

describe('runFeriadosListCommand', () => {
  it('lists holidays for 2026 in JSON', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runFeriadosListCommand({ json: true, verbose: true, year: 2026 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { year: number; total: number; capturadoEm?: string };
    expect(parsed.year).toBe(2026);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.capturadoEm).toBeTruthy();
  });

  it('prints human lines with verbose footer', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runFeriadosListCommand({ json: false, verbose: true, year: 2025 }, io);
    expect(io.stdout[0]).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(io.stdout.at(-1)).toContain('capturadoEm:');
  });

  it('formats holiday human line', () => {
    expect(formatFeriadoHuman({ data: '2026-01-01', nome: 'Confraternização Universal', tipo: 'fixo' })).toContain(
      'fixo',
    );
  });
});

describe('runFeriadosList', () => {
  it('delegates to list command', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runFeriadosList({ json: true, verbose: false }, io)).toBe(EXIT.OK);
  });
});

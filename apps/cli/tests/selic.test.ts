import { describe, expect, it, vi } from 'vitest';
import { EXIT } from '../src/constants.js';
import * as selicCore from '@br-validators/core/selic';
import { runSelicCommand } from '../src/commands/selic/index.js';
import { handleSelicCli } from '../src/handlers.js';
import vectors from '../../../packages/br-validators/tests/vectors/selic.official.json';

describe('selic CLI', () => {
  const historical = vectors.golden.historicoRange.middle;

  it('prints latest meta as json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSelicCommand({ json: true, verbose: true }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { meta: { valor: number }; capturadoEm?: string };
    expect(parsed.meta.valor).toBe(vectors.golden.ultimaMeta.valor);
    expect(parsed.capturadoEm).toBeDefined();
  });

  it('prints an embedded historical meta as json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSelicCommand({ json: true, verbose: false, date: historical.data }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { meta: { data: string; valor: number } };
    expect(parsed.meta.data).toBe(historical.data);
    expect(parsed.meta.valor).toBe(historical.valor);
  });

  it('prints human output without verbose', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSelicCommand({ json: false, verbose: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain(`${String(vectors.golden.ultimaMeta.valor)}%`);
    expect(io.stdout.length).toBe(1);
  });

  it('prints human output with verbose staleness', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSelicCommand({ json: false, verbose: true, date: historical.data }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain(`${String(historical.valor)}%`);
    expect(io.stdout.some((line) => line.startsWith('isStale: true'))).toBe(true);
    expect(io.stdout.some((line) => line.startsWith('capturadoEm:'))).toBe(true);
  });

  it('rejects unknown date', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSelicCommand({ json: false, verbose: false, date: '1999-01-01' }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toContain('not found');
  });

  it('reports empty series when latest lookup returns nothing', () => {
    const spy = vi.spyOn(selicCore, 'getSelicMeta').mockReturnValue(undefined);
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSelicCommand({ json: false, verbose: false }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toContain('series is empty');
    spy.mockRestore();
  });

  it('treats blank date as latest lookup', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runSelicCommand({ json: true, verbose: false, date: '   ' }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { meta: { valor: number } };
    expect(parsed.meta.valor).toBe(vectors.golden.ultimaMeta.valor);
  });

  it('handler wrapper delegates', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(handleSelicCli({ json: true }, io)).toBe(EXIT.OK);
  });
});

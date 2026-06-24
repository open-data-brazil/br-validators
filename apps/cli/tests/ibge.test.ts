import { describe, expect, it } from 'vitest';
import { IBGE_GOLDEN_MUNICIPIO_SP } from '@br-validators/core/ibge';
import { EXIT } from '../src/constants.js';
import {
  formatMunicipioHuman,
  lookupMunicipio,
  normalizeIbgeMunicipioCode,
  runIbgeLookup,
  runIbgeLookupCommand,
} from '../src/commands/ibge/lookup.js';
import { runIbgeList, runIbgeListEstadosCommand, runIbgeListMunicipiosCommand } from '../src/commands/ibge/list.js';

describe('normalizeIbgeMunicipioCode', () => {
  it('accepts 7-digit municipality code', () => {
    expect(normalizeIbgeMunicipioCode(String(IBGE_GOLDEN_MUNICIPIO_SP))).toBe(IBGE_GOLDEN_MUNICIPIO_SP);
  });

  it('rejects invalid lengths', () => {
    expect(normalizeIbgeMunicipioCode('123')).toBeNull();
  });
});

describe('lookupMunicipio', () => {
  it('resolves São Paulo capital', () => {
    const municipio = lookupMunicipio(String(IBGE_GOLDEN_MUNICIPIO_SP));
    expect(municipio?.uf).toBe('SP');
    expect(municipio?.nome).toContain('Paulo');
  });

  it('returns undefined for invalid code shape', () => {
    expect(lookupMunicipio('123')).toBeUndefined();
  });

  it('returns undefined for unknown code', () => {
    expect(lookupMunicipio('9999999')).toBeUndefined();
  });
});

describe('runIbgeLookupCommand', () => {
  it('prints JSON for golden municipality', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIbgeLookupCommand(String(IBGE_GOLDEN_MUNICIPIO_SP), { json: true, verbose: true }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { municipio: { codigo: number }; capturadoEm?: string };
    expect(parsed.municipio.codigo).toBe(IBGE_GOLDEN_MUNICIPIO_SP);
    expect(parsed.capturadoEm).toBeTruthy();
  });

  it('prints human output with verbose footer', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runIbgeLookupCommand(String(IBGE_GOLDEN_MUNICIPIO_SP), { json: false, verbose: true }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('prints human output', () => {
    const municipio = lookupMunicipio(String(IBGE_GOLDEN_MUNICIPIO_SP));
    expect(municipio).toBeDefined();
    if (municipio) {
      expect(formatMunicipioHuman(municipio)).toContain('SP');
    }
  });

  it('returns invalid for unknown municipality', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIbgeLookupCommand('9999999', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
  });

  it('returns usage for invalid code length', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIbgeLookupCommand('123', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

describe('runIbgeLookup', () => {
  it('returns usage when value missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIbgeLookup(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

describe('runIbgeListEstadosCommand', () => {
  it('lists estados', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIbgeListEstadosCommand({ json: true, verbose: false, limit: 3 }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { total: number };
    expect(parsed.total).toBe(3);
  });

  it('lists estados with verbose JSON', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIbgeListEstadosCommand({ json: true, verbose: true, limit: 1 }, io);
    const parsed = JSON.parse(io.stdout[0]) as { capturadoEm?: string };
    expect(parsed.capturadoEm).toBeTruthy();
  });

  it('lists estados in human verbose mode', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIbgeListEstadosCommand({ json: false, verbose: true, limit: 1 }, io);
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('lists estados without limit when limit is non-positive', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIbgeListEstadosCommand({ json: true, verbose: false, limit: 0 }, io);
    const parsed = JSON.parse(io.stdout[0]) as { total: number };
    expect(parsed.total).toBeGreaterThan(20);
  });
});

describe('runIbgeListMunicipiosCommand', () => {
  it('lists municipios for SP', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIbgeListMunicipiosCommand({ json: false, verbose: true, uf: 'SP', limit: 2 }, io);
    expect(io.stdout).toHaveLength(3);
  });

  it('lists municipios with verbose JSON', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runIbgeListMunicipiosCommand({ json: true, verbose: true, uf: 'SP', limit: 1 }, io);
    const parsed = JSON.parse(io.stdout[0]) as { uf?: string; capturadoEm?: string };
    expect(parsed.uf).toBe('SP');
    expect(parsed.capturadoEm).toBeTruthy();
  });
});

describe('runIbgeList', () => {
  it('delegates estados list', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIbgeList('estados', { json: true, verbose: false, limit: 1 }, io)).toBe(EXIT.OK);
  });

  it('delegates municipios list', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runIbgeList('municipios', { json: true, verbose: false, limit: 1 }, io)).toBe(EXIT.OK);
  });
});

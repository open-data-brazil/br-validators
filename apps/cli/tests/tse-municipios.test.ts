import { describe, expect, it } from 'vitest';
import {
  TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO,
  TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO,
} from '@br-validators/core/tse-municipios';
import { EXIT } from '../src/constants.js';
import {
  formatTseLookupHuman,
  lookupTseMunicipio,
  runTseMunicipiosLookup,
  runTseMunicipiosLookupCommand,
} from '../src/commands/tse-municipios/lookup.js';

describe('lookupTseMunicipio', () => {
  it('resolves TSE code to IBGE', () => {
    const result = lookupTseMunicipio(TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO);
    expect(result?.kind).toBe('tse-to-ibge');
    if (result?.kind === 'tse-to-ibge') {
      expect(result.ibgeCodigo).toBe(TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO);
    }
  });

  it('resolves IBGE code to TSE codes', () => {
    const result = lookupTseMunicipio(String(TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO));
    expect(result?.kind).toBe('ibge-to-tse');
    if (result?.kind === 'ibge-to-tse') {
      expect(result.codigosTse).toContain(TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO);
    }
  });

  it('returns undefined for invalid code length', () => {
    expect(lookupTseMunicipio('123')).toBeUndefined();
  });

  it('returns undefined when IBGE has no TSE mapping', () => {
    expect(lookupTseMunicipio('1000000')).toBeUndefined();
  });
});

describe('runTseMunicipiosLookupCommand', () => {
  it('prints JSON for TSE golden code', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTseMunicipiosLookupCommand(TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO, { json: true, verbose: true }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { mapping: { kind: string }; capturadoEm?: string };
    expect(parsed.mapping.kind).toBe('tse-to-ibge');
    expect(parsed.capturadoEm).toBeTruthy();
  });

  it('prints human output for TSE code with verbose footer', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runTseMunicipiosLookupCommand(TSE_MUNICIPIOS_GOLDEN_CODIGO_TSE_SAO_PAULO, { json: false, verbose: true }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('TSE');
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('prints human output for IBGE code', () => {
    const result = lookupTseMunicipio(String(TSE_MUNICIPIOS_GOLDEN_IBGE_SAO_PAULO));
    expect(result).toBeDefined();
    if (result) {
      expect(formatTseLookupHuman(result)).toContain('TSE');
    }
  });

  it('formats human line when municipality name is missing', () => {
    expect(
      formatTseLookupHuman({
        kind: 'tse-to-ibge',
        codigoTse: '00001',
        ibgeCodigo: 9_999_999,
      }),
    ).toContain('9999999');
  });

  it('formats IBGE-to-TSE human line when municipality name is missing', () => {
    expect(
      formatTseLookupHuman({
        kind: 'ibge-to-tse',
        ibgeCodigo: 9_999_999,
        codigosTse: ['00001'],
      }),
    ).toContain('9999999');
  });

  it('returns invalid for unknown mapping', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runTseMunicipiosLookupCommand('99999', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
  });

  it('returns usage for invalid code length', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runTseMunicipiosLookupCommand('123', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

describe('runTseMunicipiosLookup', () => {
  it('returns usage when value missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runTseMunicipiosLookup(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

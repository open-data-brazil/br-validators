import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { formatDddHuman, lookupDdd, runDddLookup, runDddLookupCommand } from '../src/commands/ddd/lookup.js';

describe('lookupDdd', () => {
  it('resolves DDD 11', () => {
    const info = lookupDdd('11');
    expect(info?.uf).toBe('SP');
    expect(info?.ddd).toBe('11');
  });

  it('returns undefined for empty input', () => {
    expect(lookupDdd('')).toBeUndefined();
  });

  it('returns undefined for invalid DDD', () => {
    expect(lookupDdd('00')).toBeUndefined();
  });
});

describe('runDddLookupCommand', () => {
  it('prints JSON for DDD 11', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDddLookupCommand('11', { json: true, verbose: true }, io)).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ddd: { ddd: string }; capturadoEm?: string };
    expect(parsed.ddd.ddd).toBe('11');
    expect(parsed.capturadoEm).toBeTruthy();
  });

  it('prints human output with verbose footer', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDddLookupCommand('11', { json: false, verbose: true }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('DDD 11');
    expect(io.stdout[1]).toContain('capturadoEm:');
  });

  it('prints human output with municipality truncation', () => {
    const info = lookupDdd('11');
    expect(info).toBeDefined();
    if (info) {
      expect(formatDddHuman(info)).toContain('DDD 11');
    }
    const fewMunicipios = { ...info!, municipios: ['A', 'B'] };
    expect(formatDddHuman(fewMunicipios)).not.toContain('…');
  });

  it('returns invalid for unknown DDD', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDddLookupCommand('00', { json: false, verbose: false }, io)).toBe(EXIT.INVALID);
  });

  it('returns usage for empty input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDddLookupCommand('', { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

describe('runDddLookup', () => {
  it('returns usage when value missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runDddLookup(undefined, { json: false, verbose: false }, io)).toBe(EXIT.USAGE);
  });
});

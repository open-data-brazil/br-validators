import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ISS_MUNICIPAL_CAPITAL_IBGE_CODES } from './iss-municipal-capital-seeds.js';
import { ISS_MUNICIPAL_NFSE_SEEDS } from './iss-municipal-nfse-seeds.js';
import {
  crossCheckSidraAgainstXlsxTop,
  ISS_MUNICIPAL_TARGET_COUNT,
  buildIssMunicipalEmbed,
  buildMunicipioNameIndex,
} from './iss-municipal-build.js';
import type { IbgeSidraPibRow } from './parse-ibge-pib-sidra.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MUNICIPIOS_PATH = path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json');

interface MunicipioRecord {
  codigo: number;
  nome: string;
  uf: string;
}

function syntheticSidraPibRows(municipios: readonly MunicipioRecord[]): IbgeSidraPibRow[] {
  const capitalSet = new Set(ISS_MUNICIPAL_CAPITAL_IBGE_CODES);
  return municipios
    .filter((municipio) => !capitalSet.has(municipio.codigo))
    .map((municipio, index) => ({
      codigoIbge: municipio.codigo,
      pibMilReais: municipios.length - index,
    }));
}

describe('iss-municipal build', () => {
  it('lists 27 capital IBGE codes', () => {
    expect(ISS_MUNICIPAL_CAPITAL_IBGE_CODES).toHaveLength(27);
  });

  it('indexes municipios by normalized nome and UF', () => {
    const index = buildMunicipioNameIndex([
      { codigo: 1, nome: 'São Paulo', uf: 'SP' },
      { codigo: 2, nome: 'Campinas', uf: 'SP' },
    ]);
    expect(index.size).toBe(2);
    expect(index.get('sao paulo|SP')?.codigo).toBe(1);
    expect(index.get('campinas|SP')?.codigo).toBe(2);
  });

  it('builds 500-row embed from capitals and synthetic SIDRA rows', () => {
    const municipios = JSON.parse(readFileSync(MUNICIPIOS_PATH, 'utf8')) as MunicipioRecord[];
    const sidraPibRows = syntheticSidraPibRows(municipios);
    expect(sidraPibRows.length).toBeGreaterThanOrEqual(
      ISS_MUNICIPAL_TARGET_COUNT - ISS_MUNICIPAL_CAPITAL_IBGE_CODES.length,
    );

    const rows = buildIssMunicipalEmbed({
      municipios,
      sidraPibRows,
      capturadoEm: '2026-06-26',
    });

    expect(rows).toHaveLength(ISS_MUNICIPAL_TARGET_COUNT);
    const capitalSet = new Set(ISS_MUNICIPAL_CAPITAL_IBGE_CODES);
    const nfseSet = new Set(ISS_MUNICIPAL_NFSE_SEEDS.map((seed) => seed.codigoIbge));
    const expectedOfficial = rows.filter(
      (row) => capitalSet.has(row.codigoIbge) || nfseSet.has(row.codigoIbge),
    );
    expect(rows.filter((row) => !row.estimativa)).toHaveLength(expectedOfficial.length);
    expect(expectedOfficial.length).toBeGreaterThanOrEqual(27);
    expect(rows.some((row) => row.codigoIbge === 3550308)).toBe(true);
    expect(rows.some((row) => row.estimativa)).toBe(true);
  });

  it('always includes capitals even when SIDRA ranks them lowest', () => {
    const municipios = JSON.parse(readFileSync(MUNICIPIOS_PATH, 'utf8')) as MunicipioRecord[];
    const capitalSet = new Set(ISS_MUNICIPAL_CAPITAL_IBGE_CODES);
    const sidraPibRows = municipios.map((municipio, index) => ({
      codigoIbge: municipio.codigo,
      pibMilReais:
        municipio.codigo === 1721000 ? 1 : municipios.length - index + (capitalSet.has(municipio.codigo) ? 0 : 100),
    }));

    const rows = buildIssMunicipalEmbed({
      municipios,
      sidraPibRows,
      capturadoEm: '2026-06-26',
    });

    expect(rows.some((row) => row.codigoIbge === 1721000)).toBe(true);
  });

  it('keeps NFSe seeds disjoint from capital seeds', () => {
    const capitalSet = new Set(ISS_MUNICIPAL_CAPITAL_IBGE_CODES);
    for (const seed of ISS_MUNICIPAL_NFSE_SEEDS) {
      expect(capitalSet.has(seed.codigoIbge)).toBe(false);
      expect(seed.aliquotaMin).toBeGreaterThanOrEqual(2);
      expect(seed.aliquotaMax).toBeLessThanOrEqual(5);
      expect(seed.aliquotaMin).toBeLessThanOrEqual(seed.aliquotaMax);
      expect(seed.leiUrl.startsWith('https://')).toBe(true);
    }
    expect(ISS_MUNICIPAL_NFSE_SEEDS.length).toBeGreaterThan(0);
  });

  it('resolves NFSe-seeded rows as official and unseeded rows as estimation', () => {
    const municipios: MunicipioRecord[] = [
      ...ISS_MUNICIPAL_CAPITAL_IBGE_CODES.map((codigo, index) => ({
        codigo,
        nome: `Capital ${String(index)}`,
        uf: 'SP',
      })),
      { codigo: 3509502, nome: 'Campinas', uf: 'SP' },
      { codigo: 3518800, nome: 'Guarulhos', uf: 'SP' },
    ];
    const sidraPibRows = [
      { codigoIbge: 3509502, pibMilReais: 2 },
      { codigoIbge: 3518800, pibMilReais: 1 },
    ];

    const rows = buildIssMunicipalEmbed({
      municipios,
      sidraPibRows,
      capturadoEm: '2026-09-24',
      targetCount: ISS_MUNICIPAL_CAPITAL_IBGE_CODES.length + 2,
    });

    const byCodigo = new Map(rows.map((row) => [row.codigoIbge, row]));
    expect(byCodigo.get(3550308)?.estimativa).toBe(false);
    expect(byCodigo.get(3509502)?.estimativa).toBe(false);
    expect(byCodigo.get(3509502)?.leiUrl).toContain('campinas.sp.gov.br');
    // Guarulhos has no verified citation yet — stays estimation-only.
    expect(byCodigo.get(3518800)?.estimativa).toBe(true);
  });

  it('keeps package capital codes in sync with capital seeds', () => {
    const constantsPath = path.join(
      ROOT,
      'packages/br-validators/src/iss-municipal/constants.ts',
    );
    const source = readFileSync(constantsPath, 'utf8');
    const match = /ISS_MUNICIPAL_CAPITAL_IBGE_CODES[^=]*=\s*\[([\s\S]*?)\];/.exec(source);
    expect(match).not.toBeNull();
    const codes = [...(match?.[1] ?? '').matchAll(/(\d{7})/g)].map((entry) => Number(entry[1]));
    expect([...codes].sort((a, b) => a - b)).toEqual(
      [...ISS_MUNICIPAL_CAPITAL_IBGE_CODES].sort((a, b) => a - b),
    );
  });

  it('cross-checks XLSX top municipalities against SIDRA top 20', () => {
    const municipios = JSON.parse(readFileSync(MUNICIPIOS_PATH, 'utf8')) as MunicipioRecord[];
    const nameIndex = buildMunicipioNameIndex(municipios);
    const sidraPibRows = syntheticSidraPibRows(municipios);
    const xlsxTopRows = [
      { pibRank: 1, nome: municipios[0]?.nome ?? '', uf: municipios[0]?.uf ?? 'SP' },
    ];

    expect(() => {
      crossCheckSidraAgainstXlsxTop(sidraPibRows, xlsxTopRows, nameIndex);
    }).not.toThrow();
    expect(() => {
      crossCheckSidraAgainstXlsxTop(
        [{ codigoIbge: 9999999, pibMilReais: 1 }],
        [{ pibRank: 1, nome: municipios[0]?.nome ?? '', uf: municipios[0]?.uf ?? 'SP' }],
        nameIndex,
      );
    }).toThrow('XLSX cross-check failed');
  });
});

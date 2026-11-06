import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildCoverageGapSummaryJson,
  computeIssMunicipalGaps,
  generateCoverageGapsMarkdown,
  writeCoverageGapArtifacts,
} from './coverage-gaps.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, '../fixtures/coverage-gaps-determinism');

describe('coverage-gaps', () => {
  const ibge = [
    { codigo: 3550308, nome: 'São Paulo', uf: 'SP' },
    { codigo: 3509502, nome: 'Campinas', uf: 'SP' },
    { codigo: 3106200, nome: 'Belo Horizonte', uf: 'MG' },
    { codigo: 5107925, nome: 'Sorriso', uf: 'MT' },
  ] as const;

  const iss = [
    {
      codigoIbge: 3550308,
      nome: 'São Paulo',
      uf: 'SP',
      estimativa: false,
    },
    {
      codigoIbge: 3509502,
      nome: 'Campinas',
      uf: 'SP',
      estimativa: true,
    },
    {
      codigoIbge: 3106200,
      nome: 'Belo Horizonte',
      uf: 'MG',
      estimativa: false,
    },
  ] as const;

  it('computes not-embedded and estimativa-only municipalities', () => {
    const result = computeIssMunicipalGaps(ibge, iss);

    expect(result.totals).toEqual({
      ibgeMunicipioTotal: 4,
      issEmbeddedTotal: 3,
      issNotEmbeddedTotal: 1,
      issEstimativaOnlyTotal: 1,
      issOfficialMunicipalRateTotal: 2,
    });

    expect(result.notEmbedded).toEqual([{ codigoIbge: 5107925, nome: 'Sorriso', uf: 'MT' }]);
    expect(result.estimativaOnly).toEqual([{ codigoIbge: 3509502, nome: 'Campinas', uf: 'SP' }]);
    expect(result.officialMunicipalRate.map((row) => row.codigoIbge).sort()).toEqual([3106200, 3550308]);
  });

  it('aggregates per-UF counts', () => {
    const result = computeIssMunicipalGaps(ibge, iss);
    const sp = result.byUf.find((row) => row.uf === 'SP');

    expect(sp).toEqual({
      uf: 'SP',
      ibgeTotal: 2,
      embedded: 2,
      notEmbedded: 0,
      estimativaOnly: 1,
      officialMunicipalRate: 1,
    });
  });

  it('generates markdown with totals and UF table', () => {
    const result = computeIssMunicipalGaps(ibge, iss);
    const markdown = generateCoverageGapsMarkdown(result);

    expect(markdown).toContain('# Coverage gaps');
    expect(markdown).toContain('**1** municipalities not in embed');
    expect(markdown).toContain('iss-municipal-not-embedded.json');
    expect(markdown).toContain('| **SP** | 2 | 2 | 0 | 1 | 1 |');
    expect(markdown).toContain('INSS employee contribution');
  });

  it('builds summary JSON envelope', () => {
    const result = computeIssMunicipalGaps(ibge, iss);
    const summary = buildCoverageGapSummaryJson(result);

    expect(summary.issMunicipal.issNotEmbeddedTotal).toBe(1);
    expect(summary.notes.inss).toContain('National');
  });

  it('writes byte-identical artifacts on repeat runs (CI freshness check)', async () => {
    await rm(FIXTURE_ROOT, { recursive: true, force: true });
    try {
      const ibgePath = path.join(FIXTURE_ROOT, 'municipios.json');
      const issPath = path.join(FIXTURE_ROOT, 'iss-municipal.json');
      const outputDir = path.join(FIXTURE_ROOT, 'out');
      const markdownPath = path.join(FIXTURE_ROOT, 'COVERAGE-GAPS.md');
      await mkdir(FIXTURE_ROOT, { recursive: true });
      await writeFile(ibgePath, JSON.stringify(ibge));
      await writeFile(issPath, JSON.stringify(iss));

      const options = { ibgeMunicipiosPath: ibgePath, issMunicipalPath: issPath, outputDir, markdownPath };
      await writeCoverageGapArtifacts(options);
      const snapshot = async (): Promise<string[]> =>
        Promise.all(
          ['summary.json', 'iss-municipal-not-embedded.json', 'iss-municipal-estimativa-only.json', 'iss-municipal-official-rate.json'].map(
            (file) => readFile(path.join(outputDir, file), 'utf8'),
          ),
        );
      const first = await snapshot();
      const firstMarkdown = await readFile(markdownPath, 'utf8');

      await writeCoverageGapArtifacts(options);
      expect(await snapshot()).toEqual(first);
      expect(await readFile(markdownPath, 'utf8')).toBe(firstMarkdown);
    } finally {
      await rm(FIXTURE_ROOT, { recursive: true, force: true });
    }
  });
});

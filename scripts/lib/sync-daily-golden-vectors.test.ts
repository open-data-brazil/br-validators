import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import {
  syncAnpGoldenVectors,
  syncIbptGoldenVectors,
  syncPtaxGoldenVectors,
  syncSelicGoldenVectors,
} from './sync-daily-golden-vectors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, '../fixtures/sync-daily-golden-vectors');

async function writeJson(relativePath: string, value: object): Promise<string> {
  const filePath = path.join(FIXTURE_ROOT, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
  return filePath;
}

describe('sync-daily-golden-vectors', () => {
  afterEach(async () => {
    await rm(FIXTURE_ROOT, { recursive: true, force: true });
  });

  it('updates SELIC rolling golden fields from embedded data', async () => {
    const selicPath = await writeJson('selic/selic.json', [
      { data: '2026-04-01', valor: 14.75 },
      { data: '2026-04-02', valor: 14.75 },
      { data: '2026-04-03', valor: 14.75 },
      { data: '2026-06-29', valor: 14.25 },
    ]);
    const metadataPath = await writeJson('selic/metadata.json', { capturadoEm: '2026-06-29' });
    const vectorsPath = await writeJson('selic/selic.official.json', {
      golden: {
        ultimaMeta: { data: '2026-06-26', valor: 14.25 },
        inicioJanela: { data: '2026-03-29', valor: 14.75 },
        historicoRange: {
          from: { data: '2026-03-29', valor: 14.75 },
          middle: { data: '2026-03-30', valor: 14.75 },
          to: { data: '2026-03-31', valor: 14.75 },
        },
      },
      staleness: {
        asOfFresh: '2026-06-26',
        freshReferenceDate: '2026-06-26',
        staleReferenceDate: '2026-06-24',
        capturadoEm: '2026-06-26',
        staleWarning: 'Embedded data. For real-time use @br-validators/adapters-selic',
      },
    });

    const updated = await syncSelicGoldenVectors(selicPath, metadataPath, vectorsPath);
    expect(updated).toBe(true);

    const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as {
      golden: {
        ultimaMeta: { data: string; valor: number };
        inicioJanela: { data: string };
        historicoRange: {
          from: { data: string; valor: number };
          middle: { data: string; valor: number };
          to: { data: string; valor: number };
        };
      };
      staleness: { capturadoEm: string; freshReferenceDate: string };
    };
    expect(vectors.golden.ultimaMeta.data).toBe('2026-06-29');
    expect(vectors.golden.ultimaMeta.valor).toBe(14.25);
    expect(vectors.golden.inicioJanela.data).toBe('2026-04-01');
    expect(vectors.golden.historicoRange).toEqual({
      from: { data: '2026-04-01', valor: 14.75 },
      middle: { data: '2026-04-02', valor: 14.75 },
      to: { data: '2026-04-03', valor: 14.75 },
    });
    expect(vectors.staleness.capturadoEm).toBe('2026-06-29');
    expect(vectors.staleness.freshReferenceDate).toBe('2026-06-29');
  });

  it('picks oldest observation as stale when previous stale falls out of rolling window', async () => {
    // Regression: data-refresh-bot Verify failed with
    // `expected false to be true` at selic.test.ts:103 because the sync
    // picked the newest date < fresh (fresh - 1 day = previous business day,
    // NOT stale) instead of the oldest date (guaranteed stale).
    const selicPath = await writeJson('selic-stale/selic.json', [
      { data: '2026-09-20', valor: 13.75 },
      { data: '2026-09-21', valor: 13.75 },
      { data: '2026-09-22', valor: 13.75 },
      { data: '2026-09-23', valor: 13.75 },
      { data: '2026-09-24', valor: 13.75 },
    ]);
    const metadataPath = await writeJson('selic-stale/metadata.json', { capturadoEm: '2026-09-24' });
    const vectorsPath = await writeJson('selic-stale/selic.official.json', {
      golden: {
        ultimaMeta: { data: '2026-09-18', valor: 13.75 },
        inicioJanela: { data: '2026-06-21', valor: 14.25 },
        historicoRange: {
          from: { data: '2026-06-21', valor: 14.25 },
          middle: { data: '2026-06-22', valor: 14.25 },
          to: { data: '2026-06-23', valor: 14.25 },
        },
      },
      staleness: {
        asOfFresh: '2026-09-18',
        freshReferenceDate: '2026-09-18',
        staleReferenceDate: '2026-06-24',
        capturadoEm: '2026-09-18',
        staleWarning: 'Embedded data. For real-time use @br-validators/adapters-selic',
      },
    });

    const updated = await syncSelicGoldenVectors(selicPath, metadataPath, vectorsPath);
    expect(updated).toBe(true);

    const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as {
      staleness: { staleReferenceDate: string; freshReferenceDate: string; asOfFresh: string };
    };
    // Oldest, not newest (2026-09-23 would NOT be stale vs 2026-09-24).
    expect(vectors.staleness.staleReferenceDate).toBe('2026-09-20');
    expect(vectors.staleness.staleReferenceDate < vectors.staleness.freshReferenceDate).toBe(true);
  });

  it('keeps existing stale date while it remains in the rolling window', async () => {
    const selicPath = await writeJson('selic-keep/selic.json', [
      { data: '2026-06-24', valor: 14.25 },
      { data: '2026-06-25', valor: 14.25 },
      { data: '2026-06-26', valor: 14.25 },
      { data: '2026-09-21', valor: 13.75 },
    ]);
    const metadataPath = await writeJson('selic-keep/metadata.json', { capturadoEm: '2026-09-21' });
    const vectorsPath = await writeJson('selic-keep/selic.official.json', {
      golden: {
        ultimaMeta: { data: '2026-09-18', valor: 13.75 },
        inicioJanela: { data: '2026-06-21', valor: 14.25 },
        historicoRange: {
          from: { data: '2026-06-21', valor: 14.25 },
          middle: { data: '2026-06-22', valor: 14.25 },
          to: { data: '2026-06-23', valor: 14.25 },
        },
      },
      staleness: {
        asOfFresh: '2026-09-18',
        freshReferenceDate: '2026-09-18',
        staleReferenceDate: '2026-06-24',
        capturadoEm: '2026-09-18',
        staleWarning: 'Embedded data. For real-time use @br-validators/adapters-selic',
      },
    });

    const updated = await syncSelicGoldenVectors(selicPath, metadataPath, vectorsPath);
    expect(updated).toBe(true);

    const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as {
      staleness: { staleReferenceDate: string };
    };
    expect(vectors.staleness.staleReferenceDate).toBe('2026-06-24');
  });

  it('updates PTAX último dia útil golden fields from embedded data', async () => {
    const ptaxPath = await writeJson('ptax/ptax.json', [
      {
        moeda: 'USD',
        data: '2026-06-23',
        cotacaoCompra: 5.1737,
        cotacaoVenda: 5.1743,
      },
      {
        moeda: 'USD',
        data: '2026-06-29',
        cotacaoCompra: 5.15,
        cotacaoVenda: 5.151,
      },
      {
        moeda: 'EUR',
        data: '2026-06-29',
        cotacaoCompra: 5.9,
        cotacaoVenda: 5.901,
      },
    ]);
    const metadataPath = await writeJson('ptax/metadata.json', { capturadoEm: '2026-06-29' });
    const vectorsPath = await writeJson('ptax/ptax.official.json', {
      golden: {
        usdUltimoDiaUtil: {
          moeda: 'USD',
          data: '2026-06-26',
          cotacaoCompra: 5.1689,
          cotacaoVenda: 5.1695,
        },
        eurUltimoDiaUtil: {
          moeda: 'EUR',
          data: '2026-06-26',
          cotacaoCompra: 5.8941,
          cotacaoVenda: 5.8953,
        },
        usdHistorico: {
          moeda: 'USD',
          data: '2026-06-23',
          dataBacen: '06-23-2026',
          cotacaoCompra: 5.1737,
          cotacaoVenda: 5.1743,
        },
        historicoRange: {
          moeda: 'USD',
          desde: '2026-06-20',
          ate: '2026-06-26',
          expectedRowCount: 5,
          firstDate: '2026-06-22',
          lastDate: '2026-06-26',
        },
      },
      staleness: {
        asOfFresh: '2026-06-27',
        freshReferenceDate: '2026-06-26',
        staleReferenceDate: '2026-06-23',
        capturadoEm: '2026-06-27',
        staleWarning: 'Embedded data. For real-time use @br-validators/adapters-ptax',
      },
    });

    const updated = await syncPtaxGoldenVectors(ptaxPath, metadataPath, vectorsPath);
    expect(updated).toBe(true);

    const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as {
      golden: { usdUltimoDiaUtil: { data: string; cotacaoCompra: number } };
      staleness: { capturadoEm: string; freshReferenceDate: string };
    };
    expect(vectors.golden.usdUltimoDiaUtil.data).toBe('2026-06-29');
    expect(vectors.golden.usdUltimoDiaUtil.cotacaoCompra).toBe(5.15);
    expect(vectors.staleness.capturadoEm).toBe('2026-06-29');
    expect(vectors.staleness.freshReferenceDate).toBe('2026-06-29');
  });

  it('moves the PTAX historical golden row along with the rolling window', async () => {
    const ptaxPath = await writeJson('ptax-window/ptax.json', [
      { moeda: 'USD', data: '2026-07-01', cotacaoCompra: 5.2, cotacaoVenda: 5.201 },
      { moeda: 'USD', data: '2026-07-02', cotacaoCompra: 5.21, cotacaoVenda: 5.211 },
      { moeda: 'EUR', data: '2026-07-02', cotacaoCompra: 5.9, cotacaoVenda: 5.901 },
    ]);
    const metadataPath = await writeJson('ptax-window/metadata.json', { capturadoEm: '2026-07-03' });
    const vectorsPath = await writeJson('ptax-window/ptax.official.json', {
      golden: {
        usdUltimoDiaUtil: { moeda: 'USD', data: '2026-06-26', cotacaoCompra: 1, cotacaoVenda: 1 },
        eurUltimoDiaUtil: { moeda: 'EUR', data: '2026-06-26', cotacaoCompra: 1, cotacaoVenda: 1 },
        usdHistorico: {
          moeda: 'USD',
          data: '2026-06-23',
          dataBacen: '06-23-2026',
          cotacaoCompra: 5.1737,
          cotacaoVenda: 5.1743,
        },
        historicoRange: {
          moeda: 'USD',
          desde: '2026-06-20',
          ate: '2026-06-26',
          expectedRowCount: 5,
          firstDate: '2026-06-22',
          lastDate: '2026-06-26',
        },
      },
      staleness: {
        asOfFresh: '2026-06-27',
        freshReferenceDate: '2026-06-26',
        staleReferenceDate: '2026-06-23',
        capturadoEm: '2026-06-27',
        staleWarning: 'Embedded data. For real-time use @br-validators/adapters-ptax',
      },
    });

    expect(await syncPtaxGoldenVectors(ptaxPath, metadataPath, vectorsPath)).toBe(true);

    const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as {
      golden: {
        usdHistorico: { data: string; dataBacen: string; cotacaoCompra: number };
        historicoRange: { firstDate: string; expectedRowCount: number };
      };
    };
    expect(vectors.golden.usdHistorico).toMatchObject({
      data: '2026-07-01',
      dataBacen: '07-01-2026',
      cotacaoCompra: 5.2,
    });
    expect(vectors.golden.historicoRange.firstDate).toBe('2026-07-01');
    expect(vectors.golden.historicoRange.expectedRowCount).toBe(2);
  });

  it('moves the IBPT tabela id with the embedded data, keeping golden aliquotas', async () => {
    const cargasPath = await writeJson('ibpt/cargas.json', [
      { ncm: '01012100', uf: 'SP', tabela: '26.2.C' },
      { ncm: '01012100', uf: 'RJ', tabela: '26.2.C' },
    ]);
    const vectorsPath = await writeJson('ibpt/ibpt.official.json', {
      tabela: '26.1.K',
      golden: { cavalosSp: { aliquotaEstadual: 18 } },
    });

    expect(await syncIbptGoldenVectors(cargasPath, vectorsPath)).toBe(true);
    const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as {
      tabela: string;
      golden: { cavalosSp: { aliquotaEstadual: number } };
    };
    expect(vectors.tabela).toBe('26.2.C');
    expect(vectors.golden.cavalosSp.aliquotaEstadual).toBe(18);
    expect(await syncIbptGoldenVectors(cargasPath, vectorsPath)).toBe(false);
  });

  it('updates ANP week and golden prices from embedded data', async () => {
    const precosPath = await writeJson('anp/precos-medios.json', [
      {
        semanaInicio: '2026-06-21',
        semanaFim: '2026-06-27',
        uf: 'SP',
        municipioNome: 'SAO PAULO',
        municipioIbge: 3550308,
        produto: 'GASOLINE_REGULAR',
        precoMedio: 6.5,
      },
      {
        semanaInicio: '2026-06-21',
        semanaFim: '2026-06-27',
        uf: 'SP',
        municipioNome: 'ADAMANTINA',
        municipioIbge: 3500105,
        produto: 'ETHANOL',
        precoMedio: 3.4,
      },
      {
        semanaInicio: '2026-06-21',
        semanaFim: '2026-06-27',
        uf: 'MS',
        municipioNome: 'CAMPO GRANDE',
        municipioIbge: 5002704,
        produto: 'LPG_P13',
        precoMedio: 115.18,
      },
    ]);
    const semanasPath = await writeJson('anp/semanas.json', [{ inicio: '2026-06-21', fim: '2026-06-27' }]);
    const metadataPath = await writeJson('anp/metadata.json', {
      endpoints: [
        'https://www.gov.br/anp/pt-br/listing',
        'https://www.gov.br/anp/pt-br/arquivos/resumo_semanal_lpc_2026-06-21_2026-06-27.xlsx',
      ],
    });
    const vectorsPath = await writeJson('anp/anp-combustiveis.official.json', {
      source: 'https://www.gov.br/anp/pt-br/old.xlsx',
      listingUrl: 'https://www.gov.br/anp/pt-br/listing',
      week: { inicio: '2026-06-14', fim: '2026-06-20' },
      golden: {
        saoPauloGasolina: {
          uf: 'SP',
          municipio: 'SAO PAULO',
          produto: 'GASOLINE_REGULAR',
          municipioIbge: 3550308,
          precoMedio: 6.46,
        },
        adamantinaEtanol: {
          uf: 'SP',
          municipio: 'ADAMANTINA',
          produto: 'ETHANOL',
          municipioIbge: 3500105,
          precoMedio: 3.39,
        },
        campoGrandeGlp: {
          uf: 'MS',
          municipio: 'CAMPO GRANDE',
          produto: 'LPG_P13',
          municipioIbge: 5002704,
          precoMedio: 116.6,
        },
      },
    });

    const updated = await syncAnpGoldenVectors(precosPath, semanasPath, metadataPath, vectorsPath);
    expect(updated).toBe(true);

    const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as {
      source: string;
      week: { inicio: string; fim: string };
      golden: { saoPauloGasolina: { precoMedio: number } };
    };
    expect(vectors.week).toEqual({ inicio: '2026-06-21', fim: '2026-06-27' });
    expect(vectors.source).toContain('2026-06-21_2026-06-27.xlsx');
    expect(vectors.golden.saoPauloGasolina.precoMedio).toBe(6.5);
  });
});

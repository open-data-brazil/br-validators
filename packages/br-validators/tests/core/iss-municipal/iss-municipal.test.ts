import { describe, expect, it } from 'vitest';

import { buildIssMunicipalResult, buildIssMunicIbgeResult, buildLc116EstimativaResult, resolveIssMunicipalFonte } from '../../../src/iss-municipal/result.js';
import {
  getAllIssMunicipal,
  getIssMunicipalPorIbge,
  getIssMunicipalPorUf,
  getIssMunicipalPorUfMunicipio,
  getIssMunicipalUfsDisponiveis,
  searchIssMunicipal,
} from '../../../src/iss-municipal/lookup.js';
import { getAllIssMunicIbge } from '../../../src/iss-municipal/cascade-lookup.js';
import {
  ISS_MUNIC_GOLDEN_ACRELANDIA,
  ISS_MUNICIPAL_CAPITAL_COUNT,
  ISS_MUNICIPAL_CAPITAL_IBGE_CODES,
  ISS_MUNICIPAL_ESTIMATION_WARNING,
  ISS_MUNICIPAL_GOLDEN_RIO,
  ISS_MUNICIPAL_GOLDEN_SAO_PAULO,
  ISS_MUNICIPAL_LC116_MAX,
  ISS_MUNICIPAL_LC116_MIN,
  ISS_MUNICIPAL_TARGET_COUNT,
  ISS_MUNICIPAL_DATA_VERSION,
  PLANALTO_LC116_ART8_URL,
} from '../../../src/iss-municipal/index.js';
import vectors from '../../vectors/iss-municipal.official.json';

describe('ISS municipal — official golden vectors', () => {
  it('resolves São Paulo with municipal legislation URL and warning', () => {
    const result = getIssMunicipalPorIbge(vectors.golden.saoPaulo.codigoIbge);
    expect(result).toBeDefined();
    if (result === undefined) {
      return;
    }
    expect(result.nome).toBe('São Paulo');
    expect(result.uf).toBe('SP');
    expect(result.aliquotaMin).toBe(vectors.golden.saoPaulo.aliquotaMin);
    expect(result.aliquotaMax).toBe(vectors.golden.saoPaulo.aliquotaMax);
    expect(result.leiUrl).toContain(vectors.golden.saoPaulo.leiUrlContains);
    expect(result.estimativa).toBe(false);
    expect(result.fonte).toBe(vectors.golden.saoPaulo.fonte);
    expect(result.warning).toBe(ISS_MUNICIPAL_ESTIMATION_WARNING);
  });

  it('resolves Rio de Janeiro and Belo Horizonte golden rows', () => {
    const rio = getIssMunicipalPorIbge(vectors.golden.rioDeJaneiro.codigoIbge);
    expect(rio?.uf).toBe('RJ');
    expect(rio?.leiUrl).toContain(vectors.golden.rioDeJaneiro.leiUrlContains);

    const bh = getIssMunicipalPorIbge(vectors.golden.beloHorizonte.codigoIbge);
    expect(bh?.uf).toBe('MG');
    expect(bh?.leiUrl).toContain(vectors.golden.beloHorizonte.leiUrlContains);
  });

  it('resolves Campinas as high-PIB official row (municipal legislation)', () => {
    const campinas = getIssMunicipalPorIbge(vectors.golden.campinas.codigoIbge);
    expect(campinas?.nome).toBe('Campinas');
    expect(campinas?.uf).toBe('SP');
    expect(campinas?.aliquotaMin).toBe(vectors.golden.campinas.aliquotaMin);
    expect(campinas?.aliquotaMax).toBe(vectors.golden.campinas.aliquotaMax);
    expect(campinas?.estimativa).toBe(vectors.golden.campinas.estimativa);
    expect(campinas?.fonte).toBe(vectors.golden.campinas.fonte);
    expect(campinas?.leiUrl).toContain(vectors.golden.campinas.leiUrlContains);
  });

  it('resolves Barueri with municipal portal citation', () => {
    const barueri = getIssMunicipalPorIbge(vectors.golden.barueri.codigoIbge);
    expect(barueri?.nome).toBe('Barueri');
    expect(barueri?.uf).toBe('SP');
    expect(barueri?.aliquotaMin).toBe(vectors.golden.barueri.aliquotaMin);
    expect(barueri?.aliquotaMax).toBe(vectors.golden.barueri.aliquotaMax);
    expect(barueri?.estimativa).toBe(vectors.golden.barueri.estimativa);
    expect(barueri?.fonte).toBe(vectors.golden.barueri.fonte);
    expect(barueri?.leiUrl).toContain(vectors.golden.barueri.leiUrlContains);
  });

  it('resolves Pato Branco with SAPL-published municipal table', () => {
    const patoBranco = getIssMunicipalPorIbge(vectors.golden.patoBranco.codigoIbge);
    expect(patoBranco?.nome).toBe('Pato Branco');
    expect(patoBranco?.uf).toBe('PR');
    expect(patoBranco?.aliquotaMin).toBe(vectors.golden.patoBranco.aliquotaMin);
    expect(patoBranco?.aliquotaMax).toBe(vectors.golden.patoBranco.aliquotaMax);
    expect(patoBranco?.estimativa).toBe(vectors.golden.patoBranco.estimativa);
    expect(patoBranco?.fonte).toBe(vectors.golden.patoBranco.fonte);
    expect(patoBranco?.leiUrl).toContain(vectors.golden.patoBranco.leiUrlContains);
  });

  it('resolves Querência with NFSe-registered max-refined band', () => {
    const querencia = getIssMunicipalPorIbge(vectors.golden.querencia.codigoIbge);
    expect(querencia?.nome).toBe('Querência');
    expect(querencia?.uf).toBe('MT');
    expect(querencia?.aliquotaMin).toBe(vectors.golden.querencia.aliquotaMin);
    expect(querencia?.aliquotaMax).toBe(vectors.golden.querencia.aliquotaMax);
    expect(querencia?.estimativa).toBe(vectors.golden.querencia.estimativa);
    expect(querencia?.fonte).toBe(vectors.golden.querencia.fonte);
    expect(querencia?.leiUrl).toContain(vectors.golden.querencia.leiUrlContains);
  });

  it('resolves São Gonçalo with NFSe-registered refined band', () => {
    const saoGoncalo = getIssMunicipalPorIbge(vectors.golden.saoGoncalo.codigoIbge);
    expect(saoGoncalo?.nome).toBe('São Gonçalo');
    expect(saoGoncalo?.uf).toBe('RJ');
    expect(saoGoncalo?.aliquotaMin).toBe(vectors.golden.saoGoncalo.aliquotaMin);
    expect(saoGoncalo?.aliquotaMax).toBe(vectors.golden.saoGoncalo.aliquotaMax);
    expect(saoGoncalo?.estimativa).toBe(vectors.golden.saoGoncalo.estimativa);
    expect(saoGoncalo?.fonte).toBe(vectors.golden.saoGoncalo.fonte);
    expect(saoGoncalo?.leiUrl).toContain(vectors.golden.saoGoncalo.leiUrlContains);
  });

  it('looks up by UF and municipality name with accent-insensitive match', () => {
    const result = getIssMunicipalPorUfMunicipio('sp', 'sao paulo');
    expect(result?.codigoIbge).toBe(ISS_MUNICIPAL_GOLDEN_SAO_PAULO);
  });

  it('returns undefined for unknown IBGE code or invalid input', () => {
    expect(getIssMunicipalPorIbge(vectors.negative.notFoundIbge)).toBeUndefined();
    expect(getIssMunicipalPorIbge(vectors.negative.invalidIbge)).toBeUndefined();
    expect(getIssMunicipalPorIbge('')).toBeUndefined();
    expect(getIssMunicipalPorIbge(0)).toBeUndefined();
    expect(getIssMunicipalPorIbge(-1)).toBeUndefined();
  });

  it('returns undefined for unknown UF/nome pair or invalid UF', () => {
    expect(
      getIssMunicipalPorUfMunicipio(
        vectors.negative.unknownUfNome.uf,
        vectors.negative.unknownUfNome.nome,
      ),
    ).toBeUndefined();
    expect(getIssMunicipalPorUfMunicipio('', 'São Paulo')).toBeUndefined();
    expect(getIssMunicipalPorUfMunicipio('SP', '')).toBeUndefined();
  });

  it('searches by municipality name fragment and IBGE code', () => {
    const byName = searchIssMunicipal('campinas', { limit: 3 });
    expect(byName.length).toBeGreaterThan(0);
    expect(byName[0]?.warning).toBe(ISS_MUNICIPAL_ESTIMATION_WARNING);

    const byIbge = searchIssMunicipal(String(ISS_MUNICIPAL_GOLDEN_RIO));
    expect(byIbge.some((row) => row.codigoIbge === ISS_MUNICIPAL_GOLDEN_RIO)).toBe(true);

    const byUf = searchIssMunicipal('sp', { limit: 1 });
    expect(byUf).toHaveLength(1);

    expect(searchIssMunicipal(vectors.negative.searchNoMatch)).toEqual([]);
    expect(searchIssMunicipal('')).toEqual([]);
  });

  it('filters search results by UF using golden vector', () => {
    const match = searchIssMunicipal(vectors.ufFilter.query, {
      uf: vectors.ufFilter.uf,
      limit: 5,
    });
    expect(match.some((row) => row.codigoIbge === vectors.ufFilter.expectCodigoIbge)).toBe(true);
    expect(match.every((row) => row.uf === vectors.ufFilter.uf)).toBe(true);

    expect(
      searchIssMunicipal(vectors.searchWithUfNoMatch.query, {
        uf: vectors.searchWithUfNoMatch.uf,
      }),
    ).toEqual([]);
    expect(searchIssMunicipal('campinas', { uf: vectors.ufListFilter.invalid })).toEqual([]);
    expect(searchIssMunicipal('campinas', { uf: '' })).toEqual([]);
  });

  it('lists embedded municipalities per UF and exposes available UFs', () => {
    const spRows = getIssMunicipalPorUf(vectors.ufListFilter.sp);
    expect(spRows.length).toBeGreaterThan(0);
    expect(spRows.every((row) => row.uf === 'SP')).toBe(true);
    expect(spRows.some((row) => row.codigoIbge === ISS_MUNICIPAL_GOLDEN_SAO_PAULO)).toBe(true);

    const ufs = getIssMunicipalUfsDisponiveis();
    expect(ufs).toContain('SP');
    expect(ufs).toEqual([...ufs].sort((left, right) => left.localeCompare(right, 'pt-BR')));
    expect(getIssMunicipalPorUf('')).toEqual([]);
    expect(getIssMunicipalPorUf(vectors.ufListFilter.invalid)).toEqual([]);
    expect(getIssMunicipalPorUf('ZZ')).toEqual([]);

    const totalByUf = ufs.reduce((sum, uf) => sum + getIssMunicipalPorUf(uf).length, 0);
    expect(totalByUf).toBe(ISS_MUNICIPAL_TARGET_COUNT);
  });
});

describe('ISS municipal — embed policy', () => {
  it('embeds exactly 500 municipalities including all 27 capitals', () => {
    const rows = getAllIssMunicipal();
    expect(rows.length).toBe(ISS_MUNICIPAL_TARGET_COUNT);
    expect(rows.length).toBe(vectors.targetCount);

    const capitalRows = rows.filter((row) =>
      ISS_MUNICIPAL_CAPITAL_IBGE_CODES.includes(row.codigoIbge),
    );
    expect(capitalRows.length).toBe(ISS_MUNICIPAL_CAPITAL_COUNT);
    expect(capitalRows.length).toBe(vectors.capitalCount);

    const officialRows = rows.filter((row) => !row.estimativa);
    expect(officialRows.length).toBe(vectors.officialCount);
  });

  it('keeps alíquota bands within LC 116 Art. 8 limits', () => {
    for (const row of getAllIssMunicipal()) {
      expect(row.aliquotaMin).toBeGreaterThanOrEqual(ISS_MUNICIPAL_LC116_MIN);
      expect(row.aliquotaMax).toBeLessThanOrEqual(ISS_MUNICIPAL_LC116_MAX);
      expect(row.aliquotaMin).toBeLessThanOrEqual(row.aliquotaMax);
      expect(row.leiUrl.startsWith('https://')).toBe(true);
      expect(row.capturadoEm.length).toBeGreaterThan(0);
    }
  });

  it('exposes dataset metadata with manual refresh and estimativa flag', () => {
    expect(ISS_MUNICIPAL_DATA_VERSION.id).toBe('iss-municipal');
    expect(ISS_MUNICIPAL_DATA_VERSION.verificacao.agendamento).toBe('manual');
    expect(ISS_MUNICIPAL_DATA_VERSION.estimativa).toBe(true);
    expect(ISS_MUNICIPAL_DATA_VERSION.contagens.municipios).toBe(ISS_MUNICIPAL_TARGET_COUNT);
  });

  it('buildIssMunicipalResult attaches fonte and warning', () => {
    const oficialRow = getAllIssMunicipal().find((row) => !row.estimativa);
    const estimativaRow = getAllIssMunicipal().find((row) => row.estimativa);
    expect(oficialRow).toBeDefined();
    expect(estimativaRow).toBeDefined();
    if (oficialRow === undefined || estimativaRow === undefined) {
      return;
    }
    expect(buildIssMunicipalResult(oficialRow).fonte).toBe('oficial');
    expect(buildIssMunicipalResult(estimativaRow).fonte).toBe('estimativa');
    expect(buildIssMunicipalResult(oficialRow).warning).toBe(ISS_MUNICIPAL_ESTIMATION_WARNING);
  });

  it('buildIssMunicIbgeResult and buildLc116EstimativaResult attach fonte tiers', () => {
    const municRow = getAllIssMunicIbge().find((row) => row.codigoIbge === ISS_MUNIC_GOLDEN_ACRELANDIA);
    expect(municRow).toBeDefined();
    if (municRow === undefined) {
      return;
    }
    expect(buildIssMunicIbgeResult(municRow).fonte).toBe('munic-ibge');
    expect(buildLc116EstimativaResult({
      codigoIbge: municRow.codigoIbge,
      nome: municRow.nome,
      uf: municRow.uf,
      aliquotaMin: ISS_MUNICIPAL_LC116_MIN,
      aliquotaMax: ISS_MUNICIPAL_LC116_MAX,
      leiUrl: PLANALTO_LC116_ART8_URL,
      capturadoEm: ISS_MUNICIPAL_DATA_VERSION.capturadoEm,
    }).fonte).toBe('estimativa');
  });

  it('resolveIssMunicipalFonte mirrors estimativa flag', () => {
    expect(resolveIssMunicipalFonte(false)).toBe('oficial');
    expect(resolveIssMunicipalFonte(true)).toBe('estimativa');
  });
});

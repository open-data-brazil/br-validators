import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  BCB_SELIC_DATASET_URL,
  BCB_SELIC_SGS_API_URL,
  SELIC_DATA_VERSION,
  SELIC_STALE_WARNING,
  buildSelicMetaResult,
  getBrazilTodayIso,
  getSelicHistorico,
  getSelicList,
  getSelicMeta,
  getSelicMetaPorData,
  isSelicMetaStale,
  pickLatestSelicMeta,
  subtractBusinessDays,
} from '../../../src/selic/index.js';
import vectors from '../../vectors/selic.official.json';

describe('SELIC — official golden vectors', () => {
  const historical = vectors.golden.historicoRange;

  it('resolves latest meta Selic', () => {
    const meta = getSelicMeta({ asOfDate: vectors.staleness.asOfFresh });
    expect(meta?.data).toBe(vectors.golden.ultimaMeta.data);
    expect(meta?.valor).toBe(vectors.golden.ultimaMeta.valor);
    expect(meta?.dataReferencia).toBe(vectors.golden.ultimaMeta.data);
    expect(meta?.isStale).toBe(false);
    expect(meta?.warning).toBeUndefined();
  });

  it('resolves an embedded historical observation', () => {
    const meta = getSelicMetaPorData(historical.middle.data, {
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(meta?.data).toBe(historical.middle.data);
    expect(meta?.valor).toBe(historical.middle.valor);
    expect(meta?.isStale).toBe(true);
    expect(meta?.warning).toBe(SELIC_STALE_WARNING);
  });

  it('resolves the first observation in the embedded historical range', () => {
    const meta = getSelicMetaPorData(historical.from.data, {
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(meta?.data).toBe(historical.from.data);
    expect(meta?.valor).toBe(historical.from.valor);
    expect(meta?.isStale).toBe(true);
  });

  it('resolves historical date using Bacen MM-DD-YYYY format', () => {
    const [year, month, day] = historical.middle.data.split('-');
    const meta = getSelicMetaPorData(`${month}-${day}-${year}`, {
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(meta?.data).toBe(historical.middle.data);
    expect(meta?.valor).toBe(historical.middle.valor);
  });

  it('resolves historical date using DD/MM/YYYY slash format', () => {
    const [year, month, day] = historical.middle.data.split('-');
    const meta = getSelicMetaPorData(`${day}/${month}/${year}`, {
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(meta?.data).toBe(historical.middle.data);
    expect(meta?.valor).toBe(historical.middle.valor);
  });

  it('returns historico range inclusive', () => {
    const historico = getSelicHistorico({ from: historical.from.data, to: historical.to.data });
    expect(historico.length).toBe(3);
    expect(historico[0]).toEqual(historical.from);
    expect(historico[1]).toEqual(historical.middle);
    expect(historico[2]).toEqual(historical.to);

    const filteredHistorico = getSelicHistorico({
      from: historical.middle.data,
      to: historical.to.data,
    });
    expect(filteredHistorico).toEqual([historical.middle, historical.to]);
  });

  it('returns undefined or empty for invalid inputs', () => {
    expect(getSelicMetaPorData(vectors.negative.unknownDate)).toBeUndefined();
    expect(getSelicMetaPorData(vectors.negative.invalidDate)).toBeUndefined();
    expect(getSelicHistorico({ from: '2026-06-20', to: '2026-06-17' })).toEqual([]);
    expect(getSelicHistorico({ from: vectors.negative.invalidDate })).toEqual([]);
    expect(getSelicHistorico({ to: vectors.negative.invalidDate })).toEqual([]);
  });
});

describe('SELIC — staleness vectors', () => {
  it('marks latest observation as fresh on capture day', () => {
    const meta = getSelicMeta({ asOfDate: vectors.staleness.asOfFresh });
    expect(meta?.dataReferencia).toBe(vectors.staleness.freshReferenceDate);
    expect(meta?.isStale).toBe(false);
  });

  it('marks older observation as stale with adapter warning', () => {
    const meta = getSelicMetaPorData(vectors.staleness.staleReferenceDate, {
      asOfDate: vectors.staleness.asOfFresh,
    });
    expect(meta?.isStale).toBe(true);
    expect(meta?.warning).toBe(vectors.staleness.staleWarning);
    expect(meta?.warning).toBe(SELIC_STALE_WARNING);
  });

  it('aligns dataReferencia with SELIC_DATA_VERSION.capturadoEm calendar day', () => {
    expect(SELIC_DATA_VERSION.capturadoEm).toBe(vectors.staleness.capturadoEm);
  });
});

describe('SELIC — staleness helpers', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves Brazil local today via America/Sao_Paulo', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-26T15:00:00.000Z'));
    expect(getBrazilTodayIso()).toBe('2026-06-26');
  });

  it('subtracts business days skipping weekends', () => {
    expect(subtractBusinessDays('2026-06-26', 1)).toBe('2026-06-25');
    expect(subtractBusinessDays('2026-06-23', 1)).toBe('2026-06-22');
  });

  it('returns input unchanged when businessDays is below 1', () => {
    expect(subtractBusinessDays('2026-06-26', 0)).toBe('2026-06-26');
  });

  it('returns empty string for invalid subtractBusinessDays anchor', () => {
    expect(subtractBusinessDays('bad-date', 1)).toBe('');
  });

  it('returns false for invalid dates in isSelicMetaStale', () => {
    expect(isSelicMetaStale('bad', '2026-06-26')).toBe(false);
    expect(isSelicMetaStale('2026-06-26', 'bad')).toBe(false);
  });

  it('treats invalid calendar date as non-business day', async () => {
    const { isDiaUtil } = await import('../../../src/selic/staleness.js');
    expect(isDiaUtil('not-a-date')).toBe(false);
  });

  it('buildSelicMetaResult attaches warning only when stale', () => {
    const fresh = buildSelicMetaResult(
      { data: '2026-06-26', valor: 14.25 },
      { asOfDate: '2026-06-26' },
    );
    expect(fresh.isStale).toBe(false);
    expect(fresh.warning).toBeUndefined();

    const stale = buildSelicMetaResult(
      { data: '2026-06-24', valor: 14.25 },
      { asOfDate: '2026-06-26' },
    );
    expect(stale.isStale).toBe(true);
    expect(stale.warning).toBe(SELIC_STALE_WARNING);
  });

  it('defaults asOfDate to Brazil local today when omitted', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-26T15:00:00.000Z'));
    const result = buildSelicMetaResult({ data: '2026-06-26', valor: 14.25 });
    expect(result.isStale).toBe(false);
    vi.useRealTimers();
  });
});

describe('SELIC — embed metadata', () => {
  it('lists 90 observations in rolling window', () => {
    const list = getSelicList();
    expect(list.length).toBeGreaterThanOrEqual(vectors.minRecords);
    expect(list.length).toBeLessThanOrEqual(vectors.maxRecords);
    expect(pickLatestSelicMeta(list)?.data).toBe(vectors.golden.ultimaMeta.data);
  });

  it('exposes BCB sources in metadata', () => {
    expect(SELIC_DATA_VERSION.id).toBe('selic');
    expect(SELIC_DATA_VERSION.endpoints).toContain(BCB_SELIC_DATASET_URL);
    expect(SELIC_DATA_VERSION.endpoints).toContain(BCB_SELIC_SGS_API_URL);
    expect(SELIC_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(SELIC_DATA_VERSION.contagens.observacoes).toBe(90);
    expect(SELIC_DATA_VERSION.verificacao.agendamento).toBe('diario');
  });

  it('returns open-ended historico when range bounds omitted', () => {
    const all = getSelicHistorico({});
    expect(all.length).toBe(getSelicList().length);
    expect(all[0]?.data).toBe(vectors.golden.inicioJanela.data);
  });

  it('returns empty list when pickLatest receives no items', () => {
    expect(pickLatestSelicMeta([])).toBeUndefined();
  });
});

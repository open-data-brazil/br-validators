import { describe, expect, it } from 'vitest';

import {
  CONSCIENCIA_NEGRA_MIN_YEAR,
  FERIADOS_DATA_VERSION,
  FERIADOS_FIXED_COUNT,
  FERIADOS_LEI_14759_URL,
  FERIADOS_LEI_662_URL,
  FERIADOS_MOVABLE_COUNT,
  easterSunday,
  getFeriadosNacionais,
  getFixedHolidaysForYear,
  getMovableHolidaysForYear,
  getProximoDiaUtil,
  isFeriadoNacional,
} from '../../../src/feriados/index.js';
import { formatIsoDate, parseIsoDateString } from '../../../src/feriados/date-utils.js';
import vectors from '../../vectors/feriados.official.json';

describe('Feriados — Easter golden dates (Meeus/Jones/Butcher)', () => {
  it('matches official Easter Sunday for 2024 leap year', () => {
    const easter = easterSunday(2024);
    expect(formatIsoDate(easter)).toBe(vectors.easterSunday['2024']);
  });

  it('matches official Easter Sunday for 2025–2027', () => {
    const years = [2025, 2026, 2027] as const;
    for (const year of years) {
      const easter = easterSunday(year);
      expect(formatIsoDate(easter)).toBe(vectors.easterSunday[year]);
    }
  });
});

describe('Feriados — movable holidays golden tables', () => {
  it('resolves 2025 movable dates', () => {
    const movable = getMovableHolidaysForYear(2025);
    expect(movable.find((h) => h.nome === 'Carnaval')?.data).toBe(vectors.movable2025.carnaval);
    expect(movable.find((h) => h.nome === 'Sexta-feira Santa')?.data).toBe(vectors.movable2025.sextaSanta);
    expect(movable.find((h) => h.nome === 'Corpus Christi')?.data).toBe(vectors.movable2025.corpusChristi);
  });

  it('resolves 2026 movable dates', () => {
    const movable = getMovableHolidaysForYear(2026);
    expect(movable.find((h) => h.nome === 'Carnaval')?.data).toBe(vectors.movable2026.carnaval);
    expect(movable.find((h) => h.nome === 'Sexta-feira Santa')?.data).toBe(vectors.movable2026.sextaSanta);
    expect(movable.find((h) => h.nome === 'Corpus Christi')?.data).toBe(vectors.movable2026.corpusChristi);
  });

  it('resolves 2027 movable dates', () => {
    const movable = getMovableHolidaysForYear(2027);
    expect(movable.find((h) => h.nome === 'Carnaval')?.data).toBe(vectors.movable2027.carnaval);
    expect(movable.find((h) => h.nome === 'Sexta-feira Santa')?.data).toBe(vectors.movable2027.sextaSanta);
    expect(movable.find((h) => h.nome === 'Corpus Christi')?.data).toBe(vectors.movable2027.corpusChristi);
  });
});

describe('Feriados — fixed national holidays (Lei 662/1949 + amendments)', () => {
  it('marks every fixed 2025 date as national holiday', () => {
    for (const holiday of vectors.fixed2025) {
      expect(isFeriadoNacional(holiday.data)).toBe(true);
      const list = getFeriadosNacionais(2025);
      expect(list.some((item) => item.data === holiday.data && item.nome === holiday.nome)).toBe(true);
    }
  });

  it('returns false for a regular weekday', () => {
    expect(isFeriadoNacional(vectors.notHoliday)).toBe(false);
  });

  it('excludes Consciência Negra before Lei 14.759/2023 effective year', () => {
    expect(isFeriadoNacional(vectors.conscienciaNegraBeforeLaw.data)).toBe(
      vectors.conscienciaNegraBeforeLaw.expected,
    );
    expect(CONSCIENCIA_NEGRA_MIN_YEAR).toBe(2024);
  });

  it('lists nine fixed templates per year from 2024 onward', () => {
    expect(getFixedHolidaysForYear(2025)).toHaveLength(FERIADOS_FIXED_COUNT);
    expect(getFixedHolidaysForYear(2023)).toHaveLength(FERIADOS_FIXED_COUNT - 1);
  });
});

describe('Feriados — public API', () => {
  it('accepts Date input using UTC parts', () => {
    const date = new Date(Date.UTC(2025, 10, 15));
    expect(isFeriadoNacional(date)).toBe(true);
  });

  it('returns false for invalid ISO strings', () => {
    expect(isFeriadoNacional('2025-13-01')).toBe(false);
    expect(isFeriadoNacional('invalid')).toBe(false);
    expect(isFeriadoNacional('')).toBe(false);
    expect(isFeriadoNacional(new Date(Number.NaN))).toBe(false);
  });

  it('returns empty string for invalid getProximoDiaUtil input', () => {
    expect(getProximoDiaUtil('not-a-date')).toBe('');
  });

  it('skips Christmas and weekends for próximo dia útil', () => {
    expect(getProximoDiaUtil(vectors.proximoDiaUtil.from)).toBe(vectors.proximoDiaUtil.expected);
    expect(getProximoDiaUtil('2025-12-24')).toBe('2025-12-26');
    expect(getProximoDiaUtil('2026-01-09')).toBe('2026-01-12');
  });

  it('returns sorted national holidays for a year', () => {
    const holidays = getFeriadosNacionais(2025);
    expect(holidays.length).toBe(FERIADOS_FIXED_COUNT + FERIADOS_MOVABLE_COUNT);
    const dates = holidays.map((holiday) => holiday.data);
    expect([...dates].sort()).toEqual(dates);
  });

  it('returns empty list for non-integer year', () => {
    expect(getFeriadosNacionais(2025.5)).toEqual([]);
  });
});

describe('Feriados — transparency metadata', () => {
  it('exposes legal source URLs and catalog counts', () => {
    expect(FERIADOS_DATA_VERSION.id).toBe('feriados');
    expect(FERIADOS_DATA_VERSION.endpoints).toContain(FERIADOS_LEI_662_URL);
    expect(FERIADOS_DATA_VERSION.endpoints).toContain(FERIADOS_LEI_14759_URL);
    expect(FERIADOS_LEI_14759_URL).toBe(vectors.lei14759Url);
    expect(FERIADOS_DATA_VERSION.endpoints).toContain(vectors.source);
    expect(FERIADOS_DATA_VERSION.contagens.fixos).toBe(FERIADOS_FIXED_COUNT);
    expect(FERIADOS_DATA_VERSION.contagens.moveis).toBe(FERIADOS_MOVABLE_COUNT);
    expect(getMovableHolidaysForYear(2025)).toHaveLength(FERIADOS_MOVABLE_COUNT);
  });
});

describe('Feriados — date utils coverage', () => {
  it('rejects invalid calendar dates in ISO parser', () => {
    expect(parseIsoDateString('2025-02-30')).toBeNull();
  });
});

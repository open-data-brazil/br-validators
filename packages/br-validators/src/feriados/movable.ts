/**
 * Movable national holidays — offsets from Easter Sunday (Computus / Meeus–Jones–Butcher).
 * @see https://www.planalto.gov.br/ccivil_03/leis/l0662.htm
 */

import { addUtcDays, formatIsoDate } from './date-utils.js';
import type { FeriadoNacional, ParsedUtcDate } from './types.js';

export const CARNIVAL_OFFSET_DAYS = -47;
export const GOOD_FRIDAY_OFFSET_DAYS = -2;
export const CORPUS_CHRISTI_OFFSET_DAYS = 60;

interface MovableHolidayTemplate {
  offsetDays: number;
  nome: string;
}

const MOVABLE_HOLIDAY_TEMPLATES: readonly MovableHolidayTemplate[] = [
  { offsetDays: CARNIVAL_OFFSET_DAYS, nome: 'Carnaval' },
  { offsetDays: GOOD_FRIDAY_OFFSET_DAYS, nome: 'Sexta-feira Santa' },
  { offsetDays: CORPUS_CHRISTI_OFFSET_DAYS, nome: 'Corpus Christi' },
];

/**
 * Easter Sunday — Meeus/Jones/Butcher Gregorian algorithm.
 */
export function easterSunday(year: number): ParsedUtcDate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

export function getMovableHolidaysForYear(year: number): FeriadoNacional[] {
  const easter = easterSunday(year);
  return MOVABLE_HOLIDAY_TEMPLATES.map((template) => {
    const parts = addUtcDays(easter, template.offsetDays);
    return {
      data: formatIsoDate(parts),
      nome: template.nome,
      tipo: 'movel' as const,
      baseLegal: 'Lei 662/1949',
    };
  });
}

export function isMovableHoliday(parts: ParsedUtcDate): boolean {
  return getMovableHolidaysForYear(parts.year).some((holiday) => holiday.data === formatIsoDate(parts));
}

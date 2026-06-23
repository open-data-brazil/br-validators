/**
 * Brazilian national public holidays — offline calendar logic.
 * @see https://www.planalto.gov.br/ccivil_03/leis/l0662.htm
 */

import {
  addUtcDays,
  formatIsoDate,
  isWeekendUtc,
  parseDateInput,
} from './date-utils.js';
import { getFixedHolidaysForYear, isFixedHoliday } from './fixed.js';
import { getMovableHolidaysForYear, isMovableHoliday } from './movable.js';
import type { FeriadoNacional } from './types.js';

export function isFeriadoNacional(input: string | Date): boolean {
  const parts = parseDateInput(input);
  if (parts === null) {
    return false;
  }
  return isFixedHoliday(parts) || isMovableHoliday(parts);
}

export function getFeriadosNacionais(year: number): readonly FeriadoNacional[] {
  if (!Number.isInteger(year)) {
    return [];
  }
  const holidays = [...getFixedHolidaysForYear(year), ...getMovableHolidaysForYear(year)];
  return holidays.sort((left, right) => left.data.localeCompare(right.data));
}

export function getProximoDiaUtil(input: string | Date): string {
  const parts = parseDateInput(input);
  if (parts === null) {
    return '';
  }

  let cursor = addUtcDays(parts, 1);
  while (isWeekendUtc(cursor) || isFeriadoNacional(formatIsoDate(cursor))) {
    cursor = addUtcDays(cursor, 1);
  }
  return formatIsoDate(cursor);
}

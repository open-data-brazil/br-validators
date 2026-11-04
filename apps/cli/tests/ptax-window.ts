/**
 * PTAX embeds a rolling 90-business-day window that the daily bot refreshes, so
 * CLI tests must take their dates from the embedded data — fixed dates fall out
 * of the window and break the data refresh (see the core PTAX tests).
 */
import { getPtaxCotacoesPorMoeda } from '@br-validators/core/ptax';

const usdDates = getPtaxCotacoesPorMoeda('USD')
  .map((row) => row.data)
  .sort();

export const PTAX_USD_OLDEST = usdDates[0];
export const PTAX_USD_SECOND_OLDEST = usdDates[1];
export const PTAX_USD_LATEST = usdDates[usdDates.length - 1];
/** Afternoon (Brasília) of the newest embedded quote: latest is fresh, oldest is stale. */
export const PTAX_AS_OF_LATEST = new Date(`${PTAX_USD_LATEST}T15:00:00.000Z`);

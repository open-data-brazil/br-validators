/**
 * Discover ANP LPC weekly summary XLSX URLs from the official listing page HTML.
 */

export const ANP_LPC_LISTING_URL =
  'https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/levantamento-de-precos-de-combustiveis-ultimas-semanas-pesquisadas';

export interface AnpSurveyWeekLink {
  inicio: string;
  fim: string;
  url: string;
  fileName: string;
}

const ABSOLUTE_URL_PATTERN =
  /https?:\/\/www\.gov\.br\/anp\/pt-br\/assuntos\/precos-e-defesa-da-concorrencia\/precos\/arquivos-lpc\/\d{4}\/resumo_semanal_lpc_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}\.xlsx/gi;

function parseFileName(fileName: string): { inicio: string; fim: string } | null {
  const match = /^resumo_semanal_lpc_(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})\.xlsx$/i.exec(fileName);
  if (match === null) {
    return null;
  }
  return { inicio: match[1], fim: match[2] };
}

export function extractAnpSummaryLinksFromHtml(html: string): AnpSurveyWeekLink[] {
  const byUrl = new Map<string, AnpSurveyWeekLink>();

  for (const url of html.match(ABSOLUTE_URL_PATTERN) ?? []) {
    const fileName = url.split('/').pop() ?? '';
    const dates = parseFileName(fileName);
    if (dates === null) {
      continue;
    }
    byUrl.set(url, { ...dates, url, fileName });
  }

  return [...byUrl.values()].sort((left, right) => right.inicio.localeCompare(left.inicio));
}

export function pickLatestAnpSummaryLink(links: readonly AnpSurveyWeekLink[]): AnpSurveyWeekLink | null {
  if (links.length === 0) {
    return null;
  }
  return [...links].sort((left, right) => right.inicio.localeCompare(left.inicio))[0] ?? null;
}

export function resolveAnpSummaryUrlFromHtml(html: string): AnpSurveyWeekLink | null {
  const links = extractAnpSummaryLinksFromHtml(html);
  return pickLatestAnpSummaryLink(links);
}

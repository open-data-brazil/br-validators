import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  ANP_LPC_LISTING_URL,
  extractAnpSummaryLinksFromHtml,
  pickLatestAnpSummaryLink,
  resolveAnpSummaryUrlFromHtml,
} from './anp-listing-scraper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_HTML = readFileSync(path.join(__dirname, '../fixtures/anp/listing-snippet.html'), 'utf8');

describe('anp-listing-scraper', () => {
  it('extracts resumo_semanal_lpc links from listing HTML', () => {
    const links = extractAnpSummaryLinksFromHtml(FIXTURE_HTML);
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links[0].fileName).toMatch(/^resumo_semanal_lpc_/);
    expect(links[0].url).toContain('arquivos-lpc/');
    expect(links[0].inicio).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('picks the latest survey week link', () => {
    const links = extractAnpSummaryLinksFromHtml(FIXTURE_HTML);
    const latest = pickLatestAnpSummaryLink(links);
    expect(latest?.inicio).toBe('2026-06-14');
    expect(latest?.fim).toBe('2026-06-20');
  });

  it('resolves latest summary URL from HTML fixture', () => {
    const latest = resolveAnpSummaryUrlFromHtml(FIXTURE_HTML);
    expect(latest?.url).toContain('resumo_semanal_lpc_2026-06-14_2026-06-20.xlsx');
    expect(ANP_LPC_LISTING_URL).toContain('gov.br/anp');
  });

  it('returns null when no links are present', () => {
    expect(extractAnpSummaryLinksFromHtml('<html></html>')).toEqual([]);
    expect(pickLatestAnpSummaryLink([])).toBeNull();
    expect(resolveAnpSummaryUrlFromHtml('<html></html>')).toBeNull();
  });
});

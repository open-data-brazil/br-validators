import { describe, expect, it } from 'vitest';

import { buildEmbeddedFallbackOutcome, buildFailureOutcome, FETCH_MAX_ATTEMPTS } from './source-fetch-outcome.js';
import { FetchError } from './fetch-utils.js';

describe('source-fetch-outcome', () => {
  it('builds blocked-network message for fetch failed errors', () => {
    const outcome = buildFailureOutcome(
      'cfop',
      ['https://www.confaz.fazenda.gov.br/x'],
      '2026-06-23',
      new FetchError('fetch failed', 'https://www.confaz.fazenda.gov.br/x'),
      FETCH_MAX_ATTEMPTS,
    );

    expect(outcome.status).toBe('source_blocked');
    expect(outcome.failureKind).toBe('source_blocked');
    expect(outcome.message).toContain('not link deprecation');
    expect(outcome.message).toContain('5 attempts');
  });

  it('builds link deprecation message for HTTP 404', () => {
    const outcome = buildFailureOutcome(
      'ibge',
      ['https://example.gov.br/data'],
      '2026-06-23',
      new FetchError('HTTP 404', 'https://example.gov.br/data', 404),
      FETCH_MAX_ATTEMPTS,
    );

    expect(outcome.status).toBe('source_unavailable');
    expect(outcome.failureKind).toBe('link_deprecated');
    expect(outcome.message).toContain('Possible link deprecation');
  });

  it('records attempted endpoints on IBPT-style failures', () => {
    const attempted = [
      'https://deolhonoimposto.ibpt.org.br/',
      'https://apidoni.ibpt.org.br/api/v1/produtos',
      'https://ibpt.valraw.com.br/api/meta.json',
    ];
    const outcome = buildFailureOutcome(
      'ibpt',
      ['https://deolhonoimposto.ibpt.org.br/'],
      '2026-06-26',
      new FetchError('HTTP 403 downloading https://ibpt.valraw.com.br/api/meta.json', 'https://ibpt.valraw.com.br/api/meta.json', 403),
      FETCH_MAX_ATTEMPTS,
      attempted,
    );

    expect(outcome.status).toBe('source_blocked');
    expect(outcome.endpoints).toEqual(attempted);
    expect(outcome.message).toContain('403');
  });

  it('builds embedded_retained outcome for fallback datasets', () => {
    const outcome = buildEmbeddedFallbackOutcome(
      'paises-bacen',
      ['http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=x'],
      '2026-06-20',
      FETCH_MAX_ATTEMPTS,
      'NF-e portal did not return a parseable country table (redirect loop).',
    );

    expect(outcome.status).toBe('embedded_retained');
    expect(outcome.message).toContain('Embedded data from 2026-06-20 retained');
    expect(outcome.message).toContain('redirect loop');
  });
});

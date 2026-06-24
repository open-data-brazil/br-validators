import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  discoverNfeConteudoUrls,
  fetchTextAspNetPortal,
  isHtmlPayload,
  NFE_PORTAL_ORIGIN,
  resolvePortalRedirect,
} from './fetch-nfe-portal.js';

describe('fetch-nfe-portal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves relative and absolute redirect locations', () => {
    const base = `${NFE_PORTAL_ORIGIN}/portal/exibirArquivo.aspx?conteudo=abc`;
    expect(resolvePortalRedirect(base, '/portal/login.aspx')).toBe(
      `${NFE_PORTAL_ORIGIN}/portal/login.aspx`,
    );
    expect(resolvePortalRedirect(base, 'https://other.gov.br/x')).toBe('https://other.gov.br/x');
  });

  it('detects HTML payloads', () => {
    expect(isHtmlPayload('<html><body>NF-e</body></html>')).toBe(true);
    expect(isHtmlPayload('<!DOCTYPE html><html></html>')).toBe(true);
    expect(isHtmlPayload('1058;BRASIL\n1059;ARGENTINA')).toBe(false);
  });

  it('discovers exibirArquivo conteudo URLs from portal HTML', () => {
    const html = `
      <a href="exibirArquivo.aspx?conteudo=ABC123%2B%3D">Paises</a>
      <a href="/portal/exibirArquivo.aspx?conteudo=XYZ789">Outro</a>
    `;
    const urls = discoverNfeConteudoUrls(html);
    expect(urls).toContain(`${NFE_PORTAL_ORIGIN}/portal/exibirArquivo.aspx?conteudo=ABC123%2B%3D`);
    expect(urls).toContain(`${NFE_PORTAL_ORIGIN}/portal/exibirArquivo.aspx?conteudo=XYZ789`);
  });

  it('follows manual redirects and forwards cookies', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        status: 302,
        ok: false,
        headers: {
          get: (name: string) => (name === 'location' ? '/portal/file.aspx?conteudo=x' : null),
          getSetCookie: () => ['ASP.NET_SessionId=abc123; path=/; HttpOnly'],
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: {
          get: () => null,
          getSetCookie: () => [],
        },
        text: () => Promise.resolve('1058;BRASIL'),
      });

    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchTextAspNetPortal(
      `${NFE_PORTAL_ORIGIN}/portal/exibirArquivo.aspx?conteudo=seed`,
    );

    expect(result.text).toBe('1058;BRASIL');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondCall = fetchMock.mock.calls[1] as [string, { headers: Record<string, string> }];
    expect(secondCall[1].headers.Cookie).toContain('ASP.NET_SessionId=abc123');
  });
});

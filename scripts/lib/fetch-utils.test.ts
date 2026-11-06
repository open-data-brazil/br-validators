import { describe, expect, it } from 'vitest';

import { CONNECT_BLOCKED_MAX_ATTEMPTS, FetchError, fetchWithRetry, isConnectBlocked } from './fetch-utils.js';

describe('fetchWithRetry', () => {
  it('stops early when the host drops connections (CI-blocked source)', async () => {
    let calls = 0;
    const blocked = new FetchError('fetch failed', 'https://servicodados.ibge.gov.br/x', undefined, 'UND_ERR_CONNECT_TIMEOUT');
    await expect(
      fetchWithRetry(
        () => {
          calls += 1;
          return Promise.reject(blocked);
        },
        5,
        0,
      ),
    ).rejects.toBe(blocked);
    expect(calls).toBe(CONNECT_BLOCKED_MAX_ATTEMPTS);
  });

  it('keeps the full retry budget for other failures', async () => {
    let calls = 0;
    await expect(
      fetchWithRetry(
        () => {
          calls += 1;
          return Promise.reject(new FetchError('HTTP 503', 'https://example.gov.br', 503));
        },
        5,
        0,
      ),
    ).rejects.toThrow('HTTP 503');
    expect(calls).toBe(5);
  });

  it('classifies only network-level connect errors as blocked', () => {
    expect(isConnectBlocked(new FetchError('x', 'u', undefined, 'ECONNREFUSED'))).toBe(true);
    expect(isConnectBlocked(new FetchError('x', 'u', 404))).toBe(false);
    expect(isConnectBlocked(new Error('x'))).toBe(false);
  });
});

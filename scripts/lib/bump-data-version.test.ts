import { describe, expect, it } from 'vitest';

import {
  bumpDataVersion,
  formatDataVersionLabel,
  parsePublishVersion,
} from './bump-data-version.js';

describe('parsePublishVersion', () => {
  it('parses human release', () => {
    expect(parsePublishVersion('1.8.3')).toEqual({
      major: 1,
      minor: 8,
      patch: 3,
      dataSeq: null,
    });
  });

  it('parses bot data release with zero-padded counter', () => {
    expect(parsePublishVersion('1.8.3-data.0001')).toEqual({
      major: 1,
      minor: 8,
      patch: 3,
      dataSeq: 1,
    });
  });

  it('rejects invalid semver', () => {
    expect(parsePublishVersion('1.8.0001')).toBeNull();
    expect(parsePublishVersion('v1.8.3')).toBeNull();
  });
});

describe('bumpDataVersion', () => {
  it('starts data line from human release', () => {
    expect(bumpDataVersion('1.8.3')).toBe('1.8.3-data.0001');
  });

  it('increments data counter without bumping human patch', () => {
    expect(bumpDataVersion('1.8.3-data.0001')).toBe('1.8.3-data.0002');
    expect(bumpDataVersion('1.8.3-data.0009')).toBe('1.8.3-data.0010');
  });

  it('resets counter after new human release', () => {
    expect(bumpDataVersion('1.8.4')).toBe('1.8.4-data.0001');
  });
});

describe('formatDataVersionLabel', () => {
  it('labels data builds', () => {
    expect(formatDataVersionLabel('1.8.3-data.0042')).toBe('1.8.3 data #0042');
  });

  it('passes through human versions', () => {
    expect(formatDataVersionLabel('1.8.3')).toBe('1.8.3');
  });
});

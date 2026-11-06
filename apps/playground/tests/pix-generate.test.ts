import { describe, expect, it } from 'vitest';
import { validatePixKey } from '@br-validators/core';
import { generatePixEvp } from '../lib/generators/pix';

describe('generatePixEvp', () => {
  it('is seed-reproducible', () => {
    const first = generatePixEvp(42);
    const second = generatePixEvp(42);
    expect(first).toBe(second);
    expect(validatePixKey(first).ok).toBe(true);
  });

  it('generates random key without seed', () => {
    const value = generatePixEvp();
    expect(validatePixKey(value).ok).toBe(true);
  });
});

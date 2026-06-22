import { describe, expect, it } from 'vitest';
import { createBrStringSchema, mapCanonicalValue } from '../src/create-schema.js';

describe('createBrStringSchema', () => {
  it('parses valid input via mapCanonicalValue', () => {
    const schema = createBrStringSchema(
      (input) => (input === 'ok' ? { ok: true, value: 'canonical' } : { ok: false, message: 'bad' }),
      mapCanonicalValue,
    );
    expect(schema.parse('ok')).toBe('canonical');
  });

  it('rejects invalid input with core message', () => {
    const schema = createBrStringSchema(
      (input) => (input === 'ok' ? { ok: true, value: 'x' } : { ok: false, message: 'custom failure' }),
      mapCanonicalValue,
    );
    const result = schema.safeParse('nope');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('custom failure');
    }
  });

  it('supports custom mapOutput', () => {
    const schema = createBrStringSchema(
      (input) => ({ ok: true, value: input, extra: 1 }),
      (success) => ({ canonical: success.value, extra: success.extra }),
    );
    expect(schema.parse('abc')).toEqual({ canonical: 'abc', extra: 1 });
  });
});

describe('mapCanonicalValue', () => {
  it('returns value field', () => {
    expect(mapCanonicalValue({ value: '123' })).toBe('123');
  });
});

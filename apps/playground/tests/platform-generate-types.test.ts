import { describe, expect, it } from 'vitest';
import { PLATFORM_GENERATABLE } from '../lib/platform-generate-types';

describe('platform-generate-types', () => {
  it('lists all core generatable document types including IE and titulo', () => {
    const values = PLATFORM_GENERATABLE.map((item) => item.value);
    expect(values).toContain('inscricao-estadual');
    expect(values).toContain('titulo-eleitor');
    expect(values).toContain('cartao-credito');
    expect(values).toHaveLength(17);
  });

  it('marks UF-dependent types', () => {
    const ie = PLATFORM_GENERATABLE.find((item) => item.value === 'inscricao-estadual');
    const titulo = PLATFORM_GENERATABLE.find((item) => item.value === 'titulo-eleitor');
    expect(ie?.ufSelector).toBe(true);
    expect(titulo?.ufSelector).toBe(true);
    expect(ie?.labelKey).toBe('inscricaoEstadual');
    expect(titulo?.labelKey).toBe('tituloEleitor');
  });
});

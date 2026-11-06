import { describe, expect, it } from 'vitest';

import { IE_SP_RURAL_GOLDEN_MASKED } from '@br-validators/core';
import { buildCliCommand, computeDocumentResults } from '../lib/document-results';
import { generateValidDocument, initialWorkspaceInput, supportsValidGeneration } from '../lib/playground-generate';

const ARRECADACAO_GOLDEN_MASKED = '84630000000 381234567890 612345678901 523456789012 9';

describe('boleto-arrecadacao workspace', () => {
  it('validates golden linha with segment metadata', () => {
    const results = computeDocumentResults('boleto-arrecadacao', ARRECADACAO_GOLDEN_MASKED);
    expect(results?.validationDetail.startsWith('yes')).toBe(true);
    expect(results?.extraRows.some((row) => row.label === 'Segment')).toBe(true);
    expect(results?.extraRows.some((row) => row.label === 'Value type')).toBe(true);
  });

  it('rejects invalid arrecadacao input', () => {
    const results = computeDocumentResults('boleto-arrecadacao', '123');
    expect(results?.validationDetail.startsWith('no —')).toBe(true);
  });

  it('builds working CLI hints', () => {
    const results = computeDocumentResults('boleto-arrecadacao', ARRECADACAO_GOLDEN_MASKED);
    const stripped = results?.stripped ?? '';
    expect(buildCliCommand('boleto-arrecadacao', 'validate', ARRECADACAO_GOLDEN_MASKED, stripped, 'SP')).toContain(
      'br-validators boleto validate',
    );
    expect(buildCliCommand('boleto-arrecadacao', 'strip', ARRECADACAO_GOLDEN_MASKED, stripped, 'SP')).toContain(
      'br-validators boleto strip',
    );
    expect(buildCliCommand('boleto-arrecadacao', 'sanitize', ARRECADACAO_GOLDEN_MASKED, stripped, 'SP')).toContain(
      '--type boleto',
    );
  });

  it('generates valid initial input', () => {
    expect(supportsValidGeneration('boleto-arrecadacao')).toBe(true);
    const input = initialWorkspaceInput('boleto-arrecadacao', 'SP');
    expect(computeDocumentResults('boleto-arrecadacao', input)?.validationDetail.startsWith('yes')).toBe(true);
    expect(generateValidDocument('boleto-arrecadacao', { masked: false, seed: 42 })).toHaveLength(48);
  });
});

describe('ie-produtor-rural workspace', () => {
  it('validates golden SP rural IE with kind metadata', () => {
    const results = computeDocumentResults('ie-produtor-rural', IE_SP_RURAL_GOLDEN_MASKED);
    expect(results?.validationDetail).toBe('yes (SP produtor rural)');
    expect(results?.extraRows.some((row) => row.label === 'Kind')).toBe(true);
    expect(results?.formattedValue.length).toBeGreaterThan(0);
  });

  it('rejects invalid rural IE input', () => {
    const results = computeDocumentResults('ie-produtor-rural', 'P000');
    expect(results?.validationDetail.startsWith('no —')).toBe(true);
  });

  it('builds working CLI hints with SP scope', () => {
    const results = computeDocumentResults('ie-produtor-rural', IE_SP_RURAL_GOLDEN_MASKED);
    const stripped = results?.stripped ?? '';
    expect(buildCliCommand('ie-produtor-rural', 'validate', IE_SP_RURAL_GOLDEN_MASKED, stripped, 'SP')).toBe(
      `br-validators ie validate ${stripped || '<value>'} --uf SP --json`,
    );
    expect(buildCliCommand('ie-produtor-rural', 'sanitize', IE_SP_RURAL_GOLDEN_MASKED, stripped, 'SP')).toContain(
      '--type inscricao-estadual-produtor-rural',
    );
  });

  it('generates valid initial input', () => {
    expect(supportsValidGeneration('ie-produtor-rural')).toBe(true);
    const input = initialWorkspaceInput('ie-produtor-rural', 'SP');
    expect(computeDocumentResults('ie-produtor-rural', input)?.validationDetail).toBe('yes (SP produtor rural)');
  });
});

import { describe, expect, it } from 'vitest';
import { pickRowFields } from '../lib/reference-data/dataset-adapter';
import { resolveBancoFromInput } from '../lib/reference-data/bancos-lookup';
import { getDatasetAdapter } from '../lib/reference-data/dataset-registry';
import {
  TXT_ROW_SEPARATOR,
  TXT_SECTION_SEPARATOR,
  buildExportFilename,
  formatTxtBundle,
  formatTxtRowBlock,
  formatTxtSection,
  formatTxtHeader,
  formatExportByteSize,
  getUtf8ByteLength,
  shouldShowExportSizeHint,
  TXT_EXPORT_SIZE_HINT_THRESHOLD_BYTES,
} from '../lib/reference-data/txt-export';

describe('txt-export', () => {
  const ncmAdapter = getDatasetAdapter('ncm');
  const sampleRow = {
    codigo: '1201.00.00',
    descricao: 'Soja, mesmo triturada',
  };

  it('formatTxtSection header contains dataset id and capturadoEm', () => {
    expect(ncmAdapter).toBeDefined();
    const section = formatTxtSection(ncmAdapter as NonNullable<typeof ncmAdapter>, [sampleRow], {
      mode: 'search-results',
      exportedAt: '2026-06-27T12:00:00.000Z',
      sourceUrl: 'https://example.com/ncm',
      query: 'soja',
    });

    expect(section).toContain('# @br-validators/core — dataset: ncm');
    expect(section).toContain(`# capturadoEm: ${ncmAdapter?.capturadoEm}`);
    expect(section).toContain('# rows: 1');
    expect(section).toContain('# query: soja');
    expect(section).toContain('# source: https://example.com/ncm');
    expect(section).toContain(TXT_SECTION_SEPARATOR);
  });

  it('formatTxtRowBlock preserves fieldKeys order', () => {
    expect(ncmAdapter).toBeDefined();
    const block = formatTxtRowBlock(sampleRow, ncmAdapter?.fieldKeys ?? []);
    expect(block).toBe('[codigo: 1201.00.00]\ndescricao: Soja, mesmo triturada');
  });

  it('formatTxtBundle joins sections with equals separator', () => {
    const ncm = getDatasetAdapter('ncm');
    const cfop = getDatasetAdapter('cfop');
    expect(ncm).toBeDefined();
    expect(cfop).toBeDefined();

    const bundle = formatTxtBundle([
      {
        adapter: ncm as NonNullable<typeof ncm>,
        rows: [sampleRow],
        meta: { mode: 'multi-dataset', exportedAt: '2026-06-27T12:00:00.000Z' },
      },
      {
        adapter: cfop as NonNullable<typeof cfop>,
        rows: [{ codigo: '5102', descricao: 'Venda mercadoria' }],
        meta: { mode: 'multi-dataset', exportedAt: '2026-06-27T12:00:00.000Z' },
      },
    ]);

    expect(bundle.split(TXT_SECTION_SEPARATOR).length).toBeGreaterThanOrEqual(3);
    expect(bundle).toContain('dataset: ncm');
    expect(bundle).toContain('dataset: cfop');
  });

  it('empty rows export header-only with rows: 0', () => {
    expect(ncmAdapter).toBeDefined();
    const section = formatTxtSection(ncmAdapter as NonNullable<typeof ncmAdapter>, [], {
      mode: 'single-dataset',
      exportedAt: '2026-06-27T12:00:00.000Z',
    });

    expect(section).toContain('# rows: 0');
    expect(section).not.toContain(TXT_ROW_SEPARATOR);
  });

  it('formatTxtHeader includes dataset scope metadata', () => {
    expect(ncmAdapter).toBeDefined();
    const header = formatTxtHeader(ncmAdapter as NonNullable<typeof ncmAdapter>, 1, {
      mode: 'single-dataset',
      uf: 'SP',
      year: 2025,
      moeda: 'USD',
      desde: '2026-01-01',
      ate: '2026-06-01',
    });
    expect(header).toContain('# uf: SP');
    expect(header).toContain('# year: 2025');
    expect(header).toContain('# moeda: USD');
    expect(header).toContain('# desde: 2026-01-01');
    expect(header).toContain('# ate: 2026-06-01');
  });

  it('formatTxtSection for bancos includes COMPE and ISPB fields', () => {
    const bancosAdapter = getDatasetAdapter('bancos');
    expect(bancosAdapter).toBeDefined();
    const banco = resolveBancoFromInput('001');
    expect(banco).toBeDefined();
    const section = formatTxtSection(bancosAdapter as NonNullable<typeof bancosAdapter>, [
      pickRowFields(banco as NonNullable<typeof banco>, [
        'codigo',
        'ispb',
        'nome',
        'nomeReduzido',
        'participaCompe',
      ]),
    ], {
      mode: 'search-results',
      query: '001',
    });

    expect(section).toContain('# @br-validators/core — dataset: bancos');
    expect(section).toContain('# query: 001');
    expect(section).toContain('[codigo: 001]');
    expect(section).toContain('ispb: 00000000');
    expect(section).toContain('participaCompe: true');
  });

  it('buildExportFilename follows id-date pattern', () => {
    const date = new Date('2026-06-27T15:00:00.000Z');
    expect(buildExportFilename('ncm', 'single-dataset', date)).toBe('ncm-2026-06-27.txt');
    expect(buildExportFilename('ncm', 'search-results', date)).toBe('search-2026-06-27.txt');
    expect(buildExportFilename('ncm-cfop', 'multi-dataset', date)).toBe('bundle-ncm-cfop-2026-06-27.txt');
  });

  it('getUtf8ByteLength counts UTF-8 bytes', () => {
    expect(getUtf8ByteLength('abc')).toBe(3);
    expect(getUtf8ByteLength('é')).toBe(2);
  });

  it('shouldShowExportSizeHint triggers above 1 MB', () => {
    expect(shouldShowExportSizeHint(TXT_EXPORT_SIZE_HINT_THRESHOLD_BYTES)).toBe(false);
    expect(shouldShowExportSizeHint(TXT_EXPORT_SIZE_HINT_THRESHOLD_BYTES + 1)).toBe(true);
  });

  it('formatExportByteSize renders readable units', () => {
    expect(formatExportByteSize(512)).toBe('512 B');
    expect(formatExportByteSize(2048)).toBe('2 KB');
    expect(formatExportByteSize(TXT_EXPORT_SIZE_HINT_THRESHOLD_BYTES + 100_000)).toBe('1.1 MB');
  });
});

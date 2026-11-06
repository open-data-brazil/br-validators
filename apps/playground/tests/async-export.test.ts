import { describe, expect, it } from 'vitest';
import { ExportCancelledError, formatTxtBodyAsync } from '../lib/reference-data/async-export';

describe('async-export', () => {
  it('formatTxtBodyAsync processes rows in order', async () => {
    const rows = [
      { codigo: '1', descricao: 'A' },
      { codigo: '2', descricao: 'B' },
    ];
    const body = await formatTxtBodyAsync(rows, ['codigo', 'descricao']);
    expect(body).toContain('[codigo: 1]');
    expect(body).toContain('[codigo: 2]');
  });

  it('formatTxtBodyAsync reports progress', async () => {
    const rows = Array.from({ length: 3 }, (_, index) => ({
      codigo: String(index),
      descricao: 'x',
    }));
    const progress: number[] = [];
    await formatTxtBodyAsync(rows, ['codigo', 'descricao'], {
      chunkSize: 2,
      onProgress: (state) => {
        progress.push(state.processedRows);
      },
    });
    expect(progress.length).toBeGreaterThan(0);
    expect(progress.at(-1)).toBe(3);
  });

  it('formatTxtBodyAsync throws ExportCancelledError when aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const rows = [{ codigo: '1', descricao: 'A' }];
    await expect(
      formatTxtBodyAsync(rows, ['codigo', 'descricao'], { signal: controller.signal }),
    ).rejects.toBeInstanceOf(ExportCancelledError);
  });
});

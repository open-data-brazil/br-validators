import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  assertAnpPrecosMediosBounds,
  buildAnpSemanasFromRecords,
  parseAnpResumoMunicipiosXlsx,
} from './anp-xlsx-parser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const FIXTURE_XLSX = path.join(__dirname, '../fixtures/anp/resumo_semanal_lpc_2026-06-07_2026-06-13.xlsx');
const ESTADOS = JSON.parse(
  readFileSync(path.join(ROOT, 'packages/br-validators/src/ibge/data/estados.json'), 'utf8'),
) as { sigla: string; nome: string }[];
const MUNICIPIOS = JSON.parse(
  readFileSync(path.join(ROOT, 'packages/br-validators/src/ibge/data/municipios.json'), 'utf8'),
) as { codigo: number; nome: string; uf: string }[];

describe('anp-xlsx-parser', () => {
  it('parses MUNICIPIOS sheet from official sample week', () => {
    const records = parseAnpResumoMunicipiosXlsx(FIXTURE_XLSX, ESTADOS, MUNICIPIOS);
    assertAnpPrecosMediosBounds(records.length);

    const adamantina = records.find(
      (record) =>
        record.municipioNome === 'ADAMANTINA' &&
        record.uf === 'SP' &&
        record.produto === 'ETHANOL',
    );
    expect(adamantina?.precoMedio).toBeCloseTo(3.42, 2);
    expect(adamantina?.semanaInicio).toBe('2026-06-07');

    const semanas = buildAnpSemanasFromRecords(records);
    expect(semanas).toEqual([{ inicio: '2026-06-07', fim: '2026-06-13' }]);
  });
});

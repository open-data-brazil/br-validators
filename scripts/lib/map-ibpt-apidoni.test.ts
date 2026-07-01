import { describe, expect, it } from 'vitest';

import { mapIbptApidoniToCarga, parseIbptApidoniPayload } from './map-ibpt-apidoni.js';

const APIDONI_SAMPLE = JSON.stringify({
  Codigo: '01012100',
  UF: 'SP',
  EX: 0,
  Descricao: 'Cavalos reprodutores de raca pura',
  Nacional: 13.45,
  Estadual: 18,
  Importado: 15.45,
  Municipal: 0,
  VigenciaInicio: '20/05/2026',
  VigenciaFim: '30/06/2026',
  Versao: '26.1.K',
});

describe('map-ibpt-apidoni', () => {
  it('maps official apidoni JSON to IbptCargaRecord', () => {
    const payload = parseIbptApidoniPayload(APIDONI_SAMPLE);
    const carga = mapIbptApidoniToCarga(payload);

    expect(carga.ncm).toBe('01012100');
    expect(carga.uf).toBe('SP');
    expect(carga.tabela).toBe('26.1.K');
    expect(carga.aliquotaNacionalFederal).toBe(13.45);
    expect(carga.aliquotaEstadual).toBe(18);
  });

  it('throws when required fields are missing', () => {
    expect(() => parseIbptApidoniPayload('{"Codigo":"01012100"}')).toThrow('missing required fields');
  });
});

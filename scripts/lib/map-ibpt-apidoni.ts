import type { IbptCargaRecord } from './parse-ibpt-ncm-json.js';

export interface IbptApidoniPayload {
  Codigo: string;
  UF: string;
  EX: number;
  Descricao: string;
  Nacional: number;
  Estadual: number;
  Importado: number;
  Municipal: number;
  VigenciaInicio: string;
  VigenciaFim: string;
  Versao: string;
}

function readStringField(obj: object, key: string): string | undefined {
  if (!Object.hasOwn(obj, key)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor === undefined || typeof descriptor.value !== 'string') {
    return undefined;
  }
  return descriptor.value;
}

function readNumberField(obj: object, key: string): number | undefined {
  if (!Object.hasOwn(obj, key)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor === undefined || typeof descriptor.value !== 'number') {
    return undefined;
  }
  return descriptor.value;
}

export function parseIbptApidoniPayload(raw: string): IbptApidoniPayload {
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Expected JSON object from IBPT apidoni API');
  }

  const codigo = readStringField(parsed, 'Codigo');
  const uf = readStringField(parsed, 'UF');
  const descricao = readStringField(parsed, 'Descricao');
  const versao = readStringField(parsed, 'Versao');
  const vigenciaInicio = readStringField(parsed, 'VigenciaInicio');
  const vigenciaFim = readStringField(parsed, 'VigenciaFim');
  const ex = readNumberField(parsed, 'EX');
  const nacional = readNumberField(parsed, 'Nacional');
  const estadual = readNumberField(parsed, 'Estadual');
  const importado = readNumberField(parsed, 'Importado');
  const municipal = readNumberField(parsed, 'Municipal');

  if (
    codigo === undefined ||
    uf === undefined ||
    descricao === undefined ||
    versao === undefined ||
    vigenciaInicio === undefined ||
    vigenciaFim === undefined ||
    ex === undefined ||
    nacional === undefined ||
    estadual === undefined ||
    importado === undefined ||
    municipal === undefined
  ) {
    throw new Error('IBPT apidoni payload missing required fields');
  }

  return {
    Codigo: codigo,
    UF: uf,
    EX: ex,
    Descricao: descricao,
    Nacional: nacional,
    Estadual: estadual,
    Importado: importado,
    Municipal: municipal,
    VigenciaInicio: vigenciaInicio,
    VigenciaFim: vigenciaFim,
    Versao: versao,
  };
}

export function mapIbptApidoniToCarga(payload: IbptApidoniPayload): IbptCargaRecord {
  const digits = payload.Codigo.replace(/\D/g, '');
  const ncm = digits.padStart(8, '0').slice(-8);
  return {
    ncm,
    uf: payload.UF,
    excecao: String(payload.EX),
    descricao: payload.Descricao,
    aliquotaNacionalFederal: payload.Nacional,
    aliquotaImportadosFederal: payload.Importado,
    aliquotaEstadual: payload.Estadual,
    aliquotaMunicipal: payload.Municipal,
    vigenciaInicio: payload.VigenciaInicio,
    vigenciaFim: payload.VigenciaFim,
    tabela: payload.Versao,
  };
}

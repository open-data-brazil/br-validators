import type { DatasetMetadata } from '../../packages/br-validators/src/data-catalog/types.js';

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

function readObjectField(obj: object, key: string): object | undefined {
  if (!Object.hasOwn(obj, key)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor === undefined) {
    return undefined;
  }
  const field = descriptor.value as string | number | boolean | object | null | undefined;
  if (typeof field !== 'object' || field === null) {
    return undefined;
  }
  return field;
}

function readStringArrayField(obj: object, key: string): string[] | undefined {
  if (!Object.hasOwn(obj, key)) {
    return undefined;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor === undefined || !Array.isArray(descriptor.value)) {
    return undefined;
  }
  if (!descriptor.value.every((item): item is string => typeof item === 'string')) {
    return undefined;
  }
  return descriptor.value;
}

function isDatasetMetadata(value: object): value is DatasetMetadata {
  const alteracoes = readObjectField(value, 'alteracoes');
  const verificacao = readObjectField(value, 'verificacao');
  const contagens = readObjectField(value, 'contagens');

  return (
    readStringField(value, 'id') !== undefined &&
    readStringField(value, 'nome') !== undefined &&
    readStringField(value, 'fonte') !== undefined &&
    readStringArrayField(value, 'endpoints') !== undefined &&
    readStringField(value, 'capturadoEm') !== undefined &&
    readStringField(value, 'atualizadoEm') !== undefined &&
    readStringField(value, 'documentacao') !== undefined &&
    contagens !== undefined &&
    alteracoes !== undefined &&
    verificacao !== undefined
  );
}

function parseJsonObject(raw: string): object {
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Expected JSON object');
  }
  return parsed;
}

export function parseDatasetMetadata(raw: string): DatasetMetadata {
  const parsed = parseJsonObject(raw);
  if (!isDatasetMetadata(parsed)) {
    throw new Error('Invalid dataset metadata JSON shape');
  }
  return parsed;
}

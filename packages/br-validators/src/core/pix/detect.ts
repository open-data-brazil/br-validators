import { stripCnpj } from '../../strip/cnpj.js';
import { stripCpf } from '../../strip/cpf.js';
import type { PixKeyType } from '../../types/validation-result.js';
import { detectCnpjFormat } from '../cnpj/detect.js';
import {
  PIX_CPF_DIGITS_PATTERN,
  PIX_EVP_PATTERN,
} from './constants.js';

export type DetectedPixKeyType = PixKeyType | 'unknown';

function isCpfShapedInput(input: string): boolean {
  const trimmed = input.trim();
  const stripped = stripCpf(trimmed);
  if (!PIX_CPF_DIGITS_PATTERN.test(stripped)) {
    return false;
  }
  return /^[\d.\-\s]+$/.test(trimmed);
}

function isCnpjShapedInput(input: string): boolean {
  const trimmed = input.trim();
  const stripped = stripCnpj(trimmed);
  if (detectCnpjFormat(stripped) === 'unknown') {
    return false;
  }
  return /^[A-Za-z0-9./\-\s]+$/.test(trimmed);
}

export function detectPixKeyType(input: string): DetectedPixKeyType {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return 'unknown';
  }

  if (trimmed.includes('@')) {
    return 'email';
  }

  if (trimmed.startsWith('+')) {
    return 'phone';
  }

  if (PIX_EVP_PATTERN.test(trimmed)) {
    return 'evp';
  }

  if (isCpfShapedInput(trimmed)) {
    return 'cpf';
  }

  if (isCnpjShapedInput(trimmed)) {
    return 'cnpj';
  }

  return 'unknown';
}

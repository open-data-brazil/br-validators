import type { RgUfCode, RgValidationResult } from '../../types/validation-result.js';

export type RgDvAlgorithm = 'mod11-remainder' | 'mod10-alternating' | 'format-only';

export type RgUfRules = {
  uf: RgUfCode;
  canonicalLength: number;
  baseLength: number;
  dvAlgorithm: RgDvAlgorithm;
  allowsCheckDigitX: boolean;
  allowsLetterPrefix?: 'M';
  supportsMask: boolean;
};

export type ValidateRgOptions = {
  uf: RgUfCode;
};

export type { RgValidationResult };

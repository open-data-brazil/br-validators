/**
 * Inscrição Estadual produtor rural — SP Regra II only.
 * @see http://www.sintegra.gov.br/Cad_Estados/cad_SP.html
 */
import type { IeProdutorRuralValidationResult, UfCode } from '../../types/validation-result.js';
import { IE_SP_RURAL_OFFICIAL_SOURCE_URL } from './constants.js';
import { validateIeSpRural } from './sp-rural.js';

type FailedResult = Extract<IeProdutorRuralValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string, uf: UfCode): FailedResult {
  return { ok: false, code, message, uf };
}

export function getIeProdutorRuralOfficialSourceUrl(): string {
  return IE_SP_RURAL_OFFICIAL_SOURCE_URL;
}

export function isValidIeProdutorRural(uf: UfCode, input: string): boolean {
  return validateIeProdutorRural(uf, input).ok;
}

export function validateIeProdutorRural(uf: UfCode, input: string): IeProdutorRuralValidationResult {
  if (uf !== 'SP') {
    return failure(
      'UNSUPPORTED_FORMAT',
      'Produtor rural Inscrição Estadual validation is supported for SP only; use validateInscricaoEstadual for other UFs',
      uf,
    );
  }
  return validateIeSpRural(input);
}

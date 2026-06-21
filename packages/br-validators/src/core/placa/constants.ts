/**
 * License plate patterns — CONTRAN 729/2018 (legacy + Mercosul).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf
 * @see docs/use-cases/UC-004-validate-placa.md — golden vectors ABC1D23, ABC1234
 */
export const PLACA_LENGTH = 7;
export const PLACA_LEGACY_PATTERN = /^[A-Z]{3}[0-9]{4}$/;
export const PLACA_MERCOSUL_PATTERN = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
export const PLACA_LEGACY_TO_MERCOSUL_MAP: Record<string, string> = {
  '0': 'A',
  '1': 'B',
  '2': 'C',
  '3': 'D',
  '4': 'E',
  '5': 'F',
  '6': 'G',
  '7': 'H',
  '8': 'I',
  '9': 'J',
};
export const PLACA_GOLDEN_MERCOSUL = 'ABC1D23';
export const PLACA_GOLDEN_LEGACY = 'ABC1234';
export const PLACA_GOLDEN_CONVERSION_FROM = 'ABC1234';
export const PLACA_GOLDEN_CONVERSION_TO = 'ABC1C34';
export const PLACA_OFFICIAL_SOURCE_URL =
  'https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf';

/**
 * Strip RENAVAM — digits only (BR-RENAVAM-002).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2013/portaria0272013.pdf
 */
export function stripRenavam(input: string): string {
  return input.replace(/\D/g, '');
}

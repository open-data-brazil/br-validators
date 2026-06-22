/**
 * Strip CNH — digits only (BR-CNH-002). Removes non-official decoration (e.g. CPF-style dots).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao5112014.pdf
 * @see https://www.gov.br/pt-br/servicos/validar-cnh
 */
export function stripCnh(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Strip placa mask — preserve A-Z0-9, uppercase (BR-PLACA-004).
 * @see https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolucao7292018consolidada.pdf
 */
export function stripPlaca(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

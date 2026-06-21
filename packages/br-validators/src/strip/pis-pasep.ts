/**
 * Strip PIS/PASEP mask — digits only (BR-PIS-002).
 * @see https://www.gov.br/previdencia/pt-br/outros/imagens/2015/07/rgrva_RegrasValidacao.pdf — RV_03
 */
export function stripPisPasep(input: string): string {
  return input.replace(/\D/g, '');
}

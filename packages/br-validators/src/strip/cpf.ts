/**
 * Strip CPF mask — digits only (BR-CPF-002).
 * @see https://www.gov.br/receitafederal/pt-br/assuntos/cpf
 */
export function stripCpf(input: string): string {
  return input.replace(/\D/g, '');
}

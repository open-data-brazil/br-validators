/**
 * Strip NF-e chave de acesso — digits only (BR-NFE-CHAVE-002).
 * @see http://moc.sped.fazenda.pr.gov.br/ — §2.2.6 chave de acesso
 */
export function stripNfeChave(input: string): string {
  return input.replace(/\D/g, '');
}

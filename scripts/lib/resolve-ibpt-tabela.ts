/**
 * Resolve latest IBPT NCM table year/version from valraw meta.json.
 * @see https://ibpt.valraw.com.br/api/meta.json
 */

export interface IbptMetaPayload {
  anos: number[];
  versoes: Partial<Record<string, string[]>>;
}

export function resolveLatestIbptTabela(meta: IbptMetaPayload): { ano: number; tabela: string } {
  if (meta.anos.length === 0) {
    throw new Error('IBPT meta.json has no years');
  }

  const latestYear = Math.max(...meta.anos);
  const versoes = meta.versoes[String(latestYear)];
  if (versoes === undefined || versoes.length === 0) {
    throw new Error(`IBPT meta.json has no versions for year ${String(latestYear)}`);
  }

  const tabela = versoes[versoes.length - 1];
  if (tabela.length === 0) {
    throw new Error(`IBPT meta.json has no tabela for year ${String(latestYear)}`);
  }

  return { ano: latestYear, tabela };
}

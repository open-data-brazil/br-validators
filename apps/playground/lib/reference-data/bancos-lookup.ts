import { getBancoPorCodigo, getBancoPorIspb, type Banco } from '@br-validators/core/bancos';

export function normalizeBancosLookupInput(
  raw: string,
): { kind: 'codigo'; value: string } | { kind: 'ispb'; value: string } | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 8) {
    return { kind: 'ispb', value: digits.padStart(8, '0') };
  }
  if (digits.length >= 1 && digits.length <= 3) {
    return { kind: 'codigo', value: digits.padStart(3, '0').slice(-3) };
  }
  return null;
}

export function resolveBancoFromInput(raw: string): Banco | undefined {
  const normalized = normalizeBancosLookupInput(raw);
  if (!normalized) {
    return undefined;
  }
  return normalized.kind === 'ispb'
    ? getBancoPorIspb(normalized.value)
    : getBancoPorCodigo(normalized.value);
}

export function filterBancosByQuery(bancos: readonly Banco[], query: string): readonly Banco[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return bancos;
  }
  return bancos.filter(
    (banco) =>
      banco.codigo.includes(needle) ||
      banco.ispb.includes(needle) ||
      banco.nome.toLowerCase().includes(needle) ||
      banco.nomeReduzido.toLowerCase().includes(needle),
  );
}

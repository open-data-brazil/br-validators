import {
  getCodigosTsePorMunicipio,
  getMunicipioIbgePorCodigoTse,
} from '@br-validators/core/tse-municipios';
import { getMunicipioPorCodigo } from '@br-validators/core/ibge';

export type TseCrossRefResult =
  | { kind: 'tse-to-ibge'; codigoTse: string; ibgeCodigo: number; municipioNome: string | null; uf: string | null }
  | { kind: 'ibge-to-tse'; ibgeCodigo: number; codigosTse: readonly string[]; municipioNome: string | null; uf: string | null };

function municipioLabel(ibgeCodigo: number): { nome: string | null; uf: string | null } {
  const municipio = getMunicipioPorCodigo(ibgeCodigo);
  return { nome: municipio?.nome ?? null, uf: municipio?.uf ?? null };
}

export function resolveTseCrossRef(input: string): TseCrossRefResult | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 5) {
    const codigoTse = digits.padStart(5, '0');
    const ibgeCodigo = getMunicipioIbgePorCodigoTse(codigoTse);
    if (ibgeCodigo === undefined) {
      return null;
    }
    const label = municipioLabel(ibgeCodigo);
    return {
      kind: 'tse-to-ibge',
      codigoTse,
      ibgeCodigo,
      municipioNome: label.nome,
      uf: label.uf,
    };
  }
  if (digits.length === 7) {
    const ibgeCodigo = Number(digits);
    const codigosTse = getCodigosTsePorMunicipio(ibgeCodigo);
    if (codigosTse.length === 0) {
      return null;
    }
    const label = municipioLabel(ibgeCodigo);
    return {
      kind: 'ibge-to-tse',
      ibgeCodigo,
      codigosTse,
      municipioNome: label.nome,
      uf: label.uf,
    };
  }
  return null;
}

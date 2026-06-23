import { getMunicipios, type Municipio } from '@br-validators/core/ibge';

export function getMunicipiosForUf(uf: string): readonly Municipio[] {
  return getMunicipios({ uf });
}

export function filterMunicipiosByName(municipios: readonly Municipio[], query: string): readonly Municipio[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return municipios;
  }
  return municipios.filter((municipio) => municipio.nome.toLowerCase().includes(needle));
}

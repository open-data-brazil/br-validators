import { getDatasetMetadata } from '@br-validators/core/data-catalog';
import type { PncpReferenceTableId } from '@br-validators/core/pncp-reference';
import {
  clientFilterRows,
  createFormatRow,
  pickRowFields,
  resolveFeriadosYear,
  resolveSearchLimit,
  type DatasetAdapter,
  type NormalizedRow,
} from './dataset-adapter';

const PNCP_TABLE_IDS: readonly PncpReferenceTableId[] = [
  'modalidades',
  'amparos-legais',
  'modos-disputa',
  'tipos-instrumentos-convocatorios',
  'tipos-contrato',
  'criterios-julgamento',
  'tipos-instrumentos-cobranca',
  'fontes-orcamentarias',
];

const CST_TAXES = ['icms', 'ipi', 'pis', 'cofins'] as const;

function catalogMeta(id: string): Pick<DatasetAdapter, 'nome' | 'capturadoEm'> {
  const metadata = getDatasetMetadata(id);
  if (metadata === undefined) {
    throw new Error(`Missing data-catalog metadata for dataset id "${id}"`);
  }
  return { nome: metadata.nome, capturadoEm: metadata.capturadoEm };
}

function adapter(
  id: string,
  config: Omit<DatasetAdapter, 'id' | 'nome' | 'capturadoEm'>,
): DatasetAdapter {
  return { id, ...catalogMeta(id), ...config };
}

function codeDescAdapter(
  id: string,
  loadModule: () => Promise<{
    load: () => readonly { codigo: string; descricao: string }[];
    search?: (query: string, options?: { limit?: number }) => readonly { codigo: string; descricao: string }[];
  }>,
  playgroundRoute: string | undefined,
): DatasetAdapter {
  const fieldKeys = ['codigo', 'descricao'] as const;
  return adapter(id, {
    fieldKeys,
    playgroundRoute,
    formatRow: createFormatRow(fieldKeys),
    loadAll: async () => {
      const mod = await loadModule();
      return mod.load().map((row) => pickRowFields(row, fieldKeys));
    },
    search: async (query, options) => {
      const mod = await loadModule();
      if (mod.search === undefined) {
        return [];
      }
      const limit = resolveSearchLimit(options);
      return mod.search(query, { limit }).map((row) => pickRowFields(row, fieldKeys));
    },
  });
}

const DATASET_ADAPTERS: readonly DatasetAdapter[] = [
  adapter('ibge', {
    fieldKeys: ['tipo', 'codigo', 'nome', 'uf', 'regiao'],
    playgroundRoute: '/data/ibge',
    formatRow: createFormatRow(['tipo', 'codigo', 'nome', 'uf', 'regiao']),
    loadAll: async (options) => {
      const mod = await import('@br-validators/core/ibge');
      const uf = options?.uf?.trim().toUpperCase();
      const estados = mod.getAllEstados().map((estado) =>
        pickRowFields(
          { codigo: estado.codigo, nome: estado.nome, uf: estado.sigla },
          ['codigo', 'nome', 'uf'],
          { tipo: 'estado', regiao: estado.regiao.nome },
        ),
      );
      const municipios = mod.getAllMunicipios(uf !== undefined && uf.length > 0 ? { uf } : undefined).map(
        (municipio) =>
          pickRowFields(municipio, ['codigo', 'nome', 'uf'], { tipo: 'municipio', regiao: null }),
      );
      return [...estados, ...municipios];
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'ibge')?.loadAll(options);
      return clientFilterRows(rows ?? [], query, ['nome', 'uf', 'codigo'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('bancos', {
    fieldKeys: ['codigo', 'ispb', 'nome', 'nomeReduzido', 'participaCompe'],
    playgroundRoute: '/data/bancos',
    formatRow: createFormatRow(['codigo', 'ispb', 'nome', 'nomeReduzido', 'participaCompe']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/bancos');
      return mod.getAllBancos().map((row) => pickRowFields(row, ['codigo', 'ispb', 'nome', 'nomeReduzido', 'participaCompe']));
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'bancos')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['codigo', 'ispb', 'nome', 'nomeReduzido'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('aeroportos', {
    fieldKeys: ['iata', 'icao', 'nome', 'uf', 'municipioIbge', 'municipioNome'],
    playgroundRoute: '/data/logistics',
    formatRow: createFormatRow(['iata', 'icao', 'nome', 'uf', 'municipioIbge', 'municipioNome']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/aeroportos');
      return mod.getAllAeroportos().map((row) =>
        pickRowFields(row, ['iata', 'icao', 'nome', 'uf', 'municipioIbge', 'municipioNome']),
      );
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'aeroportos')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['iata', 'icao', 'nome', 'uf', 'municipioNome'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('tse-municipios', {
    fieldKeys: ['codigoTse', 'ibgeCodigo', 'uf', 'nome'],
    playgroundRoute: '/data/ibge',
    loaderNote: 'No public getAll* — uses getMapeamentoTseIbge()',
    formatRow: createFormatRow(['codigoTse', 'ibgeCodigo', 'uf', 'nome']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/tse-municipios');
      return mod.getMapeamentoTseIbge().map((row) =>
        pickRowFields(row, ['codigoTse', 'ibgeCodigo', 'uf', 'nome']),
      );
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'tse-municipios')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['codigoTse', 'ibgeCodigo', 'uf', 'nome'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('moedas', {
    fieldKeys: ['codigo', 'nome', 'simbolo', 'tipoBacen'],
    playgroundRoute: '/data/trade',
    formatRow: createFormatRow(['codigo', 'nome', 'simbolo', 'tipoBacen']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/moedas');
      return mod.getAllMoedas().map((row) => pickRowFields(row, ['codigo', 'nome', 'simbolo', 'tipoBacen']));
    },
    search: async (query, options) => {
      const mod = await import('@br-validators/core/moedas');
      const limit = resolveSearchLimit(options);
      return mod.searchMoedas(query, { limit }).map((row) =>
        pickRowFields(row, ['codigo', 'nome', 'simbolo', 'tipoBacen']),
      );
    },
  }),

  adapter('ptax', {
    fieldKeys: ['moeda', 'data', 'cotacaoCompra', 'cotacaoVenda', 'paridadeCompra', 'paridadeVenda'],
    playgroundRoute: '/data/finance',
    loaderNote: 'No getAll* — uses getPtaxCotacoesPorMoeda / getPtaxHistorico',
    searchOptionsHint: 'SearchOptions: moeda (default USD), desde + ate for date range via getPtaxHistorico',
    formatRow: createFormatRow(['moeda', 'data', 'cotacaoCompra', 'cotacaoVenda', 'paridadeCompra', 'paridadeVenda']),
    loadAll: async (options) => {
      const mod = await import('@br-validators/core/ptax');
      const moeda = (options?.moeda ?? 'USD').trim().toUpperCase();
      const rows =
        options?.desde !== undefined && options.ate !== undefined
          ? mod.getPtaxHistorico(moeda, { desde: options.desde, ate: options.ate })
          : mod.getPtaxCotacoesPorMoeda(moeda);
      return rows.map((row) =>
        pickRowFields(row, ['moeda', 'data', 'cotacaoCompra', 'cotacaoVenda', 'paridadeCompra', 'paridadeVenda']),
      );
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'ptax')?.loadAll(options);
      return clientFilterRows(rows ?? [], query, ['moeda', 'data'], { limit: resolveSearchLimit(options) });
    },
  }),

  adapter('paises-bacen', {
    fieldKeys: ['codigo', 'nome'],
    playgroundRoute: '/data/trade',
    formatRow: createFormatRow(['codigo', 'nome']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/paises-bacen');
      return mod.getAllPaisesBacen().map((row) => pickRowFields(row, ['codigo', 'nome']));
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'paises-bacen')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['codigo', 'nome'], { limit: resolveSearchLimit(options) });
    },
  }),

  adapter('incoterms', {
    fieldKeys: ['codigo', 'nome', 'edicao'],
    playgroundRoute: '/data/trade',
    formatRow: createFormatRow(['codigo', 'nome', 'edicao']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/incoterms');
      return mod.getAllIncoterms().map((row) => pickRowFields(row, ['codigo', 'nome', 'edicao']));
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'incoterms')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['codigo', 'nome'], { limit: resolveSearchLimit(options) });
    },
  }),

  adapter('telefone-ddd', {
    fieldKeys: ['ddd', 'uf', 'regiao', 'municipios'],
    loaderNote: 'No public getAll* — iterates ANATEL_DDDS + getDddInfo per code',
    formatRow: createFormatRow(['ddd', 'uf', 'regiao', 'municipios']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/telefone');
      return mod.ANATEL_DDDS.map((ddd) => {
        const info = mod.getDddInfo(ddd);
        return pickRowFields(info ?? { ddd, uf: null, regiao: null, municipios: [] }, ['ddd', 'uf', 'regiao', 'municipios']);
      });
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'telefone-ddd')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['ddd', 'uf', 'regiao', 'municipios'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('feriados', {
    fieldKeys: ['data', 'nome', 'tipo', 'baseLegal'],
    playgroundRoute: '/data/calendar',
    loaderNote: 'getAllFeriados(year) — year required; defaults to current calendar year',
    formatRow: createFormatRow(['data', 'nome', 'tipo', 'baseLegal']),
    loadAll: async (options) => {
      const mod = await import('@br-validators/core/feriados');
      const year = resolveFeriadosYear(options);
      return mod.getAllFeriados(year).map((row) =>
        pickRowFields(row, ['data', 'nome', 'tipo', 'baseLegal']),
      );
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'feriados')?.loadAll(options);
      return clientFilterRows(rows ?? [], query, ['data', 'nome', 'tipo'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  codeDescAdapter('cnaes', async () => {
    const mod = await import('@br-validators/core/cnaes');
    return { load: () => mod.getAllCnae(), search: mod.searchCnaes };
  }, '/data/fiscal'),
  codeDescAdapter('cfop', async () => {
    const mod = await import('@br-validators/core/cfop');
    return { load: () => mod.getAllCfop(), search: mod.searchCfop };
  }, '/data/fiscal'),
  codeDescAdapter('ncm', async () => {
    const mod = await import('@br-validators/core/ncm');
    return { load: () => mod.getAllNcm(), search: mod.searchNcm };
  }, '/data/fiscal'),
  codeDescAdapter('cbo', async () => {
    const mod = await import('@br-validators/core/cbo');
    return { load: () => mod.getAllCbo(), search: mod.searchCbo };
  }, '/data/fiscal'),
  codeDescAdapter('nbs', async () => {
    const mod = await import('@br-validators/core/nbs');
    return { load: () => mod.getAllNbs(), search: mod.searchNbs };
  }, '/data/fiscal'),
  codeDescAdapter('lc116', async () => {
    const mod = await import('@br-validators/core/lc116');
    return { load: () => mod.getAllLc116(), search: mod.searchLc116 };
  }, undefined),

  adapter('natureza-juridica', {
    fieldKeys: ['codigo', 'descricao'],
    playgroundRoute: '/data/fiscal',
    formatRow: createFormatRow(['codigo', 'descricao']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/natureza-juridica');
      return mod.getAllNaturezaJuridica().map((row) => pickRowFields(row, ['codigo', 'descricao']));
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'natureza-juridica')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['codigo', 'descricao'], { limit: resolveSearchLimit(options) });
    },
  }),

  adapter('cnpj-motivos', {
    fieldKeys: ['codigo', 'descricao'],
    loaderNote: 'Uses getMotivosSituacaoCadastral() — no getAll* export name',
    formatRow: createFormatRow(['codigo', 'descricao']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/cnpj-motivos');
      return mod.getMotivosSituacaoCadastral().map((row) => pickRowFields(row, ['codigo', 'descricao']));
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'cnpj-motivos')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['codigo', 'descricao'], { limit: resolveSearchLimit(options) });
    },
  }),

  adapter('ibpt', {
    fieldKeys: [
      'ncm',
      'uf',
      'excecao',
      'descricao',
      'aliquotaNacionalFederal',
      'aliquotaImportadosFederal',
      'aliquotaEstadual',
      'aliquotaMunicipal',
      'vigenciaInicio',
      'vigenciaFim',
    ],
    loaderNote: 'Metadata-only golden subset — getAllIbptCargas()',
    formatRow: createFormatRow([
      'ncm',
      'uf',
      'excecao',
      'descricao',
      'aliquotaNacionalFederal',
      'aliquotaImportadosFederal',
      'aliquotaEstadual',
      'aliquotaMunicipal',
      'vigenciaInicio',
      'vigenciaFim',
    ]),
    loadAll: async () => {
      const mod = await import('@br-validators/core/ibpt');
      return mod.getAllIbptCargas().map((row) =>
        pickRowFields(row, [
          'ncm',
          'uf',
          'excecao',
          'descricao',
          'aliquotaNacionalFederal',
          'aliquotaImportadosFederal',
          'aliquotaEstadual',
          'aliquotaMunicipal',
          'vigenciaInicio',
          'vigenciaFim',
        ]),
      );
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'ibpt')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['ncm', 'uf', 'descricao'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('cest', {
    fieldKeys: ['codigo', 'descricao', 'segmento', 'ncms'],
    playgroundRoute: '/data/fiscal',
    formatRow: createFormatRow(['codigo', 'descricao', 'segmento', 'ncms']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/cest');
      return mod.getAllCest().map((row) =>
        pickRowFields(row, ['codigo', 'descricao', 'segmento', 'ncms']),
      );
    },
    search: async (query, options) => {
      const mod = await import('@br-validators/core/cest');
      const limit = resolveSearchLimit(options);
      return mod.searchCest(query, { limit }).map((row) =>
        pickRowFields(row, ['codigo', 'descricao', 'segmento', 'ncms']),
      );
    },
  }),

  adapter('cst', {
    fieldKeys: ['tax', 'codigo', 'descricao'],
    playgroundRoute: '/data/fiscal',
    formatRow: createFormatRow(['tax', 'codigo', 'descricao']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/cst');
      const rows: NormalizedRow[] = [];
      for (const tax of CST_TAXES) {
        const loaderName = `getAllCst${tax.charAt(0).toUpperCase()}${tax.slice(1)}` as
          | 'getAllCstIcms'
          | 'getAllCstIpi'
          | 'getAllCstPis'
          | 'getAllCstCofins';
        const items = mod[loaderName]();
        for (const item of items) {
          rows.push(pickRowFields(item, ['codigo', 'descricao'], { tax }));
        }
      }
      return rows;
    },
    search: async (query, options) => {
      const mod = await import('@br-validators/core/cst');
      const limit = resolveSearchLimit(options);
      const rows: NormalizedRow[] = [];
      const searchFns = {
        icms: mod.searchCstIcms,
        ipi: mod.searchCstIpi,
        pis: mod.searchCstPis,
        cofins: mod.searchCstCofins,
      } as const;

      for (const tax of CST_TAXES) {
        const hits = searchFns[tax](query, { limit });
        for (const item of hits) {
          rows.push(pickRowFields(item, ['codigo', 'descricao'], { tax }));
          if (rows.length >= limit) {
            return rows;
          }
        }
      }
      return rows;
    },
  }),

  adapter('csosn', {
    fieldKeys: ['codigo', 'descricao'],
    playgroundRoute: '/data/fiscal',
    formatRow: createFormatRow(['codigo', 'descricao']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/csosn');
      return mod.getAllCsosn().map((row) => pickRowFields(row, ['codigo', 'descricao']));
    },
    search: async (query, options) => {
      const mod = await import('@br-validators/core/csosn');
      const limit = resolveSearchLimit(options);
      return mod.searchCsosn(query, { limit }).map((row) => pickRowFields(row, ['codigo', 'descricao']));
    },
  }),

  adapter('esocial', {
    fieldKeys: ['registro', 'codigo', 'grupo', 'natureza', 'descricao', 'inicio', 'termino'],
    playgroundRoute: '/data/payroll',
    loaderNote: 'Single catalog id — merges categorias + rubricas with registro discriminator',
    formatRow: createFormatRow(['registro', 'codigo', 'grupo', 'natureza', 'descricao', 'inicio', 'termino']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/esocial');
      const categorias = mod.getAllEsocialCategorias().map((row) =>
        pickRowFields(row, ['codigo', 'grupo', 'descricao', 'inicio', 'termino'], {
          registro: 'categoria',
          natureza: null,
        }),
      );
      const rubricas = mod.getAllEsocialRubricas().map((row) =>
        pickRowFields(row, ['codigo', 'natureza', 'descricao', 'inicio', 'termino'], {
          registro: 'rubrica',
          grupo: null,
        }),
      );
      return [...categorias, ...rubricas];
    },
    search: async (query, options) => {
      const mod = await import('@br-validators/core/esocial');
      const limit = resolveSearchLimit(options);
      const categorias = mod.searchEsocialCategorias(query, { limit }).map((row) =>
        pickRowFields(row, ['codigo', 'grupo', 'descricao', 'inicio', 'termino'], {
          registro: 'categoria',
          natureza: null,
        }),
      );
      const rubricas = mod.searchEsocialRubricas(query, { limit }).map((row) =>
        pickRowFields(row, ['codigo', 'natureza', 'descricao', 'inicio', 'termino'], {
          registro: 'rubrica',
          grupo: null,
        }),
      );
      return [...categorias, ...rubricas].slice(0, limit);
    },
  }),

  adapter('simples-nacional', {
    fieldKeys: ['anexo', 'anexoNome', 'faixa', 'receitaBrutaMin', 'receitaBrutaMax', 'aliquotaNominal', 'parcelaDeduzir'],
    loaderNote: 'Flattens getAllSimplesAnexos() nested faixas in adapter',
    formatRow: createFormatRow([
      'anexo',
      'anexoNome',
      'faixa',
      'receitaBrutaMin',
      'receitaBrutaMax',
      'aliquotaNominal',
      'parcelaDeduzir',
    ]),
    loadAll: async () => {
      const mod = await import('@br-validators/core/simples-nacional');
      const rows: NormalizedRow[] = [];
      for (const anexo of mod.getAllSimplesAnexos()) {
        for (const faixa of anexo.faixas) {
          rows.push(
            pickRowFields(faixa, ['faixa', 'receitaBrutaMin', 'receitaBrutaMax', 'aliquotaNominal', 'parcelaDeduzir'], {
              anexo: anexo.id,
              anexoNome: anexo.nome,
            }),
          );
        }
      }
      return rows;
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'simples-nacional')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['anexo', 'anexoNome', 'faixa'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('cep-faixas', {
    fieldKeys: ['prefixo', 'uf', 'codigoIbge', 'cidade'],
    loaderNote: 'Uses getCepFaixas() — no getAll* export name',
    formatRow: createFormatRow(['prefixo', 'uf', 'codigoIbge', 'cidade']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/cep');
      return mod.getCepFaixas().map((row) => pickRowFields(row, ['prefixo', 'uf', 'codigoIbge', 'cidade']));
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'cep-faixas')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['prefixo', 'uf', 'cidade'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('portos', {
    fieldKeys: ['codigo', 'nome', 'uf', 'municipioNome', 'municipioIbge', 'situacao'],
    playgroundRoute: '/data/logistics',
    formatRow: createFormatRow(['codigo', 'nome', 'uf', 'municipioNome', 'municipioIbge', 'situacao']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/portos');
      return mod.getAllPortos().map((row) =>
        pickRowFields(row, ['codigo', 'nome', 'uf', 'municipioNome', 'municipioIbge', 'situacao']),
      );
    },
    search: async (query, options) => {
      const mod = await import('@br-validators/core/portos');
      const limit = resolveSearchLimit(options);
      return mod.searchPortos(query, { limit }).map((row) =>
        pickRowFields(row, ['codigo', 'nome', 'uf', 'municipioNome', 'municipioIbge', 'situacao']),
      );
    },
  }),

  adapter('anp-combustiveis', {
    fieldKeys: [
      'semanaInicio',
      'semanaFim',
      'uf',
      'municipioNome',
      'produto',
      'precoMedio',
      'precoMinimo',
      'precoMaximo',
      'postosPesquisados',
    ],
    loaderNote: 'Uses getAllAnpPrecosMedios(); weeks via getAllAnpSemanasPesquisa()',
    formatRow: createFormatRow([
      'semanaInicio',
      'semanaFim',
      'uf',
      'municipioNome',
      'produto',
      'precoMedio',
      'precoMinimo',
      'precoMaximo',
      'postosPesquisados',
    ]),
    loadAll: async () => {
      const mod = await import('@br-validators/core/anp-combustiveis');
      return mod.getAllAnpPrecosMedios().map((row) =>
        pickRowFields(row, [
          'semanaInicio',
          'semanaFim',
          'uf',
          'municipioNome',
          'produto',
          'precoMedio',
          'precoMinimo',
          'precoMaximo',
          'postosPesquisados',
        ]),
      );
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'anp-combustiveis')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['uf', 'municipioNome', 'produto'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('pncp-reference', {
    fieldKeys: ['tableId', 'id', 'nome', 'descricao', 'ativo'],
    loaderNote: 'getAllPncpReference(tableId) — adapter merges all 8 tables',
    formatRow: createFormatRow(['tableId', 'id', 'nome', 'descricao', 'ativo']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/pncp-reference');
      const rows: NormalizedRow[] = [];
      for (const tableId of PNCP_TABLE_IDS) {
        for (const item of mod.getAllPncpReference(tableId)) {
          rows.push(pickRowFields(item, ['id', 'nome', 'descricao', 'ativo'], { tableId }));
        }
      }
      return rows;
    },
    search: async (query, options) => {
      const mod = await import('@br-validators/core/pncp-reference');
      const limit = resolveSearchLimit(options);
      const tableId = options?.tableId as PncpReferenceTableId | undefined;
      if (tableId !== undefined && PNCP_TABLE_IDS.includes(tableId)) {
        return mod.searchPncpReference(tableId, query, { limit }).map((row) =>
          pickRowFields(row, ['id', 'nome', 'descricao', 'ativo'], { tableId }),
        );
      }
      const rows: NormalizedRow[] = [];
      for (const id of PNCP_TABLE_IDS) {
        const hits = mod.searchPncpReference(id, query, { limit });
        for (const row of hits) {
          rows.push(pickRowFields(row, ['id', 'nome', 'descricao', 'ativo'], { tableId: id }));
          if (rows.length >= limit) {
            return rows;
          }
        }
      }
      return rows;
    },
  }),

  adapter('transparencia-snapshots', {
    fieldKeys: ['id', 'path', 'domain', 'delivery', 'description'],
    loaderNote: 'Metadata-only endpoint registry — getTransparenciaEndpoints()',
    formatRow: createFormatRow(['id', 'path', 'domain', 'delivery', 'description']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/transparencia-snapshots');
      return mod.getTransparenciaEndpoints().map((row) =>
        pickRowFields(row, ['id', 'path', 'domain', 'delivery', 'description']),
      );
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'transparencia-snapshots')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['id', 'path', 'domain', 'description'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('nfe-cuf', {
    fieldKeys: ['codigo', 'uf', 'nome', 'codigoIbge'],
    playgroundRoute: '/data/fiscal',
    formatRow: createFormatRow(['codigo', 'uf', 'nome', 'codigoIbge']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/nfe-cuf');
      return mod.getAllCuf().map((row) => pickRowFields(row, ['codigo', 'uf', 'nome', 'codigoIbge']));
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'nfe-cuf')?.loadAll();
      return clientFilterRows(rows ?? [], query, ['codigo', 'uf', 'nome'], { limit: resolveSearchLimit(options) });
    },
  }),

  adapter('irpf', {
    fieldKeys: ['ano', 'faixa', 'baseCalculoMin', 'baseCalculoMax', 'aliquota', 'parcelaDeduzir', 'descricao'],
    playgroundRoute: '/data/payroll',
    loaderNote: 'Flattens getIrpfTabelaProgressiva() per year',
    formatRow: createFormatRow([
      'ano',
      'faixa',
      'baseCalculoMin',
      'baseCalculoMax',
      'aliquota',
      'parcelaDeduzir',
      'descricao',
    ]),
    loadAll: async (options) => {
      const mod = await import('@br-validators/core/irpf');
      const year = options?.year;
      const anos =
        year !== undefined ? [year] : [...mod.getIrpfAnosDisponiveis()];
      const rows: NormalizedRow[] = [];
      for (const ano of anos) {
        const faixas = mod.getIrpfTabelaProgressiva(ano);
        if (faixas === undefined) {
          continue;
        }
        for (const faixa of faixas) {
          rows.push(pickRowFields(faixa, ['faixa', 'baseCalculoMin', 'baseCalculoMax', 'aliquota', 'parcelaDeduzir', 'descricao'], { ano }));
        }
      }
      return rows;
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'irpf')?.loadAll(options);
      return clientFilterRows(rows ?? [], query, ['ano', 'descricao', 'faixa'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('inss', {
    fieldKeys: ['ano', 'teto', 'faixa', 'salarioMin', 'salarioMax', 'aliquota', 'descricao'],
    playgroundRoute: '/data/payroll',
    loaderNote: 'Flattens getInssTabelaContribuicao() per year',
    formatRow: createFormatRow(['ano', 'teto', 'faixa', 'salarioMin', 'salarioMax', 'aliquota', 'descricao']),
    loadAll: async (options) => {
      const mod = await import('@br-validators/core/inss');
      const year = options?.year;
      const anos = year !== undefined ? [year] : [...mod.getInssAnosDisponiveis()];
      const rows: NormalizedRow[] = [];
      for (const ano of anos) {
        const tabela = mod.getInssTabelaContribuicao(ano);
        if (tabela === undefined) {
          continue;
        }
        for (const faixa of tabela.faixas) {
          rows.push(
            pickRowFields(faixa, ['faixa', 'salarioMin', 'salarioMax', 'aliquota', 'descricao'], {
              ano: tabela.ano,
              teto: tabela.teto,
            }),
          );
        }
      }
      return rows;
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'inss')?.loadAll(options);
      return clientFilterRows(rows ?? [], query, ['ano', 'descricao', 'faixa'], {
        limit: resolveSearchLimit(options),
      });
    },
  }),

  adapter('selic', {
    fieldKeys: ['data', 'valor'],
    playgroundRoute: '/data/finance',
    loaderNote: 'Uses getSelicList() daily series',
    formatRow: createFormatRow(['data', 'valor']),
    loadAll: async (options) => {
      const mod = await import('@br-validators/core/selic');
      let rows = mod.getSelicList().map((row) => pickRowFields(row, ['data', 'valor']));
      if (options?.desde !== undefined || options?.ate !== undefined) {
        rows = mod
          .getSelicHistorico({ from: options.desde, to: options.ate })
          .map((row) => pickRowFields(row, ['data', 'valor']));
      }
      return rows;
    },
    search: async (query, options) => {
      const rows = await DATASET_ADAPTERS.find((entry) => entry.id === 'selic')?.loadAll(options);
      return clientFilterRows(rows ?? [], query, ['data', 'valor'], { limit: resolveSearchLimit(options) });
    },
  }),

  adapter('iss-municipal', {
    fieldKeys: ['codigoIbge', 'nome', 'uf', 'aliquotaMin', 'aliquotaMax', 'fonte', 'warning'],
    playgroundRoute: '/data/fiscal',
    formatRow: createFormatRow(['codigoIbge', 'nome', 'uf', 'aliquotaMin', 'aliquotaMax', 'fonte', 'warning']),
    loadAll: async () => {
      const mod = await import('@br-validators/core/iss-municipal');
      return mod.getAllIssMunicipal().map((row) =>
        pickRowFields(row, ['codigoIbge', 'nome', 'uf', 'aliquotaMin', 'aliquotaMax'], {
          fonte: row.estimativa ? 'estimativa' : 'oficial',
          warning: row.estimativa ? 'LC 116 band fallback — not verified municipal legislation' : null,
        }),
      );
    },
    search: async (query, options) => {
      const mod = await import('@br-validators/core/iss-municipal');
      const uf = options?.uf?.trim().toUpperCase();
      const searchOptions =
        uf !== undefined && uf.length > 0
          ? { uf, limit: resolveSearchLimit(options) }
          : { limit: resolveSearchLimit(options) };
      return mod.searchIssMunicipal(query, searchOptions).map((row) =>
        pickRowFields(row, ['codigoIbge', 'nome', 'uf', 'aliquotaMin', 'aliquotaMax', 'fonte', 'warning']),
      );
    },
  }),
];

const ADAPTER_BY_ID = new Map<string, DatasetAdapter>(
  DATASET_ADAPTERS.map((entry) => [entry.id, entry]),
);

export function getDatasetAdapter(id: string): DatasetAdapter | undefined {
  return ADAPTER_BY_ID.get(id);
}

export function getAllDatasetAdapters(): readonly DatasetAdapter[] {
  return DATASET_ADAPTERS;
}

/** @internal Exposed for unit tests — do not use in UI. */
export const DATASET_ADAPTER_IDS = DATASET_ADAPTERS.map((entry) => entry.id);

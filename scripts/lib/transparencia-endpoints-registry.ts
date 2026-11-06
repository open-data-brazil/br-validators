/**
 * Portal da Transparência endpoint registry — embed vs adapter classification.
 * @see https://api.portaldatransparencia.gov.br/swagger-ui/index.html
 */

export type TransparenciaDeliveryMode = 'query-adapter' | 'bulk-embed-candidate' | 'out-of-scope';

export interface TransparenciaEndpointRecord {
  id: string;
  path: string;
  domain: string;
  delivery: TransparenciaDeliveryMode;
  description: string;
}

export const TRANSPARENCIA_SWAGGER_URL =
  'https://api.portaldatransparencia.gov.br/swagger-ui/index.html';

export const TRANSPARENCIA_OPENAPI_URL = 'https://api.portaldatransparencia.gov.br/v3/api-docs';

export const TRANSPARENCIA_CADASTRO_URL = 'https://portaldatransparencia.gov.br/';

export const TRANSPARENCIA_ENDPOINTS: readonly TransparenciaEndpointRecord[] = [
  {
    id: 'ceis',
    path: '/api-de-dados/ceis',
    domain: 'sanctions',
    delivery: 'query-adapter',
    description: 'Cadastro de Empresas Inidôneas e Suspensas — paginated query by CNPJ/CPF',
  },
  {
    id: 'cnep',
    path: '/api-de-dados/cnep',
    domain: 'sanctions',
    delivery: 'query-adapter',
    description: 'Cadastro Nacional de Empresas Punidas — paginated query by CNPJ/CPF',
  },
  {
    id: 'ceaf',
    path: '/api-de-dados/ceaf',
    domain: 'sanctions',
    delivery: 'query-adapter',
    description: 'Cadastro de Expulsões da Administração Federal — paginated query',
  },
  {
    id: 'peps',
    path: '/api-de-dados/peps',
    domain: 'pep',
    delivery: 'query-adapter',
    description: 'Pessoas Expostas Politicamente — paginated query; no open bulk export in v1',
  },
  {
    id: 'bolsa-familia',
    path: '/api-de-dados/bolsa-familia-beneficios',
    domain: 'social-programs',
    delivery: 'query-adapter',
    description: 'Bolsa Família benefits — query by CPF/NIS; adapter only',
  },
  {
    id: 'bpc',
    path: '/api-de-dados/beneficios-por-pessoa',
    domain: 'social-programs',
    delivery: 'query-adapter',
    description: 'BPC and related benefits — query by CPF/NIS; adapter only',
  },
  {
    id: 'auxilio-emergencial',
    path: '/api-de-dados/auxilio-emergencial',
    domain: 'social-programs',
    delivery: 'query-adapter',
    description: 'Auxílio Emergencial — historical query by CPF/NIS; adapter only',
  },
  {
    id: 'despesas',
    path: '/api-de-dados/despesas',
    domain: 'budget',
    delivery: 'out-of-scope',
    description: 'Federal spending — high volume; out of scope for core embed v1',
  },
] as const;

/**
 * PNCP cadastro API domain tables for static reference embed.
 * @see https://pncp.gov.br/api/pncp/v3/api-docs
 */

export interface PncpReferenceEndpoint {
  id: string;
  path: string;
  outputFile: string;
}

export const PNCP_CADASTRO_BASE_URL = 'https://pncp.gov.br/api/pncp/v1';

export const PNCP_REFERENCE_ENDPOINTS: readonly PncpReferenceEndpoint[] = [
  { id: 'modalidades', path: '/modalidades', outputFile: 'modalidades.json' },
  { id: 'amparos-legais', path: '/amparos-legais', outputFile: 'amparos-legais.json' },
  { id: 'modos-disputa', path: '/modos-disputas', outputFile: 'modos-disputa.json' },
  {
    id: 'tipos-instrumentos-convocatorios',
    path: '/tipos-instrumentos-convocatorios',
    outputFile: 'tipos-instrumentos-convocatorios.json',
  },
  { id: 'tipos-contrato', path: '/tipos-contratos', outputFile: 'tipos-contrato.json' },
  { id: 'criterios-julgamento', path: '/criterios-julgamentos', outputFile: 'criterios-julgamento.json' },
  {
    id: 'tipos-instrumentos-cobranca',
    path: '/tipos-instrumentos-cobranca',
    outputFile: 'tipos-instrumentos-cobranca.json',
  },
  { id: 'fontes-orcamentarias', path: '/fontes-orcamentarias', outputFile: 'fontes-orcamentarias.json' },
] as const;

export const PNCP_GOLDEN_MODALIDADE_ID = 6;
export const PNCP_GOLDEN_MODALIDADE_NAME = 'Pregão - Eletrônico';

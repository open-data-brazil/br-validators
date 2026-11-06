const GITHUB_DOCS_BASE = 'https://github.com/AlexandreZanata/br-validators/blob/main/';

export function resolveCatalogDocUrl(documentacao: string): string {
  if (documentacao.startsWith('http://') || documentacao.startsWith('https://')) {
    return documentacao;
  }
  return `${GITHUB_DOCS_BASE}${documentacao}`;
}

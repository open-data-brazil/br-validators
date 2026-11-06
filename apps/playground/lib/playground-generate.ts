import {
  generate,
  type GenerateOptions,
  type GeneratableDocumentType,
} from '@br-validators/core';
import { generateIeDocument } from './generators/ie';
import { generateTituloEleitorDocument } from './generators/titulo-eleitor';
import { generateTelefoneDocument } from './generators/telefone';
import { applyPlaygroundDisplayMask } from './format-display';
import { DOCUMENT_META } from './document-meta';
import type { GeneratableCardBrand, UfCode } from '@br-validators/core';
import type { DocumentSlug } from './nav';

const CORE_GENERATE_SLUG: Partial<Record<DocumentSlug, GeneratableDocumentType>> = {
  cpf: 'cpf',
  cnpj: 'cnpj',
  cep: 'cep',
  placa: 'placa',
  pis: 'pis-pasep',
  cnh: 'cnh',
  renavam: 'renavam',
  pix: 'pix',
  boleto: 'boleto',
  'boleto-arrecadacao': 'boleto-arrecadacao',
  'nfe-chave': 'nfe-chave',
  brcode: 'brcode',
  'ie-produtor-rural': 'inscricao-estadual-produtor-rural',
};

export type PlaygroundGenerateOptions = {
  seed?: number;
  masked?: boolean;
  format?: string;
  uf?: UfCode;
};

export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647);
}

/** Stable per-slug seed for SSR-safe initial workspace values (avoid hydration mismatch). */
export function workspaceSeedForSlug(slug: DocumentSlug): number {
  let hash = 2_166_136_261;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) || 1;
}

export function supportsValidGeneration(slug: DocumentSlug): boolean {
  return (
    slug in CORE_GENERATE_SLUG ||
    slug === 'ie' ||
    slug === 'titulo-eleitor' ||
    slug === 'telefone' ||
    slug === 'cartao'
  );
}

function resolveCoreFormat(
  slug: DocumentSlug,
  format: string | undefined,
): GenerateOptions['format'] | undefined {
  if (slug === 'placa') {
    return format === 'legacy' ? 'legacy' : 'mercosul';
  }
  if (slug === 'cnpj') {
    return format === 'alphanumeric' ? 'alphanumeric' : 'numeric';
  }
  if (slug === 'telefone') {
    return format === 'fixo' ? 'fixo' : 'celular';
  }
  return format as GenerateOptions['format'] | undefined;
}

export function generateValidDocument(
  slug: DocumentSlug,
  options: PlaygroundGenerateOptions & { masked: boolean },
): string {
  const seed = options.seed ?? randomSeed();

  if (slug === 'ie') {
    if (!options.uf) {
      throw new Error('UF is required for IE generation');
    }
    return generateIeDocument(options.uf, options.masked, seed);
  }

  if (slug === 'titulo-eleitor') {
    if (!options.uf) {
      throw new Error('UF is required for titulo-eleitor generation');
    }
    return generateTituloEleitorDocument(options.uf, options.masked, seed);
  }

  if (slug === 'telefone') {
    if (!options.uf) {
      throw new Error('UF is required for telefone generation');
    }
    const phoneFormat = options.format === 'fixo' ? 'fixo' : 'celular';
    return generateTelefoneDocument(options.uf, phoneFormat, options.masked, seed);
  }

  if (slug === 'cartao') {
    const brand = (options.format ?? 'visa') as GeneratableCardBrand;
    return generate('cartao-credito', { brand, masked: options.masked, seed });
  }

  const type = CORE_GENERATE_SLUG[slug];
  if (!type) {
    throw new Error(`Generate not supported for ${slug}`);
  }

  const coreOptions: GenerateOptions = {
    seed,
    masked: options.masked,
  };

  const resolvedFormat = resolveCoreFormat(slug, options.format);
  if (resolvedFormat) {
    coreOptions.format = resolvedFormat;
  }

  const generated = generate(type, coreOptions);
  return applyPlaygroundDisplayMask(slug, generated, options.masked);
}

/** @deprecated Use generateValidDocument */
export function playgroundGenerate(slug: DocumentSlug, options: PlaygroundGenerateOptions = {}): string {
  return generateValidDocument(slug, {
    ...options,
    masked: options.masked ?? false,
  });
}

export function initialWorkspaceInput(
  slug: DocumentSlug,
  uf: UfCode,
  format?: string,
): string {
  if (!supportsValidGeneration(slug)) {
    return DOCUMENT_META[slug].defaultInput;
  }

  return generateValidDocument(slug, {
    masked: true,
    seed: workspaceSeedForSlug(slug),
    format,
    uf,
  });
}

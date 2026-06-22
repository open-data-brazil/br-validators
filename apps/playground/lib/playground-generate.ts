import {
  BRCODE_GOLDEN_STATIC_EVP,
  BOLETO_GOLDEN_LINHA_MASKED,
  formatInscricaoEstadual,
  formatPixKey,
} from '@br-validators/core';
import {
  generate,
  type GenerateOptions,
  type GeneratableDocumentType,
} from '@br-validators/core';
import { generatePixEvp } from './generators/pix';
import { generateIe } from './generators/ie';
import { DOCUMENT_META } from './document-meta';
import type { UfCode } from '@br-validators/core';
import type { DocumentSlug } from './nav';

const GENERATE_TYPE: Partial<Record<DocumentSlug, GeneratableDocumentType>> = {
  cpf: 'cpf',
  cnpj: 'cnpj',
  cep: 'cep',
  telefone: 'telefone',
  placa: 'placa',
  pis: 'pis-pasep',
  cnh: 'cnh',
  renavam: 'renavam',
  cartao: 'cartao-credito',
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

export function goldenSample(slug: DocumentSlug): string | null {
  const samples: Partial<Record<DocumentSlug, string>> = {
    boleto: BOLETO_GOLDEN_LINHA_MASKED,
    brcode: BRCODE_GOLDEN_STATIC_EVP,
  };
  return samples[slug] ?? null;
}

export function supportsValidGeneration(slug: DocumentSlug): boolean {
  return (
    slug in GENERATE_TYPE ||
    slug === 'pix' ||
    slug === 'ie' ||
    goldenSample(slug) !== null
  );
}

function goldenSampleRaw(slug: DocumentSlug, formatted: string): string {
  if (slug === 'boleto') {
    return formatted.replace(/\D/g, '');
  }
  return formatted;
}

export function generateValidDocument(
  slug: DocumentSlug,
  options: PlaygroundGenerateOptions & { masked: boolean },
): string {
  const seed = options.seed ?? randomSeed();
  const golden = goldenSample(slug);

  if (golden && !(slug in GENERATE_TYPE) && slug !== 'pix' && slug !== 'ie') {
    return options.masked ? golden : goldenSampleRaw(slug, golden);
  }

  if (slug === 'pix') {
    const raw = generatePixEvp();
    if (!options.masked) {
      return raw;
    }
    const formatted = formatPixKey(raw);
    return formatted.ok ? formatted.formatted : raw;
  }

  if (slug === 'ie' && options.uf) {
    const raw = generateIe(options.uf);
    if (!options.masked) {
      return raw;
    }
    const formatted = formatInscricaoEstadual(raw, { uf: options.uf });
    return formatted.ok ? formatted.formatted : raw;
  }

  const type = GENERATE_TYPE[slug];
  if (!type) {
    throw new Error(`Generate not supported for ${slug}`);
  }

  const coreOptions: GenerateOptions = {
    seed,
    masked: options.masked,
  };

  if (options.format) {
    coreOptions.format = options.format as GenerateOptions['format'];
  }

  return generate(type, coreOptions);
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
    seed: randomSeed(),
    format,
    uf,
  });
}

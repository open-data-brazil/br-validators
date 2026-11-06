/** @type {import('next').NextConfig} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const playgroundRoot = fileURLToPath(new URL('.', import.meta.url));
const coreDist = path.join(playgroundRoot, '../../packages/br-validators/dist');
const cliRunCaptured = path.join(playgroundRoot, '../../apps/cli/dist/run-captured.js');

const subpaths = [
  'aeroportos',
  'anp-combustiveis',
  'brcode',
  'boleto',
  'cartao-credito',
  'ean',
  'cep',
  'cbo',
  'cest',
  'cfop',
  'cnaes',
  'cnh',
  'cnpj',
  'cnpj-motivos',
  'cpf',
  'cst',
  'csosn',
  'detect',
  'esocial',
  'feriados',
  'generate',
  'ibge',
  'ibpt',
  'incoterms',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'inss',
  'irpf',
  'iss-municipal',
  'lc116',
  'moedas',
  'natureza-juridica',
  'nbs',
  'ncm',
  'nfe-chave',
  'nfe-cuf',
  'paises-bacen',
  'pis-pasep',
  'pncp-reference',
  'portos',
  'cnis',
  'pix',
  'placa',
  'renavam',
  'sanitize',
  'selic',
  'simples-nacional',
  'telefone',
  'titulo-eleitor',
  'transparencia-snapshots',
  'tse-municipios',
  'ptax',
  'bancos',
  'data-catalog',
];

const nextConfig = {
  webpack: (config) => {
    const alias =
      config.resolve.alias instanceof Array
        ? Object.fromEntries(
            config.resolve.alias.flatMap((entry) => {
              if (typeof entry === 'object' && entry !== null && 'name' in entry && 'alias' in entry) {
                return [[entry.name, entry.alias]];
              }
              return [];
            }),
          )
        : { ...(config.resolve.alias ?? {}) };

    alias['@br-validators/core$'] = path.join(coreDist, 'index.js');
    alias['@playground/cli-run-captured'] = cliRunCaptured;
    alias['node:fs'] = path.join(playgroundRoot, 'lib/cli/stubs/fs.ts');
    alias.fs = path.join(playgroundRoot, 'lib/cli/stubs/fs.ts');
    alias['node:module'] = path.join(playgroundRoot, 'lib/cli/stubs/module.ts');
    alias.module = path.join(playgroundRoot, 'lib/cli/stubs/module.ts');
    for (const subpath of subpaths) {
      alias[`@br-validators/core/${subpath}$`] = path.join(coreDist, `${subpath}.js`);
    }

    config.resolve.alias = alias;
    return config;
  },
};

export default nextConfig;

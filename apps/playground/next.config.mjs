/** @type {import('next').NextConfig} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const playgroundRoot = fileURLToPath(new URL('.', import.meta.url));
const coreDist = path.join(playgroundRoot, '../../packages/br-validators/dist');
const cliRunCaptured = path.join(playgroundRoot, '../../apps/cli/dist/run-captured.js');

const subpaths = [
  'brcode',
  'boleto',
  'cartao-credito',
  'cep',
  'cnh',
  'cnpj',
  'cpf',
  'detect',
  'generate',
  'inscricao-estadual',
  'inscricao-estadual-produtor-rural',
  'nfe-chave',
  'pis-pasep',
  'pix',
  'placa',
  'renavam',
  'sanitize',
  'telefone',
  'titulo-eleitor',
];

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@br-validators/core'] = path.join(coreDist, 'index.js');
    config.resolve.alias['@playground/cli-run-captured'] = cliRunCaptured;
    config.resolve.alias['node:fs'] = path.join(playgroundRoot, 'lib/cli/stubs/fs.ts');
    for (const subpath of subpaths) {
      config.resolve.alias[`@br-validators/core/${subpath}`] = path.join(coreDist, `${subpath}.js`);
    }
    return config;
  },
};

export default nextConfig;

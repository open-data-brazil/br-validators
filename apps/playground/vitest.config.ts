import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const playgroundRoot = fileURLToPath(new URL('.', import.meta.url));
const coreDist = path.join(playgroundRoot, '../../packages/br-validators/dist');
const cliRunCaptured = path.join(playgroundRoot, '../cli/dist/run-captured.js');

const coreSubpaths = [
  'ibge',
  'bancos',
  'data-catalog',
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

const coreAliases = coreSubpaths.map((subpath) => ({
  find: `@br-validators/core/${subpath}`,
  replacement: path.join(coreDist, `${subpath}.js`),
}));

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: playgroundRoot },
      { find: '@playground/cli-run-captured', replacement: cliRunCaptured },
      ...coreAliases,
      { find: '@br-validators/core', replacement: path.join(coreDist, 'index.js') },
    ],
  },
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});

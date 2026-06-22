/** @type {import('next').NextConfig} */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const coreDist = path.join(
  fileURLToPath(new URL('.', import.meta.url)),
  '../../packages/br-validators/dist',
);

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@br-validators/core'] = path.join(coreDist, 'index.js');
    config.resolve.alias['@br-validators/core/brcode'] = path.join(coreDist, 'brcode.js');
    config.resolve.alias['@br-validators/core/cnpj'] = path.join(coreDist, 'cnpj.js');
    config.resolve.alias['@br-validators/core/cpf'] = path.join(coreDist, 'cpf.js');
    config.resolve.alias['@br-validators/core/cep'] = path.join(coreDist, 'cep.js');
    config.resolve.alias['@br-validators/core/telefone'] = path.join(coreDist, 'telefone.js');
    config.resolve.alias['@br-validators/core/pix'] = path.join(coreDist, 'pix.js');
    config.resolve.alias['@br-validators/core/boleto'] = path.join(coreDist, 'boleto.js');
    config.resolve.alias['@br-validators/core/placa'] = path.join(coreDist, 'placa.js');
    config.resolve.alias['@br-validators/core/pis-pasep'] = path.join(coreDist, 'pis-pasep.js');
    config.resolve.alias['@br-validators/core/cartao-credito'] = path.join(coreDist, 'cartao-credito.js');
    config.resolve.alias['@br-validators/core/inscricao-estadual'] = path.join(
      coreDist,
      'inscricao-estadual.js',
    );
    return config;
  },
};

export default nextConfig;

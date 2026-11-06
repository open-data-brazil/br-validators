import { formatCartaoCredito } from '../format/cartao-credito.js';
import { formatCep } from '../format/cep.js';
import { formatCnh } from '../format/cnh.js';
import { formatCnpj } from '../format/cnpj.js';
import { formatCpf } from '../format/cpf.js';
import { formatBoleto } from '../format/boleto.js';
import { formatIeProdutorRural } from '../format/inscricao-estadual-produtor-rural.js';
import { formatNfeChave } from '../format/nfe-chave.js';
import { formatPisPasep } from '../format/pis-pasep.js';
import { formatPlaca } from '../format/placa.js';
import { formatPixKey } from '../format/pix.js';
import { formatRenavam } from '../format/renavam.js';
import { formatTelefone } from '../format/telefone.js';
import { formatTituloEleitor } from '../format/titulo-eleitor.js';
import type { GeneratableDocumentType } from './index.js';

export function applyMask(type: GeneratableDocumentType, value: string): string {
  switch (type) {
    case 'cpf': {
      const result = formatCpf(value);
      return result.ok ? result.formatted : value;
    }
    case 'cnpj': {
      const result = formatCnpj(value);
      return result.ok ? result.formatted : value;
    }
    case 'cep': {
      const result = formatCep(value);
      return result.ok ? result.formatted : value;
    }
    case 'placa': {
      const result = formatPlaca(value);
      return result.ok ? result.formatted : value;
    }
    case 'pis-pasep': {
      const result = formatPisPasep(value);
      return result.ok ? result.formatted : value;
    }
    case 'renavam': {
      const result = formatRenavam(value);
      return result.ok ? result.formatted : value;
    }
    case 'cnh': {
      const result = formatCnh(value);
      return result.ok ? result.formatted : value;
    }
    case 'telefone': {
      const result = formatTelefone(value);
      return result.ok ? result.formatted : value;
    }
    case 'cartao-credito': {
      const result = formatCartaoCredito(value);
      return result.ok ? result.formatted : value;
    }
    case 'inscricao-estadual':
      return value;
    case 'titulo-eleitor': {
      const result = formatTituloEleitor(value);
      return result.ok ? result.formatted : value;
    }
    case 'pix': {
      const result = formatPixKey(value);
      return result.ok ? result.formatted : value;
    }
    case 'nfe-chave': {
      const result = formatNfeChave(value);
      return result.ok ? result.formatted : value;
    }
    case 'boleto': {
      const result = formatBoleto(value);
      return result.ok ? result.formatted : value;
    }
    case 'boleto-arrecadacao':
      return value;
    case 'brcode':
      return value;
    case 'inscricao-estadual-produtor-rural': {
      const result = formatIeProdutorRural(value);
      return result.ok ? result.formatted : value;
    }
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

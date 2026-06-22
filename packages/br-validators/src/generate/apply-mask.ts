import { formatCartaoCredito } from '../format/cartao-credito.js';
import { formatCep } from '../format/cep.js';
import { formatCnh } from '../format/cnh.js';
import { formatCnpj } from '../format/cnpj.js';
import { formatCpf } from '../format/cpf.js';
import { formatPisPasep } from '../format/pis-pasep.js';
import { formatPlaca } from '../format/placa.js';
import { formatRenavam } from '../format/renavam.js';
import { formatTelefone } from '../format/telefone.js';
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
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

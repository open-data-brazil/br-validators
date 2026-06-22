export {
  createBrRule,
  createBrResolver,
  type BrRuleOptions,
  type BrValidateFn,
  type BrValidateResult,
} from './create-br-adapter.js';

export { cpfRule, cpfResolver } from './cpf.js';
export { cnpjRule, cnpjResolver } from './cnpj.js';
export { cepRule, cepResolver } from './cep.js';
export { telefoneRule, telefoneResolver } from './telefone.js';
export { placaRule, placaResolver } from './placa.js';
export { pisPasepRule, pisRule, pisPasepResolver, pisResolver } from './pis-pasep.js';
export {
  pixKeyRule,
  createPixKeyRule,
  pixKeyResolver,
  createPixKeyResolver,
} from './pix.js';
export {
  boletoRule,
  createBoletoRule,
  boletoResolver,
  createBoletoResolver,
} from './boleto.js';
export { cartaoCreditoRule, cartaoCreditoResolver } from './cartao-credito.js';
export {
  createInscricaoEstadualRule,
  inscricaoEstadualSpRule,
  createInscricaoEstadualResolver,
  inscricaoEstadualSpResolver,
  type UfCode,
} from './inscricao-estadual.js';

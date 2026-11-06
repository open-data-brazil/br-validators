import {
  BOLETO_GOLDEN_LINHA_STRIPPED,
  BRCODE_GOLDEN_STATIC_EVP,
  CNH_GOLDEN_PRIMARY,
  CNPJ_GOLDEN_NUMERIC,
  CPF_GOLDEN_PRIMARY,
  IE_SP_GOLDEN,
  IE_SP_RURAL_GOLDEN,
  NFE_CHAVE_GOLDEN_PRIMARY,
  PIX_GOLDEN_EVP,
  PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
  RENAVAM_GOLDEN_PRIMARY,
  RG_SP_GOLDEN,
  TITULO_ELEITOR_GOLDEN_PRIMARY,
} from '@br-validators/core';
import type {
  BrValidateNext,
  BrValidateRequest,
  BrValidateResponse,
} from '../src/types.js';

export const GOLDEN = {
  cpf: CPF_GOLDEN_PRIMARY,
  cnpj: CNPJ_GOLDEN_NUMERIC,
  ie: IE_SP_GOLDEN,
  ieRural: IE_SP_RURAL_GOLDEN,
  rg: RG_SP_GOLDEN,
  pix: PIX_GOLDEN_EVP,
  boleto: BOLETO_GOLDEN_LINHA_STRIPPED,
  nfe: NFE_CHAVE_GOLDEN_PRIMARY,
  titulo: TITULO_ELEITOR_GOLDEN_PRIMARY,
  brcode: BRCODE_GOLDEN_STATIC_EVP,
  cnh: CNH_GOLDEN_PRIMARY,
  renavam: RENAVAM_GOLDEN_PRIMARY,
  processo: PROCESSO_JUDICIAL_GOLDEN_PRIMARY,
} as const;

export function createMockResponse() {
  let statusCode = 200;
  let payload: object | undefined;
  const res: BrValidateResponse = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(body: object) {
      payload = body;
    },
  };
  return {
    res,
    getStatus: () => statusCode,
    getPayload: () => payload,
  };
}

export function runHandler(
  handler: (req: BrValidateRequest, res: BrValidateResponse, next: BrValidateNext) => void,
  req: BrValidateRequest,
) {
  const { res, getStatus, getPayload } = createMockResponse();
  let nextCalled = false;
  handler(req, res, () => {
    nextCalled = true;
  });
  return { statusCode: getStatus(), payload: getPayload(), nextCalled };
}

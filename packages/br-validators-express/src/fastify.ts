import { createBrValidateHandler } from './br-validate.js';
import type { BrValidateOptions, BrValidateRequest } from './types.js';

export type FastifyBrValidateReply = {
  status(code: number): FastifyBrValidateReply;
  send(body: object): unknown;
};

type FastifyLikeRequest = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

function asRequestObject(value: unknown): object | undefined {
  if (typeof value === 'object' && value !== null) {
    return value;
  }
  return undefined;
}

export function toBrValidateRequest(request: FastifyLikeRequest): BrValidateRequest {
  return {
    body: asRequestObject(request.body),
    query: asRequestObject(request.query),
    params: asRequestObject(request.params),
  };
}

/**
 * Fastify preHandler — same schema as Express `brValidate()`.
 */
export function brValidateFastify(options: BrValidateOptions) {
  const handler = createBrValidateHandler(options);
  return (request: FastifyLikeRequest, reply: FastifyBrValidateReply, done: () => void): void => {
    let statusCode = 200;
    const adaptedReply = {
      status(code: number) {
        statusCode = code;
        reply.status(code);
        return adaptedReply;
      },
      json(body: object) {
        void reply.status(statusCode).send(body);
      },
    };
    handler(toBrValidateRequest(request), adaptedReply, done);
  };
}

export { createBrValidateHandler } from './br-validate.js';
export type { BrValidateOptions, BrValidationErrorResponse, BrValidatorTypeId } from './types.js';

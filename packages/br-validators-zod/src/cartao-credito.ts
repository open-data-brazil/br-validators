import { validateCartaoCredito } from '@br-validators/core/cartao-credito';
import type { CardBrand, CartaoCreditoValidationResult } from '@br-validators/core';
import { createBrStringSchema } from './create-schema.js';

export type CartaoCreditoSchemaOutput = { value: string; brand: CardBrand };

type CartaoSuccess = Extract<CartaoCreditoValidationResult, { ok: true }>;

export const cartaoCreditoSchema = createBrStringSchema<CartaoSuccess, CartaoCreditoSchemaOutput>(
  validateCartaoCredito,
  (success) => ({
    value: success.value,
    brand: success.brand,
  }),
);

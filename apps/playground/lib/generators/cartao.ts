import { generate, type GeneratableCardBrand } from '@br-validators/core';

export function generateCreditCard(brand: GeneratableCardBrand, masked: boolean, seed?: number): string {
  return generate('cartao-credito', {
    brand,
    masked,
    seed,
  });
}

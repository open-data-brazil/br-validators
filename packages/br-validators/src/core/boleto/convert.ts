/**
 * Linha digitável ↔ código de barras conversion (Anexo V §2.3.4).
 * @see BR-BOLETO-006
 */
import { computeModulo10FieldDv } from './modulo10.js';
import {
  BOLETO_CODIGO_BARRAS_LENGTH,
  BOLETO_LINHA_LENGTH,
} from './constants.js';

export function convertLinhaToCodigoBarrasDigits(strippedLinha: string): string {
  return (
    strippedLinha.slice(0, 4) +
    strippedLinha[32] +
    strippedLinha.slice(33, BOLETO_LINHA_LENGTH) +
    strippedLinha.slice(4, 9) +
    strippedLinha.slice(10, 20) +
    strippedLinha.slice(21, 31)
  );
}

export function convertCodigoBarrasToLinhaDigits(barcode: string): string {
  const field1 = barcode.slice(0, 4) + barcode.slice(19, 24);
  const field2 = barcode.slice(24, 34);
  const field3 = barcode.slice(34, BOLETO_CODIGO_BARRAS_LENGTH);
  const field5 = barcode.slice(5, 9) + barcode.slice(9, 19);
  const dv1 = String(computeModulo10FieldDv(field1));
  const dv2 = String(computeModulo10FieldDv(field2));
  const dv3 = String(computeModulo10FieldDv(field3));
  return field1 + dv1 + field2 + dv2 + field3 + dv3 + barcode[4] + field5;
}

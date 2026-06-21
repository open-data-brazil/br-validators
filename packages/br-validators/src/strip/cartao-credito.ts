/**
 * Strip credit card PAN mask — digits only (BR-LUHN-001).
 * @see https://www.iso.org/standard/70484.html
 */
export function stripCartaoCredito(input: string): string {
  return input.replace(/\D/g, '');
}

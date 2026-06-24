/**
 * Strip CNJ process number mask — keep digits only.
 */
export function stripProcessoJudicial(input: string): string {
  return input.replace(/\D/g, '');
}

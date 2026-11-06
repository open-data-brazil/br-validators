/**
 * Alphanumeric CPF generation stub — RFB spec not published (BR-GENERATE-001).
 * @see docs/OFFICIAL-SOURCES.md — CPF row (alphanumeric planned 2026)
 */
export const CPF_ALPHA_GENERATE_STUB = {
  ok: false as const,
  code: 'CPF_ALPHA_SPEC_PENDING' as const,
  message:
    'Alphanumeric CPF generation is pending official RFB specification — numeric CPF only until published',
};

export function rejectCpfAlphanumericGenerate(): typeof CPF_ALPHA_GENERATE_STUB {
  return CPF_ALPHA_GENERATE_STUB;
}

export function assertCpfAlphanumericGenerateAllowed(): void {
  throw new Error(`${CPF_ALPHA_GENERATE_STUB.code}: ${CPF_ALPHA_GENERATE_STUB.message}`);
}

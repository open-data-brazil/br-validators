/**
 * PIX key display masks — delegates to parent validators where applicable (BR-PIX-001…005).
 * @see docs/use-cases/UC-003-format-document.md
 */
import { applyCnpjMask } from '../cnpj/mask.js';
import { applyCpfMask } from '../cpf/mask.js';

export function applyPixCpfKeyMask(canonical: string): string {
  return applyCpfMask(canonical);
}

export function applyPixCnpjKeyMask(canonical: string): string {
  return applyCnpjMask(canonical);
}

/** Brazilian mobile E.164 → +55 (DD) 9XXXX-XXXX display. */
export function applyPixPhoneKeyMask(e164: string): string {
  const match = /^\+55(\d{2})(9\d{4})(\d{4})$/.exec(e164);
  if (!match) {
    throw new Error('PIX phone key must be a validated Brazilian mobile E.164 number');
  }
  return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
}

export function applyPixEmailKeyMask(email: string): string {
  return email.toLowerCase().trim();
}

export function applyPixEvpKeyMask(uuid: string): string {
  return uuid.toLowerCase();
}

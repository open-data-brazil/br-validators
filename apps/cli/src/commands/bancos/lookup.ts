import {
  BANCOS_DATA_VERSION,
  getBancoPorCodigo,
  getBancoPorIspb,
  type Banco,
} from '@br-validators/core/bancos';
import { EXIT } from '../../constants.js';

export type BancosLookupOptions = {
  json: boolean;
  verbose: boolean;
};

export function normalizeBancosLookupInput(
  raw: string,
): { kind: 'codigo'; value: string } | { kind: 'ispb'; value: string } | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 8) {
    return { kind: 'ispb', value: digits.padStart(8, '0') };
  }
  if (digits.length >= 1 && digits.length <= 3) {
    return { kind: 'codigo', value: digits.padStart(3, '0').slice(-3) };
  }
  return null;
}

export function lookupBanco(raw: string): Banco | undefined {
  const normalized = normalizeBancosLookupInput(raw);
  if (!normalized) {
    return undefined;
  }
  return normalized.kind === 'ispb'
    ? getBancoPorIspb(normalized.value)
    : getBancoPorCodigo(normalized.value);
}

export function formatBancoHuman(banco: Banco): string {
  return `${banco.codigo} — ${banco.nome} (ISPB ${banco.ispb})`;
}

export function runBancosLookupCommand(
  input: string,
  options: BancosLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const normalized = normalizeBancosLookupInput(input);
  if (!normalized) {
    io.stderr.push('Invalid bank code or ISPB. Use 3-digit COMPE (e.g. 001) or 8-digit ISPB.');
    return EXIT.USAGE;
  }

  const banco = lookupBanco(input);
  if (!banco) {
    io.stderr.push(`Bank not found: ${input}`);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: { ok: true; banco: Banco; capturadoEm?: string } = { ok: true, banco };
    if (options.verbose) {
      payload.capturadoEm = BANCOS_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatBancoHuman(banco));
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${BANCOS_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runBancosLookup(
  value: string | undefined,
  options: BancosLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!value?.trim()) {
    io.stderr.push('Missing bank code or ISPB. Pass COMPE (001) or ISPB (8 digits).');
    return EXIT.USAGE;
  }
  return runBancosLookupCommand(value.trim(), options, io);
}

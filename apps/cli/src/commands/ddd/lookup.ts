import {
  getDddInfo,
  TELEFONE_DDD_DATA_VERSION,
  type DddInfo,
} from '@br-validators/core/telefone';
import { EXIT } from '../../constants.js';

export type DddLookupOptions = {
  json: boolean;
  verbose: boolean;
};

function normalizeDdd(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) {
    return null;
  }
  return digits.padStart(2, '0').slice(-2);
}

export function lookupDdd(raw: string): DddInfo | undefined {
  const ddd = normalizeDdd(raw);
  if (ddd === null) {
    return undefined;
  }
  return getDddInfo(ddd);
}

export function formatDddHuman(info: DddInfo): string {
  const municipios = info.municipios.slice(0, 3).join(', ');
  const suffix = info.municipios.length > 3 ? '…' : '';
  return `DDD ${info.ddd} — ${info.uf} / ${info.regiao} — ${municipios}${suffix}`;
}

export function runDddLookupCommand(
  input: string,
  options: DddLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const ddd = normalizeDdd(input);
  if (ddd === null) {
    io.stderr.push('Invalid DDD. Use 2 digits (e.g. 11).');
    return EXIT.USAGE;
  }

  const info = getDddInfo(ddd);
  if (!info) {
    io.stderr.push(`DDD not found: ${input}`);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: { ok: true; ddd: DddInfo; capturadoEm?: string } = {
      ok: true,
      ddd: info,
    };
    if (options.verbose) {
      payload.capturadoEm = TELEFONE_DDD_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatDddHuman(info));
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${TELEFONE_DDD_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runDddLookup(
  value: string | undefined,
  options: DddLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!value?.trim()) {
    io.stderr.push('Missing DDD code. Pass 2 digits (e.g. 11).');
    return EXIT.USAGE;
  }
  return runDddLookupCommand(value.trim(), options, io);
}

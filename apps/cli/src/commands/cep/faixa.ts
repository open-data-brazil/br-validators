import {
  CEP_FAIXA_DATA_VERSION,
  getCepFaixaInfo,
  type CepFaixa,
} from '@br-validators/core/cep';
import { EXIT } from '../../constants.js';

export type CepFaixaOptions = {
  json: boolean;
  verbose: boolean;
};

function normalizePrefix(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 5) {
    return null;
  }
  return digits.slice(0, 5);
}

export function lookupCepFaixa(raw: string): CepFaixa | undefined {
  const prefix = normalizePrefix(raw);
  if (prefix === null) {
    return undefined;
  }
  return getCepFaixaInfo(prefix);
}

export function formatCepFaixaHuman(faixa: CepFaixa): string {
  return `${faixa.prefixo} — ${faixa.cidade} (${faixa.uf}) · IBGE ${faixa.codigoIbge}`;
}

export function runCepFaixaCommand(
  input: string,
  options: CepFaixaOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const prefix = normalizePrefix(input);
  if (prefix === null) {
    io.stderr.push('Invalid CEP prefix. Use at least 5 digits (e.g. 01310).');
    return EXIT.USAGE;
  }

  const faixa = getCepFaixaInfo(prefix);
  if (!faixa) {
    io.stderr.push(`CEP prefix not found: ${input}`);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: { ok: true; faixa: CepFaixa; capturadoEm?: string } = {
      ok: true,
      faixa,
    };
    if (options.verbose) {
      payload.capturadoEm = CEP_FAIXA_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatCepFaixaHuman(faixa));
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${CEP_FAIXA_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runCepFaixa(
  value: string | undefined,
  options: CepFaixaOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!value?.trim()) {
    io.stderr.push('Missing CEP prefix. Pass at least 5 digits.');
    return EXIT.USAGE;
  }
  return runCepFaixaCommand(value.trim(), options, io);
}

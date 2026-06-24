import {
  getMunicipioPorCodigo,
  IBGE_DATA_VERSION,
  type Municipio,
} from '@br-validators/core/ibge';
import { EXIT } from '../../constants.js';

export type IbgeLookupOptions = {
  json: boolean;
  verbose: boolean;
};

export function normalizeIbgeMunicipioCode(raw: string): number | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 7) {
    return null;
  }
  return Number(digits);
}

export function lookupMunicipio(raw: string): Municipio | undefined {
  const codigo = normalizeIbgeMunicipioCode(raw);
  if (codigo === null) {
    return undefined;
  }
  return getMunicipioPorCodigo(codigo);
}

export function formatMunicipioHuman(municipio: Municipio): string {
  return `${municipio.codigo} — ${municipio.nome} (${municipio.uf})`;
}

export function runIbgeLookupCommand(
  input: string,
  options: IbgeLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const codigo = normalizeIbgeMunicipioCode(input);
  if (codigo === null) {
    io.stderr.push('Invalid IBGE municipality code. Use 7 digits (e.g. 3550308).');
    return EXIT.USAGE;
  }

  const municipio = getMunicipioPorCodigo(codigo);
  if (!municipio) {
    io.stderr.push(`Municipality not found: ${input}`);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: { ok: true; municipio: Municipio; capturadoEm?: string } = {
      ok: true,
      municipio,
    };
    if (options.verbose) {
      payload.capturadoEm = IBGE_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatMunicipioHuman(municipio));
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${IBGE_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runIbgeLookup(
  value: string | undefined,
  options: IbgeLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!value?.trim()) {
    io.stderr.push('Missing IBGE municipality code. Pass a 7-digit code.');
    return EXIT.USAGE;
  }
  return runIbgeLookupCommand(value.trim(), options, io);
}

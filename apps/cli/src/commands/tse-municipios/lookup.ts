import {
  getCodigosTsePorMunicipio,
  getMunicipioIbgePorCodigoTse,
  TSE_MUNICIPIOS_DATA_VERSION,
} from '@br-validators/core/tse-municipios';
import { getMunicipioPorCodigo } from '@br-validators/core/ibge';
import { EXIT } from '../../constants.js';

export type TseMunicipiosLookupOptions = {
  json: boolean;
  verbose: boolean;
};

export type TseLookupResult =
  | { kind: 'tse-to-ibge'; codigoTse: string; ibgeCodigo: number }
  | { kind: 'ibge-to-tse'; ibgeCodigo: number; codigosTse: readonly string[] };

function normalizeTseInput(raw: string): { kind: 'tse'; value: string } | { kind: 'ibge'; value: number } | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 5) {
    return { kind: 'tse', value: digits.padStart(5, '0') };
  }
  if (digits.length === 7) {
    return { kind: 'ibge', value: Number(digits) };
  }
  return null;
}

export function lookupTseMunicipio(raw: string): TseLookupResult | undefined {
  const normalized = normalizeTseInput(raw);
  if (!normalized) {
    return undefined;
  }

  if (normalized.kind === 'tse') {
    const ibgeCodigo = getMunicipioIbgePorCodigoTse(normalized.value);
    if (ibgeCodigo === undefined) {
      return undefined;
    }
    return { kind: 'tse-to-ibge', codigoTse: normalized.value, ibgeCodigo };
  }

  const codigosTse = getCodigosTsePorMunicipio(normalized.value);
  if (codigosTse.length === 0) {
    return undefined;
  }
  return { kind: 'ibge-to-tse', ibgeCodigo: normalized.value, codigosTse };
}

export function formatTseLookupHuman(result: TseLookupResult): string {
  if (result.kind === 'tse-to-ibge') {
    const municipio = getMunicipioPorCodigo(result.ibgeCodigo);
    const name = municipio ? `${municipio.nome} (${municipio.uf})` : String(result.ibgeCodigo);
    return `TSE ${result.codigoTse} → IBGE ${result.ibgeCodigo} — ${name}`;
  }
  const municipio = getMunicipioPorCodigo(result.ibgeCodigo);
  const name = municipio ? `${municipio.nome} (${municipio.uf})` : String(result.ibgeCodigo);
  return `IBGE ${result.ibgeCodigo} — ${name} → TSE ${result.codigosTse.join(', ')}`;
}

export function runTseMunicipiosLookupCommand(
  input: string,
  options: TseMunicipiosLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const normalized = normalizeTseInput(input);
  if (!normalized) {
    io.stderr.push('Invalid code. Use 5-digit TSE or 7-digit IBGE municipality code.');
    return EXIT.USAGE;
  }

  const result = lookupTseMunicipio(input);
  if (!result) {
    io.stderr.push(`Mapping not found: ${input}`);
    return EXIT.INVALID;
  }

  if (options.json) {
    const payload: { ok: true; mapping: TseLookupResult; capturadoEm?: string } = {
      ok: true,
      mapping: result,
    };
    if (options.verbose) {
      payload.capturadoEm = TSE_MUNICIPIOS_DATA_VERSION.capturadoEm;
    }
    io.stdout.push(JSON.stringify(payload, null, 2));
    return EXIT.OK;
  }

  io.stdout.push(formatTseLookupHuman(result));
  if (options.verbose) {
    io.stdout.push(`capturadoEm: ${TSE_MUNICIPIOS_DATA_VERSION.capturadoEm}`);
  }
  return EXIT.OK;
}

export function runTseMunicipiosLookup(
  value: string | undefined,
  options: TseMunicipiosLookupOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (!value?.trim()) {
    io.stderr.push('Missing code. Pass a 5-digit TSE or 7-digit IBGE municipality code.');
    return EXIT.USAGE;
  }
  return runTseMunicipiosLookupCommand(value.trim(), options, io);
}

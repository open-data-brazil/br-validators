import {
  formatIeProdutorRural,
  formatInscricaoEstadual,
  getIeOfficialSourceUrl,
  getIeProdutorRuralOfficialSourceUrl,
  IE_SUPPORTED_UFS,
  isSpRuralIeInput,
  stripIeSpRural,
  stripInscricaoEstadual,
  validateIeProdutorRural,
  validateInscricaoEstadual,
  type IeProdutorRuralValidationResult,
  type InscricaoEstadualValidationResult,
  type UfCode,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat, printStrip } from '../output.js';

export type IeAction = 'validate' | 'format' | 'strip';

export type IeOptions = {
  json: boolean;
  quiet: boolean;
  source: boolean;
  uf?: string;
  file?: string;
};

export type IeValidationResult = InscricaoEstadualValidationResult | IeProdutorRuralValidationResult;

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

export function resolveUf(uf: string | undefined): UfCode | null {
  if (uf === undefined) {
    return null;
  }
  const normalized = uf.toUpperCase();
  if ((IE_SUPPORTED_UFS as readonly string[]).includes(normalized)) {
    return normalized as UfCode;
  }
  return null;
}

export function isSpRuralRoute(uf: UfCode, input: string): boolean {
  return uf === 'SP' && isSpRuralIeInput(input);
}

export function printIeValidation(
  result: IeValidationResult,
  options: { json: boolean; quiet: boolean; source?: string; rural?: boolean },
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(
      JSON.stringify(
        result.ok
          ? {
              ok: true,
              value: result.value,
              uf: result.uf,
              format: result.format,
              ...(options.rural ? { produtorRural: true } : {}),
              ...(options.source ? { source: options.source } : {}),
            }
          : {
              ok: false,
              code: result.code,
              message: result.message,
              ...(result.uf ? { uf: result.uf } : {}),
            },
        null,
        2,
      ),
    );
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (options.quiet) {
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (result.ok) {
    io.stdout.push(`valid: yes (${result.uf})`);
    if (options.rural) {
      io.stdout.push('kind: produtor-rural');
    }
    io.stdout.push(`value: ${result.value}`);
    io.stdout.push(`format: ${result.format}`);
    if (options.source) {
      io.stdout.push(`source: ${options.source}`);
    }
    return EXIT.OK;
  }

  io.stderr.push('valid: no');
  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  if (result.uf) {
    io.stderr.push(`uf: ${result.uf}`);
  }
  return EXIT.INVALID;
}

export function runIeCommand(
  action: IeAction,
  input: string,
  options: IeOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const uf = resolveUf(options.uf);
  if (!uf) {
    io.stderr.push(`Missing or invalid --uf. Use one of: ${IE_SUPPORTED_UFS.join(', ')}.`);
    return EXIT.USAGE;
  }

  const rural = isSpRuralRoute(uf, input);
  const source = options.source
    ? rural
      ? getIeProdutorRuralOfficialSourceUrl()
      : getIeOfficialSourceUrl(uf)
    : undefined;

  switch (action) {
    case 'validate':
      return printIeValidation(
        rural ? validateIeProdutorRural(uf, input) : validateInscricaoEstadual(input, { uf }),
        { json: options.json, quiet: options.quiet, source, rural },
        io,
      );
    case 'format':
      return printFormat(
        rural ? formatIeProdutorRural(input) : formatInscricaoEstadual(input, { uf }),
        { json: options.json, quiet: options.quiet },
        io,
      );
    case 'strip':
      return printStrip(rural ? stripIeSpRural(input) : stripInscricaoEstadual(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runIe(
  action: IeAction,
  value: string | undefined,
  options: IeOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing IE value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runIeCommand(action, input, options, io);
}

import {
  RG_SUPPORTED_UFS,
  formatRg,
  getRgOfficialSourceUrl,
  stripRg,
  validateRg,
  type RgUfCode,
  type RgValidationResult,
} from '@br-validators/core/rg';
import { EXIT } from '../constants.js';
import { printFormat, printStrip } from '../output.js';

export type RgAction = 'validate' | 'format' | 'strip';

export type RgOptions = {
  json: boolean;
  quiet: boolean;
  source: boolean;
  uf?: string;
  file?: string;
};

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

export function resolveRgUf(uf: string | undefined): RgUfCode | null {
  if (uf === undefined) {
    return null;
  }
  const normalized = uf.toUpperCase();
  if ((RG_SUPPORTED_UFS as readonly string[]).includes(normalized)) {
    return normalized as RgUfCode;
  }
  return null;
}

export function printRgValidation(
  result: RgValidationResult,
  options: { json: boolean; quiet: boolean; source?: string },
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
              checkDigitValidated: result.checkDigitValidated,
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
    io.stdout.push(`checkDigitValidated: ${result.checkDigitValidated ? 'yes' : 'no'}`);
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

export function runRgCommand(
  action: RgAction,
  input: string,
  options: RgOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const uf = resolveRgUf(options.uf);
  if (!uf) {
    io.stderr.push(`Missing or invalid --uf. Use one of: ${RG_SUPPORTED_UFS.join(', ')}.`);
    return EXIT.USAGE;
  }

  const source = options.source ? getRgOfficialSourceUrl(uf) : undefined;

  switch (action) {
    case 'validate':
      return printRgValidation(validateRg(input, { uf }), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatRg(input, { uf }), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripRg(input, { uf }), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runRg(
  action: RgAction,
  value: string | undefined,
  options: RgOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing RG value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runRgCommand(action, input, options, io);
}

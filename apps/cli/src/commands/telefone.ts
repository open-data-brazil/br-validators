import {
  TELEFONE_OFFICIAL_SOURCE_URL,
  formatTelefone,
  stripTelefone,
  validateTelefone,
  type TelefoneValidationResult,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat, printStrip } from '../output.js';

export type TelefoneAction = 'validate' | 'format' | 'strip';

export type TelefoneOptions = {
  json: boolean;
  quiet: boolean;
  source: boolean;
  file?: string;
};

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

export function printTelefoneValidation(
  result: TelefoneValidationResult,
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
              tipo: result.tipo,
              format: result.format,
              ...(options.source ? { source: options.source } : {}),
            }
          : { ok: false, code: result.code, message: result.message },
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
    io.stdout.push(`valid: yes (${result.tipo})`);
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
  return EXIT.INVALID;
}

export function runTelefoneCommand(
  action: TelefoneAction,
  input: string,
  options: TelefoneOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? TELEFONE_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printTelefoneValidation(validateTelefone(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatTelefone(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripTelefone(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runTelefone(
  action: TelefoneAction,
  value: string | undefined,
  options: TelefoneOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing telephone value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runTelefoneCommand(action, input, options, io);
}

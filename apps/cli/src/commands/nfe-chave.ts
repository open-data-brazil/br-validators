import {
  NFE_CHAVE_OFFICIAL_SOURCE_URL,
  formatNfeChave,
  parseNfeChave,
  stripNfeChave,
  validateNfeChave,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat, printNfeChaveValidation, printStrip, printValidation } from '../output.js';

export type NfeChaveAction = 'validate' | 'parse' | 'format' | 'strip';

export type NfeChaveOptions = {
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

export function runNfeChaveCommand(
  action: NfeChaveAction,
  input: string,
  options: NfeChaveOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? NFE_CHAVE_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validateNfeChave(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'parse':
      return printNfeChaveValidation(parseNfeChave(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatNfeChave(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripNfeChave(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runNfeChave(
  action: NfeChaveAction,
  value: string | undefined,
  options: NfeChaveOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing NF-e chave de acesso value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runNfeChaveCommand(action, input, options, io);
}

import {
  CNH_OFFICIAL_SOURCE_URL,
  formatCnh,
  stripCnh,
  validateCnh,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat, printStrip, printValidation } from '../output.js';

export type CnhAction = 'validate' | 'format' | 'strip';

export type CnhOptions = {
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

export function runCnhCommand(
  action: CnhAction,
  input: string,
  options: CnhOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? CNH_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validateCnh(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatCnh(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripCnh(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runCnh(
  action: CnhAction,
  value: string | undefined,
  options: CnhOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing CNH value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runCnhCommand(action, input, options, io);
}

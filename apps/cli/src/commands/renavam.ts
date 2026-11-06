import {
  RENAVAM_OFFICIAL_SOURCE_URL,
  formatRenavam,
  stripRenavam,
  validateRenavam,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat, printStrip, printValidation } from '../output.js';

export type RenavamAction = 'validate' | 'format' | 'strip';

export type RenavamOptions = {
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

export function runRenavamCommand(
  action: RenavamAction,
  input: string,
  options: RenavamOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? RENAVAM_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validateRenavam(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatRenavam(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripRenavam(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runRenavam(
  action: RenavamAction,
  value: string | undefined,
  options: RenavamOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing RENAVAM value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runRenavamCommand(action, input, options, io);
}

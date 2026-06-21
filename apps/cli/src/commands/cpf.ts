import {
  CPF_OFFICIAL_SOURCE_URL,
  formatCpf,
  stripCpf,
  validateCpf,
} from 'br-validators';
import { EXIT } from '../constants.js';
import { printFormat, printStrip, printValidation } from '../output.js';

export type CpfAction = 'validate' | 'format' | 'strip';

export type CpfOptions = {
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

export function runCpfCommand(
  action: CpfAction,
  input: string,
  options: CpfOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? CPF_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validateCpf(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatCpf(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripCpf(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runCpf(
  action: CpfAction,
  value: string | undefined,
  options: CpfOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing CPF value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runCpfCommand(action, input, options, io);
}

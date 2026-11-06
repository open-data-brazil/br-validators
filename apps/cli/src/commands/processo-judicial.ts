import {
  PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL,
  formatProcessoJudicial,
  stripProcessoJudicial,
  validateProcessoJudicial,
} from '@br-validators/core/processo-judicial';
import { EXIT } from '../constants.js';
import { printFormat, printProcessoJudicialValidation, printStrip, printValidation } from '../output.js';

export type ProcessoJudicialAction = 'validate' | 'parse' | 'format' | 'strip';

export type ProcessoJudicialOptions = {
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

export function runProcessoJudicialCommand(
  action: ProcessoJudicialAction,
  input: string,
  options: ProcessoJudicialOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? PROCESSO_JUDICIAL_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validateProcessoJudicial(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'parse':
      return printProcessoJudicialValidation(validateProcessoJudicial(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatProcessoJudicial(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripProcessoJudicial(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runProcessoJudicial(
  action: ProcessoJudicialAction,
  value: string | undefined,
  options: ProcessoJudicialOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing processo judicial value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runProcessoJudicialCommand(action, input, options, io);
}

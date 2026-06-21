import {
  PLACA_OFFICIAL_SOURCE_URL,
  convertPlacaToMercosul,
  formatPlaca,
  stripPlaca,
  validatePlaca,
} from 'br-validators';
import { EXIT } from '../constants.js';
import { printFormat, printStrip, printValidation } from '../output.js';

export type PlacaAction = 'validate' | 'format' | 'strip' | 'convert';

export type PlacaOptions = {
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

export function runPlacaCommand(
  action: PlacaAction,
  input: string,
  options: PlacaOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? PLACA_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validatePlaca(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatPlaca(input), { json: options.json, quiet: options.quiet }, io);
    case 'convert':
      return printFormat(convertPlacaToMercosul(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripPlaca(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runPlaca(
  action: PlacaAction,
  value: string | undefined,
  options: PlacaOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing placa value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runPlacaCommand(action, input, options, io);
}

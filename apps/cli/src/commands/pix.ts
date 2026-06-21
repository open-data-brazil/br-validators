import {
  PIX_OFFICIAL_SOURCE_URL,
  detectPixKeyType,
  validatePixKey,
  type PixKeyType,
  type PixValidationResult,
} from 'br-validators';
import { EXIT } from '../constants.js';

export type PixAction = 'validate' | 'detect';

export type PixOptions = {
  json: boolean;
  quiet: boolean;
  source: boolean;
  type?: PixKeyType;
  file?: string;
};

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

export function printPixValidation(
  result: PixValidationResult,
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
              keyType: result.keyType,
              format: result.format,
              ...(options.source ? { source: options.source } : {}),
            }
          : {
              ok: false,
              code: result.code,
              message: result.message,
              ...(result.keyType ? { keyType: result.keyType } : {}),
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
    io.stdout.push(`valid: yes (${result.keyType})`);
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
  if (result.keyType) {
    io.stderr.push(`keyType: ${result.keyType}`);
  }
  return EXIT.INVALID;
}

export function printPixDetect(
  keyType: ReturnType<typeof detectPixKeyType>,
  options: { json: boolean; quiet: boolean },
  io: { stdout: string[] } = { stdout: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify({ keyType }, null, 2));
  } else if (!options.quiet) {
    io.stdout.push(keyType);
  }
  return EXIT.OK;
}

export function runPixCommand(
  action: PixAction,
  input: string,
  options: PixOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? PIX_OFFICIAL_SOURCE_URL : undefined;
  const validateOptions = options.type ? { type: options.type } : undefined;

  switch (action) {
    case 'validate':
      return printPixValidation(validatePixKey(input, validateOptions), { json: options.json, quiet: options.quiet, source }, io);
    case 'detect':
      return printPixDetect(detectPixKeyType(input), { json: options.json, quiet: options.quiet }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runPix(
  action: PixAction,
  value: string | undefined,
  options: PixOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing PIX key value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runPixCommand(action, input, options, io);
}

import { detect, type DetectResult, type UfCode } from '@br-validators/core';
import { EXIT } from '../constants.js';

export type DetectOptions = {
  json: boolean;
  quiet: boolean;
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

export function printDetect(
  result: DetectResult,
  options: Pick<DetectOptions, 'json' | 'quiet'>,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify(result, null, 2));
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (options.quiet) {
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (result.ok) {
    io.stdout.push(`type: ${result.type}`);
    io.stdout.push('valid: yes');
    io.stdout.push(`value: ${result.value}`);
    if (result.format) {
      io.stdout.push(`format: ${result.format}`);
    }
    if (result.meta) {
      io.stdout.push(`meta: ${JSON.stringify(result.meta)}`);
    }
    return EXIT.OK;
  }

  io.stderr.push(`type: ${result.type}`);
  io.stderr.push('valid: no');
  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  return EXIT.INVALID;
}

export function runDetect(
  value: string | undefined,
  options: DetectOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }

  const uf = options.uf?.toUpperCase() as UfCode | undefined;
  const result = detect(input, uf ? { uf } : {});
  return printDetect(result, options, io);
}

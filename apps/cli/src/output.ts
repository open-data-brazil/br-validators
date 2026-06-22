import type { FormatResult, NfeChaveValidationResult, ValidationResult } from '@br-validators/core';
import { EXIT } from './constants.js';

export type CliOutput = {
  stdout: string[];
  stderr: string[];
  exitCode: number;
};

export function printValidation(
  result: ValidationResult,
  options: { json: boolean; quiet: boolean; source?: string },
  io: Pick<CliOutput, 'stdout' | 'stderr'> = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(
      JSON.stringify(
        result.ok
          ? {
              ok: true,
              value: result.value,
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
    io.stdout.push(`valid: yes (${result.format})`);
    io.stdout.push(`value: ${result.value}`);
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

export function printNfeChaveValidation(
  result: NfeChaveValidationResult,
  options: { json: boolean; quiet: boolean; source?: string },
  io: Pick<CliOutput, 'stdout' | 'stderr'> = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(
      JSON.stringify(
        result.ok
          ? {
              ok: true,
              value: result.value,
              format: result.format,
              parsed: result.parsed,
              ...(result.uf ? { uf: result.uf } : {}),
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
    io.stdout.push(`valid: yes (${result.format})`);
    io.stdout.push(`value: ${result.value}`);
    io.stdout.push(`cUF: ${result.parsed.cUF}`);
    io.stdout.push(`cnpj: ${result.parsed.cnpj}`);
    io.stdout.push(`mod: ${result.parsed.mod}`);
    if (result.uf) {
      io.stdout.push(`uf: ${result.uf}`);
    }
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

export function printFormat(
  result: FormatResult,
  options: { json: boolean; quiet: boolean },
  io: Pick<CliOutput, 'stdout' | 'stderr'> = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify(result, null, 2));
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (options.quiet) {
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (result.ok) {
    io.stdout.push(result.formatted);
    return EXIT.OK;
  }

  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  return EXIT.INVALID;
}

export function printStrip(value: string, options: { json: boolean }, io: { stdout: string[] } = { stdout: [] }): number {
  if (options.json) {
    io.stdout.push(JSON.stringify({ stripped: value }, null, 2));
  } else {
    io.stdout.push(value);
  }
  return EXIT.OK;
}

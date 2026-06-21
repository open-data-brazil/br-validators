import {
  CARTAO_OFFICIAL_SOURCE_URL,
  detectCardBrand,
  formatCartaoCredito,
  stripCartaoCredito,
  validateCartaoCredito,
  type CardBrand,
  type CartaoCreditoValidationResult,
} from 'br-validators';
import { EXIT } from '../constants.js';
import { printFormat, printStrip } from '../output.js';

export type CartaoAction = 'validate' | 'detect' | 'format' | 'strip';

export type CartaoOptions = {
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

export function printCartaoValidation(
  result: CartaoCreditoValidationResult,
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
              brand: result.brand,
              format: result.format,
              ...(options.source ? { source: options.source } : {}),
            }
          : {
              ok: false,
              code: result.code,
              message: result.message,
              ...(result.brand ? { brand: result.brand } : {}),
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
    io.stdout.push(`valid: yes (${result.format})`);
    io.stdout.push(`brand: ${result.brand}`);
    io.stdout.push(`value: ${result.value}`);
    if (options.source) {
      io.stdout.push(`source: ${options.source}`);
    }
    return EXIT.OK;
  }

  io.stderr.push('valid: no');
  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  if (result.brand) {
    io.stderr.push(`brand: ${result.brand}`);
  }
  return EXIT.INVALID;
}

export function printCartaoDetect(
  brand: CardBrand,
  options: { json: boolean; quiet: boolean },
  io: { stdout: string[] } = { stdout: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify({ brand }, null, 2));
  } else if (!options.quiet) {
    io.stdout.push(brand);
  }
  return EXIT.OK;
}

export function runCartaoCommand(
  action: CartaoAction,
  input: string,
  options: CartaoOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? CARTAO_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printCartaoValidation(validateCartaoCredito(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'detect':
      return printCartaoDetect(detectCardBrand(stripCartaoCredito(input)), { json: options.json, quiet: options.quiet }, io);
    case 'format':
      return printFormat(formatCartaoCredito(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripCartaoCredito(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runCartao(
  action: CartaoAction,
  value: string | undefined,
  options: CartaoOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing credit card PAN value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runCartaoCommand(action, input, options, io);
}

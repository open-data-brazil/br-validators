import { readFileSync } from 'node:fs';
import { runCnpj, type CnpjAction } from './commands/cnpj.js';
import { runCpf, type CpfAction } from './commands/cpf.js';
import { listSupportedTypes } from './commands/list.js';
import { EXIT } from './constants.js';

export type CnpjCliOptions = {
  json?: boolean;
  quiet?: boolean;
  source?: boolean;
  file?: string;
};

export type CpfCliOptions = CnpjCliOptions;

export type CliIo = { stdout: string[]; stderr: string[] };

export function readInputFile(path: string, io: CliIo): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    io.stderr.push(`Cannot read file: ${path}`);
    return null;
  }
}

export function handleListCli(io: CliIo = { stdout: [], stderr: [] }): number {
  return listSupportedTypes(io);
}

export function handleCnpjCli(
  action: CnpjAction,
  value: string | undefined,
  opts: CnpjCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runCnpj(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function handleCpfCli(
  action: CpfAction,
  value: string | undefined,
  opts: CpfCliOptions,
  io: CliIo = { stdout: [], stderr: [] },
): number {
  let fileContent: string | undefined;
  if (opts.file) {
    const content = readInputFile(opts.file, io);
    if (content === null) {
      return EXIT.USAGE;
    }
    fileContent = content;
  }

  return runCpf(
    action,
    value,
    {
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      source: Boolean(opts.source),
      file: fileContent,
    },
    io,
  );
}

export function writeCliIo(io: CliIo): void {
  for (const line of io.stdout) console.log(line);
  for (const line of io.stderr) console.error(line);
}

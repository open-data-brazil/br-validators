import { Command } from 'commander';
import {
  handleCepCli,
  handleCnpjCli,
  handleCpfCli,
  handleListCli,
  handlePlacaCli,
  writeCliIo,
  type CepCliOptions,
  type CnpjCliOptions,
  type CpfCliOptions,
  type PlacaCliOptions,
} from './handlers.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('br-validators')
    .description('100% open-source Brazilian document validators')
    .version('0.2.0-alpha.0');

  program
    .command('list')
    .description('List supported document types')
    .action(() => {
      const io = { stdout: [] as string[], stderr: [] as string[] };
      process.exitCode = handleListCli(io);
      writeCliIo(io);
    });

  const cnpj = program.command('cnpj').description('CNPJ — numeric and alphanumeric (RFB Q14)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    cnpj
      .command(action)
      .description(`${action} a CNPJ`)
      .argument('[value]', 'CNPJ value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CnpjCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCnpjCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const cpf = program.command('cpf').description('CPF — numeric modulo 11 (RFB)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    cpf
      .command(action)
      .description(`${action} a CPF`)
      .argument('[value]', 'CPF value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CpfCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCpfCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const cep = program.command('cep').description('CEP — 8-digit postal code (Correios)');

  for (const action of ['validate', 'format', 'strip'] as const) {
    cep
      .command(action)
      .description(`${action} a CEP`)
      .argument('[value]', 'CEP value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: CepCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handleCepCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  const placa = program.command('placa').description('Placa — legacy + Mercosul (CONTRAN)');

  for (const action of ['validate', 'format', 'strip', 'convert'] as const) {
    placa
      .command(action)
      .description(`${action} a license plate`)
      .argument('[value]', 'Placa value (raw or masked)')
      .option('--json', 'JSON output')
      .option('-q, --quiet', 'Exit code only')
      .option('--source', 'Include official source URL (validate only)')
      .option('-f, --file <path>', 'Read value from file')
      .action((value: string | undefined, opts: PlacaCliOptions) => {
        const io = { stdout: [] as string[], stderr: [] as string[] };
        process.exitCode = handlePlacaCli(action, value, opts, io);
        writeCliIo(io);
      });
  }

  return program;
}

export function run(argv: string[]): void {
  createProgram().parse(argv);
}

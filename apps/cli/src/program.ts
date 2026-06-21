import { Command } from 'commander';
import { handleCnpjCli, handleListCli, writeCliIo, type CnpjCliOptions } from './handlers.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('br-validators')
    .description('100% open-source Brazilian document validators')
    .version('0.1.0-alpha.1');

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

  return program;
}

export function run(argv: string[]): void {
  createProgram().parse(argv);
}

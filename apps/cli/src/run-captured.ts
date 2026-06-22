import { dispatchArgv } from './argv-dispatch.js';

export type CliRunResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

/** Run CLI with argv; capture stdout/stderr and exit code (browser-safe — no commander/process.exit). */
export function runCaptured(argv: string[]): CliRunResult {
  const io = { stdout: [] as string[], stderr: [] as string[] };
  const tokens = argv[0] === 'node' ? argv.slice(2) : argv[0] === 'br-validators' ? argv.slice(1) : argv;
  const exitCode = dispatchArgv(tokens, io);

  return {
    exitCode,
    stdout: io.stdout.join('\n'),
    stderr: io.stderr.join('\n'),
  };
}

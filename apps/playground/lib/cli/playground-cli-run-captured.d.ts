declare module '@playground/cli-run-captured' {
  export type CliRunResult = {
    exitCode: number;
    stdout: string;
    stderr: string;
  };

  export function runCaptured(argv: string[]): CliRunResult;
}

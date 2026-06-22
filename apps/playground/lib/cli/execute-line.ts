import { runCaptured, type CliRunResult } from '@/lib/cli/run-captured';
import { tokenize } from '@/lib/cli/tokenize';

export type TerminalLineResult =
  | { type: 'output'; text: string; isError: boolean }
  | { type: 'clear' }
  | { type: 'close' };

function buildArgv(tokens: string[]): string[] {
  if (tokens[0] === 'br-validators') {
    return ['node', ...tokens];
  }
  return ['node', 'br-validators', ...tokens];
}

export function executeTerminalLine(line: string): TerminalLineResult {
  const trimmed = line.trim();
  if (!trimmed) {
    return { type: 'output', text: '', isError: false };
  }

  const lower = trimmed.toLowerCase();
  if (lower === 'clear') {
    return { type: 'clear' };
  }
  if (lower === 'exit' || lower === 'quit') {
    return { type: 'close' };
  }

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) {
    return { type: 'output', text: '', isError: false };
  }

  const result: CliRunResult = runCaptured(buildArgv(tokens));
  const text = [result.stdout, result.stderr].filter(Boolean).join('\n');

  return {
    type: 'output',
    text,
    isError: result.exitCode !== 0,
  };
}

export const CLI_WELCOME_LINES = [
  'BR Validators CLI — browser simulation (100% client-side)',
  'Same commands as the Linux terminal: br-validators <type> <action> [value] [flags]',
  'Examples:',
  '  list',
  '  cpf validate 123.456.789-09',
  '  generate cpf --masked --seed 42',
  '  detect 123.456.789-09',
  'Local: clear · exit · help (--help on any command)',
];

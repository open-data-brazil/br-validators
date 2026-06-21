import { describe, expect, it } from 'vitest';

describe('index entry', () => {
  it('run executes list command', async () => {
    const { run: runProgram } = await import('../src/program.js');
    expect(() => { runProgram(['node', 'br-validators', 'list']); }).not.toThrow();
  });
});

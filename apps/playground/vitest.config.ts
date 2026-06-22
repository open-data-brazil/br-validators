import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const playgroundRoot = fileURLToPath(new URL('.', import.meta.url));
const cliRunCaptured = path.join(playgroundRoot, '../cli/dist/run-captured.js');

export default defineConfig({
  resolve: {
    alias: {
      '@': playgroundRoot,
      '@playground/cli-run-captured': cliRunCaptured,
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});

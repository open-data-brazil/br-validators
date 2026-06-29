import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { exitWithError } from './lib/errors.js';
import { syncDailyGoldenVectors } from './lib/sync-daily-golden-vectors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  const { selicUpdated, ptaxUpdated, anpUpdated } = await syncDailyGoldenVectors({ rootDir: ROOT });

  if (selicUpdated) {
    console.log('Updated packages/br-validators/tests/vectors/selic.official.json');
  }
  if (ptaxUpdated) {
    console.log('Updated packages/br-validators/tests/vectors/ptax.official.json');
  }
  if (anpUpdated) {
    console.log('Updated packages/br-validators/tests/vectors/anp-combustiveis.official.json');
  }
  if (!selicUpdated && !ptaxUpdated && !anpUpdated) {
    console.log('Golden vectors already in sync (selic, ptax, anp-combustiveis).');
  }
}

main().catch(exitWithError);

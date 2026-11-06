import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { listCoreExportSubpaths } from '../../../../scripts/lib/core-export-subpaths.js';

const packageRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const repoRoot = join(packageRoot, '../../..');
const manifestPath = join(packageRoot, 'export-manifest.json');

const exportKeys = listCoreExportSubpaths(repoRoot);

const manifest = {
  // NOTE: intentionally no `generatedAt` timestamp — the manifest must stay
  // byte-identical across runs so `pnpm test:integration` leaves a clean tree.
  // It only changes when core `package.json#exports` actually changes.
  source: 'packages/br-validators/package.json#exports',
  exportKeys,
  exceptions: [] as string[],
};

mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${String(exportKeys.length)} export keys → ${manifestPath}`);

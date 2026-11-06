import { readFile, writeFile } from 'node:fs/promises';

import { isStaleBaseline, sealedBaselineChanges } from './drift-detection.js';
import { parseDatasetMetadata } from './parse-metadata.js';
import type { DatasetMetadata } from '../../packages/br-validators/src/data-catalog/types.js';

export async function sealStaleBaselineMetadata(metadataPath: string): Promise<boolean> {
  const raw = await readFile(metadataPath, 'utf8');
  const metadata = parseDatasetMetadata(raw);

  if (!isStaleBaseline(metadata.alteracoes)) {
    return false;
  }

  const sealed: DatasetMetadata = {
    ...metadata,
    alteracoes: sealedBaselineChanges(metadata.capturadoEm),
  };

  await writeFile(metadataPath, `${JSON.stringify(sealed, null, 2)}\n`);
  return true;
}

export async function sealAllStaleBaselines(metadataPaths: readonly string[]): Promise<number> {
  let sealed = 0;
  for (const metadataPath of metadataPaths) {
    const didSeal = await sealStaleBaselineMetadata(metadataPath);
    if (didSeal) {
      sealed += 1;
    }
  }
  return sealed;
}

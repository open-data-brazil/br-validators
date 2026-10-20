/**
 * Materialize `workspace:` protocol ranges before packing with the npm CLI.
 *
 * `pnpm publish` resolves the protocol itself, but the npm CLI does not
 * understand it — a published package that keeps `workspace:*` in its
 * dependencies breaks for consumers (EUNSUPPORTEDPROTOCOL on install).
 * The npm CLI is required for npm trusted publishing (OIDC), so the ranges
 * are rewritten to plain semver here.
 *
 * Usage: pnpm exec tsx scripts/prepare-npm-publish.ts <package-dir> [...]
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { exitWithError } from './lib/errors.js';
import { resolveWorkspaceVersion, rewriteManifestWorkspaceRanges } from './lib/workspace-protocol.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function preparePackage(packageDir: string): Promise<void> {
  const manifestPath = path.join(ROOT, packageDir, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Record<string, unknown>;

  const changes = await rewriteManifestWorkspaceRanges(manifest, (dependencyName) =>
    resolveWorkspaceVersion(ROOT, packageDir, dependencyName),
  );

  for (const change of changes) {
    console.log(`${packageDir}: ${change.field}.${change.name} ${change.from} → ${change.to}`);
  }

  if (changes.length > 0) {
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }
}

async function main(): Promise<void> {
  const packageDirs = process.argv.slice(2);
  if (packageDirs.length === 0) {
    throw new Error('At least one package directory is required');
  }
  for (const packageDir of packageDirs) {
    await preparePackage(packageDir);
  }
}

main().catch(exitWithError);

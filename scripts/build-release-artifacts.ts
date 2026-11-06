#!/usr/bin/env node
/**
 * Build GitHub Release assets — npm tarballs of every workspace package plus the
 * embedded reference data. Replaces `npm publish`: no registry, no NPM_TOKEN.
 *
 * Usage: pnpm exec tsx scripts/build-release-artifacts.ts --tag v1.10.1-data.34 \
 *          [--out dist/release] [--notes dist/release-notes.md]
 * Requires a prior `pnpm build` (packages are packed with --ignore-scripts).
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { exitWithError } from './lib/errors.js';
import {
  buildReleaseCatalog,
  buildReleaseNotes,
  type CatalogFile,
  DEFAULT_GITHUB_REPOSITORY,
  type DatasetMetadataLike,
  extractChangelogSection,
  RELEASE_PACKAGES,
  releaseAssetUrl,
  rewriteWorkspaceRangesForRelease,
  tarballFileName,
} from './lib/github-release-artifacts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CORE_SRC = path.join(ROOT, 'packages/br-validators/src');

function readArg(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function run(command: string, args: string[], cwd: string): Buffer {
  const result = spawnSync(command, args, { cwd, maxBuffer: 512 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed (${String(result.status)}): ${result.stderr.toString()}`);
  }
  return result.stdout;
}

async function packPackage(
  dir: string,
  name: string,
  version: string,
  tarballUrlFor: (packageName: string) => string,
  outDir: string,
): Promise<string> {
  const manifestPath = path.join(ROOT, dir, 'package.json');
  const original = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(original) as Record<string, unknown>;
  if (manifest.version !== version) {
    throw new Error(`${name} is ${String(manifest.version)}, expected ${version} (tag/package.json mismatch)`);
  }
  for (const change of rewriteWorkspaceRangesForRelease(manifest, { version, tarballUrlFor })) {
    console.log(`${dir}: ${change.field}.${change.name} ${change.from} → ${change.to}`);
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  try {
    run('npm', ['pack', '--ignore-scripts', '--pack-destination', outDir], path.join(ROOT, dir));
  } finally {
    await writeFile(manifestPath, original);
  }
  const fileName = tarballFileName(name, version);
  await stat(path.join(outDir, fileName));
  return fileName;
}

async function listDataFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listDataFiles(fullPath);
      }
      const isDataJson = entry.name.endsWith('.json') && path.basename(dir) === 'data';
      return isDataJson ? [path.relative(CORE_SRC, fullPath)] : [];
    }),
  );
  return nested.flat().sort();
}

async function buildDataAssets(
  version: string,
  tag: string,
  repository: string,
  outDir: string,
): Promise<{ bundle: string; catalog: string }> {
  const files = await listDataFiles(CORE_SRC);
  const bundle = `br-validators-data-${version}.tar.gz`;
  // Deterministic tarball: sorted names, fixed owner and mtime, gzip header without timestamp.
  const tarball = run(
    'tar',
    ['--owner=0', '--group=0', '--numeric-owner', '--mtime=1970-01-01 00:00:00Z', '-cf', '-', ...files],
    CORE_SRC,
  );
  await writeFile(path.join(outDir, bundle), gzipSync(tarball, { level: 9 }));

  const byDataDir = new Map<string, CatalogFile[]>();
  for (const file of files) {
    const content = await readFile(path.join(CORE_SRC, file));
    const dataDir = path.dirname(file);
    const entries = byDataDir.get(dataDir) ?? [];
    entries.push({ path: file, sha256: sha256(content), bytes: content.length });
    byDataDir.set(dataDir, entries);
  }

  const datasets = await Promise.all(
    [...byDataDir.entries()].map(async ([dataDir, dataFiles]) => {
      const metadataFile =
        dataFiles.find((file) => path.basename(file.path) === 'metadata.json') ??
        dataFiles.find((file) => file.path.endsWith('metadata.json'));
      const metadata =
        metadataFile === undefined
          ? { id: path.dirname(dataDir) }
          : (JSON.parse(await readFile(path.join(CORE_SRC, metadataFile.path), 'utf8')) as DatasetMetadataLike);
      return { metadata, files: dataFiles };
    }),
  );

  const catalog = buildReleaseCatalog({ repository, tag, version, dataBundle: bundle, datasets });
  await writeFile(path.join(outDir, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
  return { bundle, catalog: 'catalog.json' };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const tag = readArg(argv, '--tag');
  if (tag === undefined || !tag.startsWith('v')) {
    throw new Error('--tag vX.Y.Z is required');
  }
  const version = tag.slice(1);
  const outDir = path.resolve(ROOT, readArg(argv, '--out') ?? 'dist/release');
  const notesPath = path.resolve(ROOT, readArg(argv, '--notes') ?? 'dist/release-notes.md');
  const repository = process.env.GITHUB_REPOSITORY ?? DEFAULT_GITHUB_REPOSITORY;
  const tarballUrlFor = (packageName: string) =>
    releaseAssetUrl(repository, tag, tarballFileName(packageName, version));

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const assets: string[] = [];
  for (const releasePackage of RELEASE_PACKAGES) {
    assets.push(await packPackage(releasePackage.dir, releasePackage.name, version, tarballUrlFor, outDir));
  }
  const data = await buildDataAssets(version, tag, repository, outDir);
  assets.push(data.bundle, data.catalog);

  const sums = await Promise.all(
    assets.sort().map(async (asset) => `${sha256(await readFile(path.join(outDir, asset)))}  ${asset}`),
  );
  await writeFile(path.join(outDir, 'SHA256SUMS'), `${sums.join('\n')}\n`);

  const changelog = await readFile(path.join(ROOT, 'CHANGELOG.md'), 'utf8').catch(() => '');
  await mkdir(path.dirname(notesPath), { recursive: true });
  await writeFile(
    notesPath,
    buildReleaseNotes({
      repository,
      tag,
      version,
      dataBundle: data.bundle,
      changelogSection: extractChangelogSection(changelog, version),
    }),
  );

  console.log(`Release assets for ${tag} in ${path.relative(ROOT, outDir)}:`);
  for (const asset of [...assets, 'SHA256SUMS']) {
    console.log(`  ${asset}`);
  }
}

main().catch(exitWithError);

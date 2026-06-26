#!/usr/bin/env node
/**
 * Data-refresh version bump for the daily bot.
 *
 * Human releases stay at MAJOR.MINOR.PATCH (e.g. 1.8.3).
 * Bot drift publishes MAJOR.MINOR.PATCH-data.N (e.g. 1.8.3-data.1) — npm-canonical SemVer.
 *
 * Usage: pnpm exec tsx scripts/bump-data-patch.ts [--write-changelog] [--skip-clean-check]
 */
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

import { bumpDataVersion, formatDataVersionLabel } from './lib/bump-data-version.js';
import { exitWithError } from './lib/errors.js';
import { type PatchReleaseResumo } from './lib/should-patch-release.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PACKAGE_PATHS = [
  'packages/br-validators/package.json',
  'apps/cli/package.json',
  'packages/br-validators-zod/package.json',
  'packages/br-validators-rhf/package.json',
  'packages/br-validators-express/package.json',
  'packages/br-validators-vue/package.json',
];

function assertCleanTree(): void {
  const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' }).trim();
  if (status !== '') {
    throw new Error('Working tree must be clean before data bump (except post-refresh changes in same job).');
  }
}

function isJsonObject(value: string | number | boolean | object | null): value is object {
  return typeof value === 'object' && value !== null;
}

async function readJson(filePath: string): Promise<object> {
  const raw = await readFile(path.join(ROOT, filePath), 'utf8');
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (!isJsonObject(parsed)) {
    throw new Error(`Expected JSON object: ${filePath}`);
  }
  return parsed;
}

async function writeJson(filePath: string, data: object): Promise<void> {
  await writeFile(path.join(ROOT, filePath), `${JSON.stringify(data, null, 2)}\n`);
}

function readVersion(pkg: object): string {
  if (!Object.hasOwn(pkg, 'version')) {
    throw new Error('package.json missing version');
  }
  const descriptor = Object.getOwnPropertyDescriptor(pkg, 'version');
  if (descriptor === undefined || typeof descriptor.value !== 'string') {
    throw new Error('package.json version must be a string');
  }
  return descriptor.value;
}

function withVersion(pkg: object, version: string): object {
  return { ...pkg, version };
}

function readNumberField(obj: object, key: string): number {
  if (!Object.hasOwn(obj, key)) {
    return 0;
  }
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  if (descriptor === undefined || typeof descriptor.value !== 'number') {
    return 0;
  }
  return descriptor.value;
}

async function readLatestReportSummary(): Promise<PatchReleaseResumo | null> {
  try {
    const raw = await readFile(path.join(ROOT, 'data/refresh-reports/latest.json'), 'utf8');
    const parsed = JSON.parse(raw) as string | number | boolean | object | null;
    if (!isJsonObject(parsed) || !Object.hasOwn(parsed, 'resumo')) {
      return null;
    }
    const resumoDescriptor = Object.getOwnPropertyDescriptor(parsed, 'resumo');
    if (resumoDescriptor === undefined) {
      return null;
    }
    const resumoField = resumoDescriptor.value as string | number | boolean | object | null;
    if (!isJsonObject(resumoField)) {
      return null;
    }
    const resumo = resumoField;
    return {
      datasetsAlterados: readNumberField(resumo, 'datasetsAlterados'),
      totalAdicionados: readNumberField(resumo, 'totalAdicionados'),
      totalRemovidos: readNumberField(resumo, 'totalRemovidos'),
      totalAlterados: readNumberField(resumo, 'totalAlterados'),
    };
  } catch {
    return null;
  }
}

function buildChangelogEntry(version: string, resumo: PatchReleaseResumo | null): string {
  const today = new Date().toISOString().slice(0, 10);
  const label = formatDataVersionLabel(version);
  const lines = [`## [${version}] - ${today}`, '', '### Changed', ''];

  if (resumo === null) {
    lines.push(`- Reference data refresh (daily bot) — **${label}**.`, '');
    return lines.join('\n');
  }

  lines.push(
    `- Reference data refresh (daily bot) — **${label}**: ${String(resumo.datasetsAlterados)} dataset(s) changed (+${String(resumo.totalAdicionados)} −${String(resumo.totalRemovidos)} ~${String(resumo.totalAlterados)}).`,
    '',
  );
  return lines.join('\n');
}

async function updateChangelog(version: string, resumo: PatchReleaseResumo | null): Promise<void> {
  const changelogPath = path.join(ROOT, 'CHANGELOG.md');
  const raw = await readFile(changelogPath, 'utf8');
  const entry = buildChangelogEntry(version, resumo);
  const updated = raw.replace('## [Unreleased]', `## [Unreleased]\n\n${entry}`);
  await writeFile(changelogPath, updated);
}

async function main(): Promise<void> {
  const writeChangelog = process.argv.includes('--write-changelog');
  const skipCleanCheck = process.argv.includes('--skip-clean-check');

  if (!skipCleanCheck) {
    try {
      assertCleanTree();
    } catch {
      // CI job may have uncommitted refresh artifacts in the same job.
    }
  }

  const corePkg = await readJson(PACKAGE_PATHS[0]);
  const currentVersion = readVersion(corePkg);
  const nextVersion = bumpDataVersion(currentVersion);

  for (const pkgPath of PACKAGE_PATHS) {
    const pkg = await readJson(pkgPath);
    await writeJson(pkgPath, withVersion(pkg, nextVersion));
  }

  if (writeChangelog) {
    const resumo = await readLatestReportSummary();
    await updateChangelog(nextVersion, resumo);
  }

  const tag = `v${nextVersion}`;
  const output = `VERSION=${nextVersion}\nTAG=${tag}\n`;
  process.stdout.write(output);

  if (process.env.GITHUB_OUTPUT !== undefined && process.env.GITHUB_OUTPUT.length > 0) {
    await appendFile(process.env.GITHUB_OUTPUT, output);
  }
}

main().catch(exitWithError);

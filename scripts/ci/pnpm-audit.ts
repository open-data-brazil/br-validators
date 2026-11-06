/**
 * Run `pnpm audit` with pnpm 11+.
 *
 * npm retired legacy `/-/npm/v1/security/audits{,/quick}` (HTTP 410).
 * pnpm 9/10 still call those endpoints. pnpm 11+ uses `/advisories/bulk`.
 *
 * This repo stays on `packageManager: pnpm@9.x` (Node >=18). pnpm 11 requires
 * Node >=22.13, so CI invokes that version for audit only.
 *
 * Usage: pnpm exec tsx scripts/ci/pnpm-audit.ts [--prod] [--audit-level=high]
 */
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { exitWithError } from '../lib/errors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PNPM_AUDIT_VERSION = '11.13.0';
const PACKAGE_JSON = path.join(ROOT, 'package.json');

function parsePackageJson(raw: string): object {
  const parsed = JSON.parse(raw) as string | number | boolean | object | null;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('package.json must be a JSON object');
  }
  return parsed;
}

function runOrThrow(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env: process.env });
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit ${String(result.status)}`);
  }
}

function extractPnpmBin(destDir: string): string {
  const url = `https://registry.npmjs.org/pnpm/-/pnpm-${PNPM_AUDIT_VERSION}.tgz`;
  const tgzPath = path.join(destDir, `pnpm-${PNPM_AUDIT_VERSION}.tgz`);
  runOrThrow('curl', ['-fsSL', url, '-o', tgzPath], destDir);
  runOrThrow('tar', ['-xzf', tgzPath, '-C', destDir], destDir);
  return path.join(destDir, 'package', 'bin', 'pnpm.cjs');
}

async function withTempPackageManager(
  version: string,
  run: () => number,
): Promise<number> {
  const original = await readFile(PACKAGE_JSON, 'utf8');
  const backupPath = `${PACKAGE_JSON}.audit-bak`;
  await copyFile(PACKAGE_JSON, backupPath);
  try {
    const pkg = parsePackageJson(original);
    Object.defineProperty(pkg, 'packageManager', {
      value: `pnpm@${version}`,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    await writeFile(PACKAGE_JSON, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
    return run();
  } finally {
    await rename(backupPath, PACKAGE_JSON);
  }
}

async function main(): Promise<void> {
  const auditArgs = process.argv.slice(2);
  const workDir = await mkdtemp(path.join(tmpdir(), 'pnpm-audit-'));
  await mkdir(workDir, { recursive: true });
  const pnpmBin = extractPnpmBin(workDir);

  const exitCode = await withTempPackageManager(PNPM_AUDIT_VERSION, () => {
    const result = spawnSync(process.execPath, [pnpmBin, 'audit', ...auditArgs], {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    if (result.error !== undefined) {
      throw result.error;
    }
    return result.status ?? 1;
  });

  process.exit(exitCode);
}

main().catch(exitWithError);

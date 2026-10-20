import path from 'node:path';
import { realpath, readFile } from 'node:fs/promises';

export const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

export type DependencyField = (typeof DEPENDENCY_FIELDS)[number];

export interface ManifestLike {
  [field: string]: unknown;
}

/**
 * Translate a pnpm `workspace:` range into a plain semver range.
 *
 * `workspace:*` → `<version>`, `workspace:^` → `^<version>`,
 * `workspace:~` → `~<version>`, `workspace:^1.2.3` → `^1.2.3`.
 * Any other range is returned unchanged.
 */
export function resolveWorkspaceRange(range: string, version: string): string {
  if (!range.startsWith('workspace:')) {
    return range;
  }

  const requested = range.slice('workspace:'.length);
  if (requested === '' || requested === '*') {
    return version;
  }
  if (requested === '^' || requested === '~') {
    return `${requested}${version}`;
  }
  return requested;
}

/**
 * Resolve the version of a workspace dependency through the node_modules link
 * created by the package manager.
 */
export async function resolveWorkspaceVersion(
  root: string,
  packageDir: string,
  dependencyName: string,
): Promise<string> {
  const candidates = [
    path.join(root, packageDir, 'node_modules', dependencyName, 'package.json'),
    path.join(root, 'node_modules', dependencyName, 'package.json'),
  ];

  for (const candidate of candidates) {
    let resolved: string;
    try {
      resolved = await realpath(candidate);
    } catch {
      continue;
    }
    const manifest = JSON.parse(await readFile(resolved, 'utf8')) as { version?: unknown };
    if (typeof manifest.version !== 'string') {
      throw new Error(`Workspace dependency ${dependencyName} has no version`);
    }
    return manifest.version;
  }

  throw new Error(`Cannot resolve workspace dependency ${dependencyName} from ${packageDir}`);
}

/**
 * Rewrite every `workspace:` range of a manifest into a plain semver range.
 * Returns the list of applied changes for logging.
 */
export async function rewriteManifestWorkspaceRanges(
  manifest: ManifestLike,
  resolveVersion: (dependencyName: string) => Promise<string>,
): Promise<{ field: DependencyField; name: string; from: string; to: string }[]> {
  const changes: { field: DependencyField; name: string; from: string; to: string }[] = [];

  for (const field of DEPENDENCY_FIELDS) {
    const dependencies = manifest[field];
    if (typeof dependencies !== 'object' || dependencies === null) {
      continue;
    }
    const entries = dependencies as Record<string, unknown>;
    for (const [name, range] of Object.entries(entries)) {
      if (typeof range !== 'string' || !range.startsWith('workspace:')) {
        continue;
      }
      const version = await resolveVersion(name);
      entries[name] = resolveWorkspaceRange(range, version);
      changes.push({ field, name, from: range, to: entries[name] as string });
    }
  }

  return changes;
}

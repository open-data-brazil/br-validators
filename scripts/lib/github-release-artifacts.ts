/**
 * GitHub Release distribution — replaces publishing to the npm registry.
 *
 * Every workspace package is packed with `npm pack` (no registry, no token) and
 * attached to the release together with the embedded reference data. Internal
 * `workspace:` dependencies point at the sibling tarball of the same release so a
 * consumer can `npm install <release-url>.tgz` without the npm registry.
 */

import { DEPENDENCY_FIELDS, type ManifestLike } from './workspace-protocol.js';

export const DEFAULT_GITHUB_REPOSITORY = 'open-data-brazil/br-validators';

export interface ReleasePackage {
  dir: string;
  name: string;
}

export const RELEASE_PACKAGES: readonly ReleasePackage[] = [
  { dir: 'packages/br-validators', name: '@br-validators/core' },
  { dir: 'apps/cli', name: '@br-validators/cli' },
  { dir: 'packages/br-validators-zod', name: '@br-validators/zod' },
  { dir: 'packages/br-validators-rhf', name: '@br-validators/react-hook-form' },
  { dir: 'packages/br-validators-express', name: '@br-validators/express' },
  { dir: 'packages/br-validators-vue', name: '@br-validators/vue' },
];

/** File name produced by `npm pack` for a scoped package (`@scope/name` → `scope-name-<v>.tgz`). */
export function tarballFileName(packageName: string, version: string): string {
  return `${packageName.replace(/^@/u, '').replace('/', '-')}-${version}.tgz`;
}

export function releaseAssetUrl(repository: string, tag: string, fileName: string): string {
  return `https://github.com/${repository}/releases/download/${tag}/${fileName}`;
}

export interface ReleaseRewrite {
  field: (typeof DEPENDENCY_FIELDS)[number];
  name: string;
  from: string;
  to: string;
}

/**
 * Point `workspace:` dependencies at this release's assets.
 * Runtime dependencies → tarball URL; peer/dev dependencies → exact version
 * (an exact pin also matches the `-data.N` pre-release suffix).
 */
export function rewriteWorkspaceRangesForRelease(
  manifest: ManifestLike,
  options: { version: string; tarballUrlFor: (packageName: string) => string },
): ReleaseRewrite[] {
  const changes: ReleaseRewrite[] = [];
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
      const to =
        field === 'dependencies' || field === 'optionalDependencies'
          ? options.tarballUrlFor(name)
          : options.version;
      entries[name] = to;
      changes.push({ field, name, from: range, to });
    }
  }
  return changes;
}

export interface DatasetMetadataLike {
  id: string;
  nome?: string;
  fonte?: string;
  capturadoEm?: string;
  contagens?: Record<string, number>;
}

export interface CatalogFile {
  path: string;
  sha256: string;
  bytes: number;
}

export interface ReleaseCatalog {
  repository: string;
  tag: string;
  version: string;
  dataBundle: string;
  datasets: {
    id: string;
    nome: string | null;
    fonte: string | null;
    capturadoEm: string | null;
    contagens: Record<string, number>;
    arquivos: CatalogFile[];
  }[];
}

/** Stable catalog of embedded datasets (no generation timestamp → reproducible). */
export function buildReleaseCatalog(input: {
  repository: string;
  tag: string;
  version: string;
  dataBundle: string;
  datasets: { metadata: DatasetMetadataLike; files: CatalogFile[] }[];
}): ReleaseCatalog {
  return {
    repository: input.repository,
    tag: input.tag,
    version: input.version,
    dataBundle: input.dataBundle,
    datasets: [...input.datasets]
      .sort((a, b) => a.metadata.id.localeCompare(b.metadata.id))
      .map(({ metadata, files }) => ({
        id: metadata.id,
        nome: metadata.nome ?? null,
        fonte: metadata.fonte ?? null,
        capturadoEm: metadata.capturadoEm ?? null,
        contagens: metadata.contagens ?? {},
        arquivos: [...files].sort((a, b) => a.path.localeCompare(b.path)),
      })),
  };
}

export function buildReleaseNotes(input: {
  repository: string;
  tag: string;
  version: string;
  dataBundle: string;
  changelogSection: string | null;
}): string {
  const url = (file: string) => releaseAssetUrl(input.repository, input.tag, file);
  const core = tarballFileName('@br-validators/core', input.version);
  const cli = tarballFileName('@br-validators/cli', input.version);
  const lines = [
    `## ${input.tag}`,
    '',
    input.changelogSection ?? 'See [CHANGELOG.md](CHANGELOG.md).',
    '',
    '### Install from this release (no npm registry)',
    '',
    '```bash',
    `npm install ${url(core)}`,
    `npm install -g ${url(cli)}`,
    '```',
    '',
    'Adapters (`zod`, `react-hook-form`, `express`, `vue`) are attached as `br-validators-<adapter>-' +
      `${input.version}.tgz\` and resolve \`@br-validators/core\` from this same release.`,
    '',
    '### Reference data',
    '',
    `- \`${input.dataBundle}\` — every embedded dataset (\`<dataset>/data/*.json\` + \`metadata.json\`)`,
    '- `catalog.json` — dataset index with capture dates, counts and SHA-256 per file',
    '- `SHA256SUMS` — checksums for every asset',
    '',
    `Latest catalog: https://github.com/${input.repository}/releases/latest/download/catalog.json`,
    '',
  ];
  return lines.join('\n');
}

/** Extract the `## [x.y.z]` (or `## x.y.z`) section of a Keep-a-Changelog file. */
export function extractChangelogSection(changelog: string, version: string): string | null {
  const lines = changelog.split('\n');
  const isHeading = (line: string) => /^## /u.test(line);
  const start = lines.findIndex(
    (line) => isHeading(line) && (line.includes(`[${version}]`) || line.includes(` ${version}`)),
  );
  if (start === -1) {
    return null;
  }
  const end = lines.findIndex((line, index) => index > start && isHeading(line));
  const body = lines.slice(start + 1, end === -1 ? undefined : end).join('\n').trim();
  return body.length > 0 ? body : null;
}

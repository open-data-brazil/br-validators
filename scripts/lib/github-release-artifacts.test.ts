import { describe, expect, it } from 'vitest';

import {
  buildReleaseCatalog,
  buildReleaseNotes,
  extractChangelogSection,
  releaseAssetUrl,
  rewriteWorkspaceRangesForRelease,
  tarballFileName,
} from './github-release-artifacts.js';

const REPO = 'open-data-brazil/br-validators';
const TAG = 'v1.10.1-data.34';
const VERSION = '1.10.1-data.34';

describe('github-release-artifacts', () => {
  it('matches npm pack file names for scoped packages', () => {
    expect(tarballFileName('@br-validators/core', VERSION)).toBe('br-validators-core-1.10.1-data.34.tgz');
    expect(tarballFileName('@br-validators/react-hook-form', '1.11.0')).toBe(
      'br-validators-react-hook-form-1.11.0.tgz',
    );
  });

  it('points runtime workspace deps at the release tarball and pins peer/dev deps', () => {
    const manifest = {
      name: '@br-validators/vue',
      dependencies: { '@br-validators/core': 'workspace:*', other: '^1.0.0' },
      peerDependencies: { '@br-validators/core': 'workspace:*', vue: '^3.5.0' },
      devDependencies: { '@br-validators/core': 'workspace:^' },
    };
    const changes = rewriteWorkspaceRangesForRelease(manifest, {
      version: VERSION,
      tarballUrlFor: (name) => releaseAssetUrl(REPO, TAG, tarballFileName(name, VERSION)),
    });

    expect(manifest.dependencies['@br-validators/core']).toBe(
      'https://github.com/open-data-brazil/br-validators/releases/download/v1.10.1-data.34/br-validators-core-1.10.1-data.34.tgz',
    );
    expect(manifest.dependencies.other).toBe('^1.0.0');
    expect(manifest.peerDependencies['@br-validators/core']).toBe(VERSION);
    expect(manifest.peerDependencies.vue).toBe('^3.5.0');
    expect(manifest.devDependencies['@br-validators/core']).toBe(VERSION);
    expect(changes).toHaveLength(3);
  });

  it('builds a reproducible, sorted catalog', () => {
    const catalog = buildReleaseCatalog({
      repository: REPO,
      tag: TAG,
      version: VERSION,
      dataBundle: 'br-validators-data-1.10.1-data.34.tar.gz',
      datasets: [
        { metadata: { id: 'ptax', capturadoEm: '2026-11-04' }, files: [{ path: 'ptax/data/ptax.json', sha256: 'b', bytes: 2 }] },
        {
          metadata: { id: 'bancos', nome: 'Bacen STR', contagens: { bancos: 460 } },
          files: [
            { path: 'bancos/data/metadata.json', sha256: 'c', bytes: 3 },
            { path: 'bancos/data/bancos.json', sha256: 'a', bytes: 1 },
          ],
        },
      ],
    });
    expect(catalog.datasets.map((dataset) => dataset.id)).toEqual(['bancos', 'ptax']);
    expect(catalog.datasets[0].arquivos[0].path).toBe('bancos/data/bancos.json');
    expect(catalog.datasets[1]).toMatchObject({ nome: null, contagens: {}, capturadoEm: '2026-11-04' });
  });

  it('extracts the changelog section for a version', () => {
    const changelog = '# Changelog\n\n## [1.10.1-data.34] - 2026-11-05\n\n### Data\n- ptax\n\n## [1.10.1-data.33]\n- old\n';
    expect(extractChangelogSection(changelog, VERSION)).toBe('### Data\n- ptax');
    expect(extractChangelogSection(changelog, '9.9.9')).toBeNull();
  });

  it('writes install instructions that never reference the npm registry', () => {
    const notes = buildReleaseNotes({
      repository: REPO,
      tag: TAG,
      version: VERSION,
      dataBundle: 'br-validators-data-1.10.1-data.34.tar.gz',
      changelogSection: null,
    });
    expect(notes).toContain(
      'npm install https://github.com/open-data-brazil/br-validators/releases/download/v1.10.1-data.34/br-validators-core-1.10.1-data.34.tgz',
    );
    expect(notes).not.toContain('npmjs.com');
  });
});

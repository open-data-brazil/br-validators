import { describe, expect, it } from 'vitest';

import {
  resolveWorkspaceRange,
  rewriteManifestWorkspaceRanges,
} from './workspace-protocol.js';

describe('resolveWorkspaceRange', () => {
  it('keeps plain semver ranges untouched', () => {
    expect(resolveWorkspaceRange('^1.2.3', '9.9.9')).toBe('^1.2.3');
    expect(resolveWorkspaceRange('~1.2.3', '9.9.9')).toBe('~1.2.3');
  });

  it('materializes the exact version for workspace:*', () => {
    expect(resolveWorkspaceRange('workspace:*', '1.10.1-data.25')).toBe('1.10.1-data.25');
    expect(resolveWorkspaceRange('workspace:', '1.10.1-data.25')).toBe('1.10.1-data.25');
  });

  it('keeps the range operator for workspace:^ and workspace:~', () => {
    expect(resolveWorkspaceRange('workspace:^', '1.10.1-data.25')).toBe('^1.10.1-data.25');
    expect(resolveWorkspaceRange('workspace:~', '1.10.1-data.25')).toBe('~1.10.1-data.25');
  });

  it('keeps an explicit range given after the protocol', () => {
    expect(resolveWorkspaceRange('workspace:^1.2.3', '9.9.9')).toBe('^1.2.3');
  });
});

describe('rewriteManifestWorkspaceRanges', () => {
  it('rewrites dependencies and peerDependencies', async () => {
    const manifest: Record<string, unknown> = {
      dependencies: { '@br-validators/core': 'workspace:*', commander: '^13.1.0' },
      peerDependencies: { '@br-validators/core': 'workspace:*', express: '^5.0.0' },
      devDependencies: { tsup: '^8.5.0' },
    };

    const changes = await rewriteManifestWorkspaceRanges(manifest, () =>
      Promise.resolve('1.10.1-data.25'),
    );

    expect(manifest.dependencies).toEqual({
      '@br-validators/core': '1.10.1-data.25',
      commander: '^13.1.0',
    });
    expect(manifest.peerDependencies).toEqual({
      '@br-validators/core': '1.10.1-data.25',
      express: '^5.0.0',
    });
    expect(manifest.devDependencies).toEqual({ tsup: '^8.5.0' });
    expect(changes).toHaveLength(2);
  });

  it('leaves manifests without workspace ranges untouched', async () => {
    const manifest: Record<string, unknown> = { dependencies: { commander: '^13.1.0' } };

    const changes = await rewriteManifestWorkspaceRanges(manifest, () => Promise.resolve('1.0.0'));

    expect(changes).toEqual([]);
    expect(manifest.dependencies).toEqual({ commander: '^13.1.0' });
  });
});

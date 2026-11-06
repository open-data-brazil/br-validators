#!/usr/bin/env node
/**
 * Block `pnpm publish` / `npm publish` everywhere (local and CI).
 * @br-validators/* is distributed through GitHub Releases only — see
 * .github/workflows/release.yml and scripts/build-release-artifacts.ts.
 */
console.error(
  [
    'Publishing @br-validators/* to the npm registry is disabled.',
    'Releases are GitHub Release assets (npm pack tarballs + reference data):',
    'push a version tag on main (vX.Y.Z) or re-run .github/workflows/release.yml via workflow_dispatch.',
    'See docs/BRANCHING.md',
  ].join('\n'),
);
process.exit(1);

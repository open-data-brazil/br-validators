# Branching and release workflow

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready; version tags trigger automated npm publish |
| `developing` | Integration branch; PRs merge into `main` |

## Daily flow

1. Commit on `developing`
2. Open PR `developing` → `main`
3. CI must pass; maintainer approval required on `main`
4. Merge to `main`

## Release flow (automated npm publish)

**Order matters:** bump `package.json` **before** creating the git tag. The Release workflow fails if the tag does not match both `packages/br-validators/package.json` and `apps/cli/package.json`.

After merge to `main`:

```bash
# 1. Bump version in BOTH package.json files (same semver)
#    packages/br-validators/package.json  →  "version": "0.11.0-alpha.1"
#    apps/cli/package.json                →  "version": "0.11.0-alpha.1"
# 2. Move CHANGELOG [Unreleased] → [0.11.0-alpha.1] - YYYY-MM-DD
# 3. Commit and push to main (via PR from developing)

# 4. Only then — tag must match package.json (with v prefix)
git tag -a v0.11.0-alpha.1 -m "Release v0.11.0-alpha.1"
git push origin v0.11.0-alpha.1
```

| Tag pushed | `package.json` version | Result |
|------------|------------------------|--------|
| `v0.11.0-alpha.1` | `0.11.0-alpha.0` | **Fails** — version mismatch |
| `v0.11.0-alpha.1` | `0.11.0-alpha.1` | **Publishes** |

Pushing tag `v*` triggers [`.github/workflows/release.yml`](../.github/workflows/release.yml):

1. Verifies tag matches `package.json` versions (core + cli)
2. Runs `pnpm verify`
3. Publishes `@br-validators/core` then `@br-validators/cli` to npm (`alpha` tag)
4. Sets npm **`latest`** dist-tag to the new version (npmjs.com default view)
5. Creates GitHub Release (if missing)

### One-time setup: `NPM_TOKEN`

1. [npmjs.com](https://www.npmjs.org) → Access Tokens → **Granular Access Token**
2. Permissions: **Read and write** on packages `@br-validators/core`, `@br-validators/cli`
3. GitHub repo → Settings → Secrets and variables → Actions → **New repository secret**
4. Name: `NPM_TOKEN` — paste the token

Manual re-run: Actions → **Release** → **Run workflow** (dispatch) with tag name.

### Sync developing after release

```bash
git checkout developing && git merge main && git push origin developing
```

## `main` protection

- Required status check: **test** (CI workflow)
- Required pull request review: **1** approving review
- Releases use tags — no direct publish from local machine required

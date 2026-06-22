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

After merge to `main`:

```bash
# 1. Bump versions (packages/br-validators + apps/cli) and update CHANGELOG on main
# 2. Commit version bump PR (or include in release PR)
git tag -a v0.11.0-alpha.0 -m "Release v0.11.0-alpha.0"
git push origin v0.11.0-alpha.0
```

Pushing tag `v*` triggers [`.github/workflows/release.yml`](../.github/workflows/release.yml):

1. Verifies tag matches `package.json` versions (core + cli)
2. Runs `pnpm verify`
3. Publishes `@br-validators/core` then `@br-validators/cli` to npm (`alpha` tag)
4. Creates GitHub Release (if missing)

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

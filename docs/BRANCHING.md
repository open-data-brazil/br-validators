# Branching and release workflow

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready; version tags trigger the automated GitHub Release |
| `developing` | Integration branch; PRs merge into `main` |

## Daily flow

1. Commit on `developing`
2. Open PR `developing` → `main`
3. CI must pass; maintainer approval required on `main`
4. Merge to `main`

## Release flow (GitHub Releases — no npm registry)

Packages are **not** published to the npm registry anymore (the last registry version is `1.10.1`; npm granular tokens now require an OTP, which broke unattended publishing — `EOTP` in the v1.10.1-data.33 run). Every release is a **GitHub Release** built by [`.github/workflows/release.yml`](../.github/workflows/release.yml) with the repository's own `GITHUB_TOKEN`: no npm account, no secret, no 2FA prompt.

**Order matters:** bump **all** `package.json` files **before** creating the git tag. The Release workflow fails if the tag does not match every package version.

### Released packages (same semver on every release)

| Package | Path | Release asset |
|---------|------|---------------|
| `@br-validators/core` | `packages/br-validators/` | `br-validators-core-<version>.tgz` |
| `@br-validators/cli` | `apps/cli/` | `br-validators-cli-<version>.tgz` |
| `@br-validators/zod` | `packages/br-validators-zod/` | `br-validators-zod-<version>.tgz` |
| `@br-validators/react-hook-form` | `packages/br-validators-rhf/` | `br-validators-react-hook-form-<version>.tgz` |
| `@br-validators/express` | `packages/br-validators-express/` | `br-validators-express-<version>.tgz` |
| `@br-validators/vue` | `packages/br-validators-vue/` | `br-validators-vue-<version>.tgz` |
| Reference data | `packages/br-validators/src/**/data/` | `br-validators-data-<version>.tar.gz`, `catalog.json` |

After merge to `main`:

```bash
# 1. Bump version in ALL six package.json files (identical semver)
# 2. Move CHANGELOG [Unreleased] → [X.Y.Z] - YYYY-MM-DD
# 3. Update READMEs (Current release + feature tables)
# 4. Commit and push to main (via PR from developing)

# 5. Only then — tag must match package.json (with v prefix)
git tag -a v1.6.1 -m "Release v1.6.1"
git push origin v1.6.1
```

| Tag pushed | `package.json` version | Result |
|------------|------------------------|--------|
| `v1.6.1` | `1.6.0` | **Fails** — version mismatch |
| `v1.6.1` | `1.6.1` | **Releases** all six packages + data |

Pushing tag `v*` (or `workflow_call` / `workflow_dispatch` with a tag) runs the Release workflow:

1. Verifies the tag matches all six `package.json` versions
2. Runs `pnpm verify`
3. `scripts/build-release-artifacts.ts` — `npm pack` of each package (internal `workspace:` dependencies point at the sibling tarball of the same release), deterministic data bundle, `catalog.json`, `SHA256SUMS`
4. Creates the GitHub Release (marked *latest* unless `-alpha`/`-beta`/`-rc`) or re-uploads assets with `--clobber` — safe to re-run

Local and CI `pnpm publish` are blocked by `scripts/assert-ci-publish.mjs` (`prepublishOnly` on every package).

### Re-run a failed release

Actions → **Release** → **Run workflow** → enter the existing tag (e.g. `v1.10.1-data.34`).

### Install from a release

```bash
VERSION=1.10.1-data.34
npm install "https://github.com/open-data-brazil/br-validators/releases/download/v$VERSION/br-validators-core-$VERSION.tgz"
```

### Sync developing after release

```bash
git checkout developing && git merge main && git push origin developing
```

## `main` protection

- Required status check: **test** (CI workflow)
- Required pull request review: **1** approving review
- Releases use tags — **no** npm account, `npm login` or publish token involved

## Automated data refresh publish (daily bot)

Workflow: [`.github/workflows/data-refresh-bot.yml`](../.github/workflows/data-refresh-bot.yml)

When embedded reference data **drifts** (`datasetsAlterados > 0` and at least one of `totalAdicionados`, `totalRemovidos`, or `totalAlterados` > 0):

1. `pnpm data:refresh` → `pnpm verify`
2. `scripts/bump-data-patch.ts` — data-line bump (`1.8.3` → `1.8.3-data.1`, not `1.8.4`) on all six packages + CHANGELOG (pure git/semver — no registry lookup)
3. `scripts/data-refresh-publish.mjs` — commit + push (or open PR)
4. Tag `vX.Y.Z` → [`.github/workflows/release.yml`](../.github/workflows/release.yml) publishes the GitHub Release

**`main` is protected** — the default `GITHUB_TOKEN` cannot push to `main`. Choose one setup:

### Option A — fully automated (recommended)

1. GitHub → Settings → Developer settings → **Fine-grained personal access token**
   - Repository access: this repo only
   - Permissions: **Contents** read/write, **Pull requests** read/write, **Workflows** read (optional)
2. Repo → Settings → Secrets → Actions → **`DATA_REFRESH_GITHUB_TOKEN`** — paste the PAT
3. Branch protection → **Allow specified actors to bypass** → add the PAT owner (or enable bypass for `github-actions[bot]` if using classic PAT via bot)

With the secret set, the bot pushes directly to `main` and pushes the tag; the PAT-pushed tag triggers `release.yml`.

### Option B — PR fallback (no PAT)

Without `DATA_REFRESH_GITHUB_TOKEN`:

1. Bot opens `bot/data-release/vX.Y.Z-YYYY-MM-DD` → PR to `main`
2. Merge the PR (approval required by branch protection)
3. [`.github/workflows/data-refresh-tag-on-merge.yml`](../.github/workflows/data-refresh-tag-on-merge.yml) pushes tag `vX.Y.Z` after merge and calls `release.yml` directly (a `GITHUB_TOKEN` tag push would not trigger it)

Enable **Allow auto-merge** on the repo if you want zero-touch after the first approval.

### Required secrets

| Secret | Purpose |
|--------|---------|
| `DATA_REFRESH_GITHUB_TOKEN` | Optional — direct push + tag from data refresh bot |

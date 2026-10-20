#!/usr/bin/env bash
# Publish a workspace package only when that exact version is not on npm yet.
# Used by .github/workflows/release.yml — CI-only (see assert-ci-publish.mjs).
#
# Authentication (npm CLI 11.5.1+):
#   - OIDC trusted publishing: no secret needed, npm exchanges the GitHub Actions
#     ID token for a short-lived registry token.
#   - Fallback: NPM_TOKEN / NODE_AUTH_TOKEN (granular token with read/write on
#     @br-validators/*) when no trusted publisher is configured yet.
set -euo pipefail

PACKAGE_DIR="${1:?package directory (e.g. packages/br-validators)}"
NPM_NAME="${2:?npm package name}"
VERSION="${3:?semver}"
NPM_TAG="${4:?dist-tag (latest|alpha|beta|rc)}"

has_token=0
if [ -n "${NODE_AUTH_TOKEN:-}" ] || [ -n "${NPM_TOKEN:-}" ]; then
  has_token=1
fi

has_oidc=0
if [ -n "${ACTIONS_ID_TOKEN_REQUEST_URL:-}" ] && [ -n "${ACTIONS_ID_TOKEN_REQUEST_TOKEN:-}" ]; then
  has_oidc=1
fi

if npm view "${NPM_NAME}@${VERSION}" version 2>/dev/null | grep -qx "${VERSION}"; then
  echo "SKIP: ${NPM_NAME}@${VERSION} already on npm"
elif [ "$has_token" -eq 0 ] && [ "$has_oidc" -eq 0 ]; then
  echo "::error::Missing npm credentials — cannot publish ${NPM_NAME}@${VERSION}." >&2
  echo "Configure a trusted publisher (npmjs.com → package → Settings → Trusted Publisher → GitHub Actions)," >&2
  echo "or set repository secret NPM_TOKEN (granular token with read/write + create on @br-validators/*)." >&2
  exit 1
else
  echo "PUBLISH: ${NPM_NAME}@${VERSION} (tag ${NPM_TAG}, auth: $([ "$has_oidc" -eq 1 ] && echo 'oidc+token' || echo 'token'))"
  set +e
  npm publish "${PACKAGE_DIR}" --access public --tag "${NPM_TAG}"
  status=$?
  set -e
  if [ "$status" -ne 0 ]; then
    echo "::error::Failed to publish ${NPM_NAME}@${VERSION} (exit $status)." >&2
    echo "Check the trusted publisher configuration (npmjs.com → package → Settings → Trusted Publisher)," >&2
    echo "or that NPM_TOKEN is a valid granular token with read/write + create on @br-validators/*," >&2
    echo "not expired/revoked, and that 2FA is satisfied (bypass-2FA tokens bypass it by design)." >&2
    exit "$status"
  fi
fi

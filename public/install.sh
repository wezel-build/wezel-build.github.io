#!/bin/sh
#
# wezel meta-installer.
#
# Resolves the most recent GitHub release (prereleases included, since
# wezel ships those today) and forwards to its bundled installer.
#
# Usage:  curl -fsSL https://wezel.build/install.sh | sh
#
set -eu

REPO="wezel-build/wezel"
ASSET="wezel_cli-installer.sh"

if ! command -v curl >/dev/null 2>&1; then
  echo "wezel-install: curl is required" >&2
  exit 1
fi

# The /releases endpoint lists ALL releases (prereleases included) sorted
# newest-first. The /releases/latest endpoint excludes prereleases, which
# is why we don't use it.
TAG="$(curl -fsSL \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${REPO}/releases?per_page=1" \
  | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' \
  | head -n 1)"

if [ -z "${TAG}" ]; then
  echo "wezel-install: could not determine latest release from GitHub API" >&2
  echo "wezel-install: check https://github.com/${REPO}/releases" >&2
  exit 1
fi

UPSTREAM="https://github.com/${REPO}/releases/download/${TAG}/${ASSET}"

echo "wezel-install: resolving ${TAG} -> ${ASSET}" >&2
curl -fsSL "${UPSTREAM}" | sh

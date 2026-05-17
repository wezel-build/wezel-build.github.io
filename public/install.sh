#!/bin/sh
#
# wezel meta-installer.
#
# Fetches and executes the install script from the latest GitHub release.
# Pinned to https://github.com/wezel-build/wezel/releases/latest, so this URL
# is stable while the released installer evolves.
#
# Usage:  curl -fsSL https://wezel-build.github.io/install.sh | sh
#
set -eu

UPSTREAM="https://github.com/wezel-build/wezel/releases/latest/download/install.sh"

if ! command -v curl >/dev/null 2>&1; then
  echo "wezel-install: curl is required" >&2
  exit 1
fi

curl -fsSL "$UPSTREAM" | sh

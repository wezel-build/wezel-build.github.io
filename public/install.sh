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

# curl >= 7.71 can also retry rate-limit 403s (--retry-all-errors); older builds
# still retry connection errors, 5xx and 429 via plain --retry.
RETRY_ALL=0
if curl --help all 2>/dev/null | grep -q -- '--retry-all-errors'; then
  RETRY_ALL=1
fi

# Retry transient GitHub failures with exponential backoff: CDN 504s, request
# timeouts, and (where supported) rate-limit 403s.
get() {
  if [ "$RETRY_ALL" -eq 1 ]; then
    curl -fsSL --retry 5 --retry-max-time 60 --retry-all-errors "$@"
  else
    curl -fsSL --retry 5 --retry-max-time 60 "$@"
  fi
}

# A token (exported by CI as GITHUB_TOKEN / GH_TOKEN) lifts the GitHub API limit
# from 60 req/hr per IP. Shared CI runner IPs routinely exhaust the anonymous
# quota — the usual cause of an intermittent HTTP 403 on the release lookup.
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"

releases() {
  if [ -n "$TOKEN" ]; then
    get -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${TOKEN}" "$1"
  else
    get -H "Accept: application/vnd.github+json" "$1"
  fi
}

# The /releases endpoint lists ALL releases (prereleases included) sorted
# newest-first. The /releases/latest endpoint excludes prereleases, which
# is why we don't use it.
TAG="$(releases "https://api.github.com/repos/${REPO}/releases?per_page=1" \
  | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' \
  | head -n 1)"

if [ -z "${TAG}" ]; then
  echo "wezel-install: could not determine latest release from GitHub API" >&2
  echo "wezel-install: check https://github.com/${REPO}/releases" >&2
  exit 1
fi

UPSTREAM="https://github.com/${REPO}/releases/download/${TAG}/${ASSET}"
echo "wezel-install: resolving ${TAG} -> ${ASSET}" >&2

# Run the bundled installer, retrying the whole thing: its binary-tarball
# download can hit transient GitHub CDN errors (e.g. HTTP 504) with no retry
# of its own.
n=1
while :; do
  if installer="$(get "${UPSTREAM}")" && printf '%s\n' "${installer}" | sh; then
    exit 0
  fi
  if [ "${n}" -ge 3 ]; then
    echo "wezel-install: installer failed after ${n} attempts" >&2
    exit 1
  fi
  echo "wezel-install: attempt ${n} failed, retrying in $((n * 3))s..." >&2
  sleep "$((n * 3))"
  n=$((n + 1))
done

---
title: Scenarios
description: What a build scenario is and why Wezel tracks them.
---

A **scenario** is a named, repeatable build invocation — a specific combination of command, flags, and working directory that represents something your team actually runs.

Examples:

- A full incremental `cargo build` from a clean checkout
- `cargo test --workspace` after touching a core crate
- A frontend `tsc --noEmit` type-check on CI

## Why scenarios, not raw builds?

Raw build times are noisy. The same project produces wildly different numbers depending on cache state, what changed, and which machine ran it. Scenarios give Wezel a stable unit of comparison: apples to apples, run to run, commit to commit.

## Observed vs. tracked

| | Observed | Tracked |
|---|---|---|
| Source | Developer machines | CI |
| Purpose | Discover what's painful | Benchmark deterministically |
| Cadence | Every build | Every commit |

**Observed scenarios** give you a real-world picture of team pain. **Tracked scenarios** give you the reproducible signal needed to catch regressions commit-by-commit.

Once Wezel surfaces your highest-impact observed scenarios, you promote them to tracked so they're benchmarked on every commit in CI.

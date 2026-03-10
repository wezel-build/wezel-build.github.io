---
title: Benchmark definitions
description: How to define forager benchmarks using benchmark.toml files.
---

Benchmarks live under `.wezel/benchmarks/<name>/benchmark.toml` in your project repository.
Each benchmark describes an ordered sequence of steps to run against a specific commit.
Patch files and the benchmark TOML are committed alongside your code so they version with it.

```
.wezel/benchmarks/
  incremental-build/
    benchmark.toml
    add-one-fn.patch
```

## benchmark.toml

```toml
name = "incremental-build"
description = "Measures incremental build cost of adding a function"

[[steps]]
name = "baseline"
cmd = "cargo build --release"
env = { CARGO_INCREMENTAL = "1" }

[[steps]]
name = "add-one-fn"
diff = "add-one-fn.patch"
cmd = "cargo build --release"
env = { CARGO_INCREMENTAL = "1" }

[[steps]]
name = "measure-llvm"
forager = "llvm-lines"
```

### Top-level fields

| Field | Required | Description |
|---|---|---|
| `name` | yes | Benchmark identifier. Must match the directory name. |
| `description` | no | Human-readable label shown in Anthill. |
| `steps` | yes | Ordered list of steps. |

## Steps

Steps are the unit of work. Each step runs a forager plugin, optionally after applying a patch.
Steps run sequentially and share repo state — patches applied in earlier steps persist into later ones.

### Shared step fields

| Field | Required | Description |
|---|---|---|
| `name` | yes | Step identifier, used in measurement output. |
| `forager` | no | Plugin to run. Defaults to `exec` when `cmd` is present. |
| `description` | no | Human-readable label. |
| `diff` | no | Patch file to apply before this step runs (see below). |

All other fields are forager-specific and passed directly to the plugin as inputs.
See the individual forager docs for what each one accepts.

### The `exec` default

If `forager` is omitted and `cmd` is present, the step runs with the built-in `exec` forager.
These two are equivalent:

```toml
[[steps]]
name = "build"
cmd = "cargo build --release"
```

```toml
[[steps]]
name = "build"
forager = "exec"
cmd = "cargo build --release"
```

### Applying patches

Set `diff` to a patch filename (relative to the benchmark directory) to apply it before the step runs:

```toml
[[steps]]
name = "add-one-fn"
diff = "add-one-fn.patch"
cmd = "cargo build --release"
```

If `diff` is absent, no patch is applied. Patches accumulate — each one stacks on top of the previous step's repo state.

Patches are standard unified diffs created with `git diff` or `git format-patch`.

## Foragers

A forager is a binary named `forager-<name>` on your `PATH`.
Each one accepts inputs via `FORAGER_INPUTS` and writes its result to `FORAGER_OUT`.
Run `forager-<name> --schema` to see what a forager expects and produces.

Built-in foragers:

- [exec](/docs/forager/exec) — runs a shell command; produces no measurement
- [llvm-lines](/docs/forager/llvm-lines) — counts LLVM IR lines via `cargo-llvm-lines`

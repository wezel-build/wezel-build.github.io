---
title: "exec"
description: Forager plugin that runs a shell command with no measurement output.
---

Runs a shell command. Produces no measurement — use it for build steps that set up repo state for a later measurement step.

`exec` is the default forager: if a step has a `cmd` field and no `forager` field, it runs with `exec`.

## Inputs

| Field | Required | Description |
|---|---|---|
| `cmd` | yes | Shell command to run (passed to `sh -c`). |
| `env` | no | Extra environment variables merged into the current environment. |
| `cwd` | no | Working directory override. Defaults to the project root. |

## Example

```toml
[[steps]]
name = "build"
cmd = "cargo build --release"
env = { CARGO_INCREMENTAL = "1", RUSTFLAGS = "-C opt-level=3" }
```

## Output

Always writes `{ "measurement": null }`. A non-zero exit code marks the step as failed and skips its measurement, but does not abort the rest of the scenario run.

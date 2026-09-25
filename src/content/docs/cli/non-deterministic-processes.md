---
title: Measure non-deterministic processes
description: Use sampling and aggregation when a measurement varies between runs.
---

Compiling the same source does not take exactly the same amount of time on every
run. Other processes compete for CPU time, files may be cached, and the
operating system may schedule work differently. A single result can therefore
make an unchanged build look faster or slower than it is.

In this tutorial, you will run the `build-hello` step five times and use the
minimum result as its `build-time` summary.

## Before you begin

Complete [Build a multi-step
experiment](/docs/cli/multi-step-experiment) first. Continue from the same
repository and `example-experiment`.

## Sample the build step

Update the build step in
`.wezel/experiments/example-experiment/experiment.toml` so each summary uses
five samples:

```toml title=".wezel/experiments/example-experiment/experiment.toml"
[step.exec.build-hello]
cmd = "cc hello.c -o hello"
summary.build-time = { outcome = "wall_time_ms", samples = 5, aggregation = "min" }
summary.user-cpu-time = { outcome = "user_time_ms", samples = 5, aggregation = "min" }
summary.peak-memory = { outcome = "max_rss_bytes", samples = 5, aggregation = "min" }
```

Leave the `measure-hello` step unchanged.

- `samples = 5` tells Wezel to run `build-hello` five times.
- `aggregation = "min"` selects the lowest matching outcome for each summary.

Wezel requires an aggregation whenever a summary uses more than one sample.
Without it, there would be several outcomes but no rule for turning them into
one summary. Every summary on a step must use the same sample count because the
executor runs once per sample and emits all of its outcomes together.

## How the samples run

Before the first sample, Wezel records the state of the experiment workspace.
It restores that state before each later sample, so every compiler invocation
starts with the same files rather than reusing the executable from the previous
sample. As described in the first tutorial, this workspace is a temporary copy
of your repository used for the current experiment run.

```text
build-hello
├── sample 1 ─┐
├── sample 2  │
├── sample 3  │
├── sample 4  │
└── sample 5 ─┘
               ├── minimum wall time → build-time
               ├── minimum CPU time → user-cpu-time
               └── minimum memory use → peak-memory
                              │
                              ▼
measure-hello → binary-size summary
```

The output from the final build remains in the workspace, so the
`measure-hello` step can still measure the executable afterward.

## Run the sampled experiment

```sh frame="terminal"
wezel experiment run example-experiment
```

The report lists all five samples and the resulting summary:

```text title="Output"
step.exec.build-hello
  build-time  5 samples  71ms  72ms  84ms  76ms  76ms
  user-cpu-time  5 samples  57ms  61ms  65ms  59ms  63ms
  peak-memory  5 samples  36.5 MiB  36.6 MiB  36.5 MiB  36.7 MiB  36.6 MiB

SUMMARY          THIS RUN  PREVIOUS         Δ
─────────────────────────────────────────────────
build-time           71ms      73ms     -2ms  -2.7%
user-cpu-time        57ms      60ms     -3ms  -5.0%
peak-memory      36.5 MiB  36.6 MiB  -102 KiB  -0.27%
binary-size         99496     99496       ±0
```

The lowest build-time sample is 71 milliseconds, so that becomes the
`build-time` summary. CPU time and peak memory are aggregated independently
from the outcomes produced by the same five executions.

The minimum favors the least-contended execution observed in the sample set.
It filters out runs slowed down by transient activity elsewhere on the machine,
giving the comparison a more useful input than one measurement.

Next, learn [how executors turn steps into
outcomes](/docs/cli/experiment-outcomes).

---
title: How experiments produce outcomes
description: Understand how steps, executors, outcomes, and summaries fit together.
---

An experiment describes what Wezel should measure. Executors provide the code
that performs the work and turns it into numerical outcomes.

```text
experiment
└── ordered steps
    └── executor + inputs
        └── outcomes
            └── selected or aggregated summaries
```

This separation lets one experiment combine different kinds of work. The
multi-step example uses `exec` to compile a program and `filesize` to inspect
the executable, while Wezel coordinates their order and compares their
summaries between runs.

## A step invokes an executor

Consider the build step from the previous tutorials:

```toml
[step.exec.build-hello]
cmd = "cc hello.c -o hello"
summary.build-time = { outcome = "wall_time_ms", samples = 5, aggregation = "min" }
```

The table name identifies three things:

- `step` declares a step;
- `exec` selects the executor;
- `build-hello` names this invocation.

The remaining executor-specific fields are its inputs. Here, `cmd` tells
`exec` which shell command to run. A different executor accepts inputs suited
to its own task: `filesize`, for example, accepts a file glob.

## An executor emits outcomes

An executor can perform an arbitrary action, but it reports results to Wezel in
a consistent form. Each outcome has a name, a numerical value, and metadata
such as its unit and whether a higher or lower value is better.

For example, the `exec` executor runs a command and emits outcomes including
`wall_time_ms`, `user_time_ms`, and `max_rss_bytes`. The `filesize` executor
emits one byte-count outcome for each file matched by its glob.

Executors do not decide which of their outcomes matter to your experiment.
They expose the available measurements; the experiment selects them.

## A summary selects what to compare

This line selects one outcome from `exec`:

```toml
summary.build-time = { outcome = "wall_time_ms", samples = 5, aggregation = "min" }
```

`build-time` is the summary name shown in reports. `wall_time_ms` is the outcome
it uses. Because the step is sampled five times, `min` selects the lowest of
the five matching outcomes as the summary value.

The Wezel CLI compares summaries with the previous run. The outcome metadata
tells it that a higher build time or larger file is worse, allowing the CLI to
distinguish regressions from improvements.

## Structured command output needs an executor that understands it

`exec` measures the process it launches; it does not interpret the command's
standard output. If you run `tokei --output json` through `exec`, you can track
how long `tokei` took, but fields such as code lines and comment lines do not
automatically become outcomes.

Turning those fields into measurements requires an executor that understands
that output format. Such an executor would run or invoke `tokei`, parse its
JSON, and emit named numerical outcomes for Wezel. You can install an existing
executor when one understands the measurement you need, or build one for a new
measurement.

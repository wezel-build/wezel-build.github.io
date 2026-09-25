---
title: Your first measurement
description: Compile a small program and measure its build time with the Wezel CLI.
---

A Wezel experiment turns work in your repository into numerical measurements
that can be compared over time. In this tutorial, you will compile a small C
program and measure how long the compiler takes.

The example is deliberately small, but the pattern applies to the commands your
project already runs: choose a command, inspect the outcomes its executor
produces, and select the value you want Wezel to track.

## Before you begin

You need:

- the [Wezel CLI installed](/docs/installation);
- a Git repository with at least one commit;
- a C compiler available as `cc`.

Run the following commands from the repository root.

## Create a program to build

Create `hello.c`:

```c title="hello.c"
#include <stdio.h>

int main(void) {
    puts("Hello from Wezel");
    return 0;
}
```

This gives the experiment a quick build with a predictable output: an
executable named `hello`.

## Initialize Wezel

```sh frame="terminal"
wezel project init
```

Enter a project name when prompted. This creates the `.wezel` directory that
will contain the project configuration and experiment definitions.

If prompted to open the Wezel Dashboard, choose **No**. Connecting the project
will be added later, once we have settled the CLI workflow.

## Add the exec executor

An **experiment** is a repeatable measurement made of ordered **steps**. Each
step uses an **executor**: a program that performs an action and returns named
values called **outcomes**.

The `exec` executor runs a shell command and reports outcomes such as elapsed
time, CPU time, and peak memory usage. Add it to the project:

```sh frame="terminal"
wezel project tool add exec https://github.com/wezel-build/wezel_exec
```

The name `exec` is how experiment definitions refer to this executor.

## Define the experiment

Create the experiment directory:

```sh frame="terminal"
mkdir -p .wezel/experiments/example-experiment
```

Create `.wezel/experiments/example-experiment/experiment.toml`:

```toml title=".wezel/experiments/example-experiment/experiment.toml"
[step.exec.build-hello]
cmd = "cc hello.c -o hello"
summary.build-time = { outcome = "wall_time_ms" }
```

The definition describes this flow:

```text
build-hello step
└── exec
    ├── runs cc hello.c -o hello
    ├── creates the hello executable
    ├── wall_time_ms outcome → build-time summary
    └── other process outcomes
```

- `[step.exec.build-hello]` defines a step. `exec` selects the executor, and
  `build-hello` names this use of it.
- `cmd` tells the executor which command to run.
- The executor returns several outcomes that describe the process.
- `summary.build-time` selects `wall_time_ms`. A **summary** is an outcome Wezel
  retains for comparison across runs.

## Validate the experiment

```sh frame="terminal"
wezel experiment lint
```

Linting checks the definition against the executor's schema without running the
step. The result should report one valid experiment with no errors.

```text title="Output"
example-experiment  1 step  ok

1 experiment validated, no errors.
```

## Run the experiment

The Wezel CLI runs the experiment in a temporary copy of your repository, not
directly in your working tree. The copy starts at the current commit and
includes your uncommitted changes. Every step starts in the project root of
that temporary workspace, and all steps in a run share the files created there.

```sh frame="terminal"
wezel experiment run example-experiment --verbose
```

A successful first run looks like this:

```text title="Output"
example-experiment · a5941d9 on main · 131ms
no previous run to compare against

SUMMARY     THIS RUN  PREVIOUS  Δ
─────────────────────────────────
build-time      56ms         —

Outcomes:
  build-hello  58ms
    wall_time_ms = 55.873375
    user_time_ms = 51.093
    system_time_ms = 26.914
    max_rss_bytes = 38158336
    minor_page_faults = 6532
    major_page_faults = 201
    voluntary_context_switches = 3
    involuntary_context_switches = 307

saved .wezel/runs/example-experiment/2026-09-22T17-27-40Z-a5941d9
```

The summary table contains `build-time`. Under **Outcomes**, the `build-hello`
step lists the elapsed time, CPU time, memory use, and other process
measurements returned by `exec`.

The final line means the Wezel CLI recorded the result in the project's local
run history. The next time you run `example-experiment`, this result appears in
the **PREVIOUS** column and provides the baseline for the reported change. It is
not uploaded to the Wezel Dashboard.

The `hello` executable exists in the temporary experiment workspace rather
than your working tree. Another step in this run can inspect it.

## Select more outcomes

One step can retain several outcomes as summaries. Add CPU time and peak memory
to the same step:

```toml title=".wezel/experiments/example-experiment/experiment.toml"
[step.exec.build-hello]
cmd = "cc hello.c -o hello"
summary.build-time = { outcome = "wall_time_ms" }
summary.user-cpu-time = { outcome = "user_time_ms" }
summary.peak-memory = { outcome = "max_rss_bytes" }
```

Run the experiment again:

```sh frame="terminal"
wezel experiment run example-experiment
```

```text title="Output"
SUMMARY        THIS RUN  PREVIOUS      Δ
────────────────────────────────────────────
build-time         54ms      56ms   -2ms  -3.6%
user-cpu-time      49ms         —
peak-memory    36.2 MiB         —
```

`build-time` is compared with the first run. The two new summaries have no
previous value because the first run did not select those outcomes.

You have now run one experiment with one step, several outcomes, and three
selected summaries.

Next, [add a second step to measure the compiled
executable](/docs/cli/multi-step-experiment).

---
title: Build a multi-step experiment
description: Measure the build time and output size of a compiled program.
---

The first experiment compiled `hello.c` and retained its build time. The build
also produced an executable. In this tutorial, you will add a second step that
measures the size of that output.

Together, the steps answer two related questions: how long did the build take,
and how large was the artifact it produced? The same structure works for
compiled applications, web bundles, archives, and other generated artifacts.

## Before you begin

Complete [Your first measurement](/docs/cli/first-measurement) first. Continue
from the same repository and `example-experiment`.

## Add the filesize executor

The `filesize` executor returns the size of every file matched by a glob. Add it
to the project:

```sh frame="terminal"
wezel project tool add filesize https://github.com/wezel-build/wezel_filesize
```

## Add the second step

Replace `.wezel/experiments/example-experiment/experiment.toml` with:

```toml title=".wezel/experiments/example-experiment/experiment.toml"
[step.exec.build-hello]
cmd = "cc hello.c -o hello"
summary.build-time = { outcome = "wall_time_ms" }
summary.user-cpu-time = { outcome = "user_time_ms" }
summary.peak-memory = { outcome = "max_rss_bytes" }

[step.filesize.measure-hello]
glob = "hello"
summary.binary-size = { outcome = "hello" }
```

The experiment now describes this flow:

```text
build-hello (exec)
├── compiles hello.c
├── creates the hello executable
├── wall_time_ms outcome → build-time summary
├── user_time_ms outcome → user-cpu-time summary
└── max_rss_bytes outcome → peak-memory summary
        │
        ▼
measure-hello (filesize)
└── hello outcome → binary-size summary
```

Wezel runs steps in the order they appear in the experiment file. Both steps
use the same experiment workspace, so `measure-hello` can inspect the executable
created by `build-hello`.

Each step has its own executor, outcomes, and selected summaries. The experiment
combines those summaries into one result for the build.

## Run the experiment

```sh frame="terminal"
wezel experiment run example-experiment --verbose
```

The summary table now includes `binary-size` alongside the three build
summaries:

```text title="Output"
SUMMARY          THIS RUN  PREVIOUS       Δ
──────────────────────────────────────────────
build-time           58ms      54ms   +4ms  +7.4%
user-cpu-time        51ms      49ms   +2ms  +4.1%
peak-memory      36.4 MiB  36.2 MiB  +205 KiB  +0.55%
binary-size         33432         —

Outcomes:
  build-hello  61ms
    wall_time_ms = 58.174666
    ...
  measure-hello  3ms
    hello = 33432
```

The verbose output groups the process outcomes under `build-hello` and the
executable's size under `measure-hello`. The build summaries have previous
values from the last tutorial. `binary-size` does not because this is the first
run that selects it.

## Introduce a size regression

Replace `hello.c` with a version that includes a large block of data:

```c title="hello.c"
#include <stdio.h>

static const volatile unsigned char payload[65536] = {
    [0] = 1,
    [65535] = 1,
};

int main(void) {
    puts("Hello from Wezel");
    return payload[0] == payload[65535] ? 0 : 1;
}
```

The first and last initialized bytes force the 64 KiB array to occupy space in
the compiled program. `volatile` prevents the compiler from replacing the
array lookup with a constant.

Run the experiment again:

```sh frame="terminal"
wezel experiment run example-experiment --verbose
```

The summary table compares this run with the previous one:

```text title="Output"
SUMMARY          THIS RUN  PREVIOUS         Δ
─────────────────────────────────────────────────
build-time           73ms      58ms    +15ms   +26%
user-cpu-time        60ms      51ms     +9ms   +18%
peak-memory      36.6 MiB  36.4 MiB  +205 KiB  +0.55%
binary-size         99496     33432    +66064  +198%
```

The `binary-size` row shows the increase caused by the payload. Because a
smaller binary is better, the Wezel CLI highlights that increase as a
regression.

The process measurements moved too, even though the build command did not
change. One timing result is not enough to tell whether the build itself
regressed: process timing is affected by activity on the machine and other
conditions outside the build.

Next, learn how to [measure non-deterministic
processes](/docs/cli/non-deterministic-processes) with repeated samples and
aggregation.

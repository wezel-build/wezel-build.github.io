---
title: Quickstart
description: A first tracked scenario, from config file to first reported run.
---

<!-- COPY SLOT: standfirst - what the reader has at the end of this page. -->

## Define an experiment

An experiment is a named set of steps. Each step names a tool and a label:

```toml title="wezel.toml"
[step.cargo.build]
args = ["build", "--release"]

[step.filesize.binary]
path = "target/release/wezel"
```

<!-- COPY SLOT: explain the [step.<tool>.<name>] shape in prose. -->

## Run it

```sh frame="terminal"
wezel run
```

<!-- COPY SLOT: what a run does, and what it writes. -->

## Read the result

One run produces one outcome, which can be summarised more than one way:

| Summary | Tool | Value |
| --- | --- | --- |
| wall time | `cargo` | 42.1s |
| binary size | `filesize` | 18.4 MB |

<!-- COPY SLOT: how to read the numbers; what a baseline is. -->

> [!TIP]
> <!-- COPY SLOT: the one thing worth doing next. -->

## Next

- [Scenarios](/docs/tracking/scenarios) - choosing what to measure.
- [Continuous integration](/docs/tracking/continuous-integration) - running this on every push.

---
title: Introduction
description: What Wezel is and why it exists.
---

Welcome to Wezel, a build observability toolkit for masses.

Wezel helps capture and babysit build scenarios you care about the most, by describing them via a DSL based on TOML. These scenarios (also called "experiments") are then executed periodically as your codebase grows. When they regress in any way, Wezel will make sure to pin-point an exact commit at which they have regressed.

### Why should I care

Build times are an invisible tax on your productivity. Worse yet, it's not something you usually keep track of, if only for a brief moment after you've optimized them for the N-th time.

Yours truly has done it over and over again; I kept the tally of build scenarios for Zed and how long they take. Wezel sprang out of a belief that this is a problem nobody else bothered with solving, yet one that deserves being solved. 

It is my honest attempt at making all obscure articles about yet another way to fix your build times obsolete. You, the developer, should not be held captive by your build tool's implementation.

Besides, even if your builds are painfully slow today, they don't necessarily have to grind to a halt tomorrow - not without you knowing when and why. If you do manage to make your builds fast, Wezel will (hopefully) help them stay that way.

Without further busytalk, let's get to work. 

### A primer on Wezel's primitives

Today, Wezel is all about **experiments**: sequences of **steps** that use some **tools** to drive your build process.

Each tool is a wrapper around some build action. `exec` is the most generic of them all: it simply executes the provided command.
```toml
# .wezel/experiments/my-debug-build-time/experiment.toml
description = "Measure debug build time"

# A single step consists of a tool name followed by a step name
[step.exec.hello-world]
cmd = "echo \"Hello, World!\""
# Steps are executed in order of definition
[step.exec.run-build]
cmd = "cargo build"

```
With `wezel experiment run my-debug-build-time` that experiment can be executed. 

**TO_FILL_IN_EXPERIMENT_RESULT**



Another tool we could use to track a Rust build is `cargo`:
```toml
# .wezel/experiments/my-debug-build-time/experiment.toml
description = "Measure debug build time"

[step.cargo.run-build]
command = "build"
build_target = "workspace"
```
While you may be tempted to just use `exec` for everything, there is a good reason to not do so - tool runs produce *outcomes* that provide insight into the execution of a given tool. Outcomes can range from profiling data for your compiler for all packages all the way to the granular timings for each package being built. `exec` can't give you that.

Outcomes are crucial for regression detection: while they can take any form you like (be it a bunch of files on disk for your later convenience or hard data on the state of your build), you can **summarize** them into metric values we can use to track the health of your build.

Let's go back to our previous example and use metrics produced by `cargo` tool:
```toml
# .wezel/experiments/my-debug-build-time/experiment.toml
description = "Measure debug build time"

[step.cargo.run-build]
command = "build"
build_target = "workspace"
# One of the metrics that `cargo` produces is `time_ms`; total time needed to run the build.
# `bisect = true` makes Wezel look for a commit that introduced a regression in it, should it regress.
# `bisect` defaults to true, so the following is actually redundant.
summary.my-build-time = { outcome = "time_ms", bisect = true }
```

You can also go a step further and run a given step several times and aggregate a metric from multiple runs into a single summary :
```toml
# .wezel/experiments/my-debug-build-time/experiment.toml
description = "Measure debug build time"

[step.cargo.run-build]
command = "build"
build_target = "workspace"
# This value of this summary will be build time averaged over 5 builds
# (with each one starting from the same snapshot of the filesystem state).
summary.my-build-time = { outcome = "time_ms", bisect = true,
                          aggregation = "mean", samples = 5}
```

With all that out of the way, let's actually install this thing.
---
title: Track performance over time
description: Follow experiment measurements across commits in the Wezel Dashboard.
---

The Wezel CLI compares runs on your machine. The Wezel Dashboard adds repository
history: it runs committed experiments, stores their summaries against Git
commits, and keeps the results available to the team.

Once a project is connected and its experiments have runners, the measurement
loop looks like this:

```text
push commits
    │
    ▼
Dashboard discovers the current branch head
    │
    ▼
runner executes each assigned experiment
    │
    ▼
summaries are stored with the commit and platform
    │
    ▼
the next measured run is compared with the previous one
```

You do not need to invoke the Wezel CLI for these scheduled runs. The CLI
remains useful for developing and checking an experiment before you push it.

## Read the project overview

Open the project in the Dashboard. Its overview brings together:

- the experiments discovered in the repository;
- the latest measured commit and result for each experiment;
- commits that have arrived since the latest measurement;
- work that is queued or running; and
- regressions that need attention.

The scheduler measures the current branch head when the project is due to run.
It does not build an ever-growing queue for every commit pushed between
scheduling intervals. This keeps routine measurement focused on current code;
if a regression appears across skipped commits, Wezel can measure those commits
later to find where the change began.

## Follow one experiment

From a project page, open the command palette and select **View experiments**.
Then select `example-experiment`.

The **Outputs** section lists the summaries selected by the experiment, such as
`build-time` and `binary-size`. For each output, it shows the latest value, the
direction considered better, and whether an open regression exists.

The **Runs** section shows every recorded run for the selected platform. Each
row connects a commit to its measured outputs and reports how they moved from
the previous recorded run.

That comparison is with the previous **measured run**, not necessarily the
previous Git commit. If several commits landed before the next scheduled run,
the change covers the whole unmeasured range.

## Keep platforms separate

A result is stored with the operating system and architecture of the runner
that produced it. Use the platform selector when an experiment runs in more
than one environment.

Separate histories prevent a value from one platform becoming the baseline for
another. For meaningful comparisons, keep the toolchain and other important
machine conditions stable within each platform as well.

Next, learn how Wezel turns a significant wrong-way change into a regression
and [finds the commit that introduced it](/docs/dashboard/investigate-regressions).

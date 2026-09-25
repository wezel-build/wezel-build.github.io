---
title: Set up a runner
description: Give the Wezel Dashboard an environment for running your experiments.
---

A connected project shows the Dashboard which experiments exist. To produce
measurements, each experiment also needs a runner: an environment that checks
out a commit and executes the experiment.

Choosing a runner is part of defining what a measurement means. Build time from
controlled hardware and build time from a shared virtual machine are not
interchangeable signals.

## Open runner setup

From the connected project, open the command palette with `⌘K` on macOS or
`Ctrl+K` elsewhere. Select **Set up a runner**. The Dashboard opens the runner
setup for that project.

## Choose a runner for the measurement

Use a **Wezel-provided bare-metal runner** for measurements that are sensitive
to the machine itself, such as execution time, CPU time, and memory usage. A
stable host reduces noise and makes changes between commits easier to trust.

Bare-metal runners are not enabled automatically for new workspaces. In runner
setup, find **Wezel bare-metal** and select **Request access**. The Dashboard
opens a prefilled email to the Wezel team with the current workspace and project
details.

Use **GitHub Actions** when convenience matters more than a tightly controlled
machine. It is a good fit for deterministic measurements, experiment smoke
tests, and other checks that do not depend heavily on host performance. Hosted
GitHub runners can vary between jobs, so repeated sampling cannot make them
equivalent to dedicated hardware.

Whichever runner you choose, Wezel stores its operating system and architecture
with the result. Each platform gets a separate measurement history.

## Add a GitHub Actions runner

With runner setup open:

1. Select **Add GitHub Actions runner**.
2. Enter a name and choose the runner's platform.
3. Set the GitHub `runs-on` label and workflow path.
4. Select **Add runner**.
5. Select **Open setup PR**, then review and merge the generated workflow on
   GitHub.
6. Assign the new runner to the experiments it should execute.

The workflow lets the Dashboard dispatch experiments through the repository's
GitHub Actions configuration. Keep its platform selection consistent with the
machines selected by `runs-on`, because the platform identifies the result's
comparison history.

## Assign runners to experiments

Open the command palette and select **Set up a runner** if you have left the
runner setup. Each experiment can be assigned independently, so a repository
can send performance-sensitive experiments to bare metal and less sensitive
work to GitHub Actions.

Select the runner or runners that should execute each experiment. An experiment
without an assignment remains visible in the Dashboard but cannot produce a
scheduled result.

With a runner assigned, the Dashboard can produce the experiment's first
recorded result. Next, learn how to [track performance over
time](/docs/dashboard/track-performance).

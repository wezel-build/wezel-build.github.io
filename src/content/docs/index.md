---
title: Introduction
description: Measure your builds locally and track regressions and improvements in the Wezel app.
---

Wezel measures builds and their outputs as your code changes. It surfaces
regressions and improvements and traces them to the commits that introduced them.

## The CLI and the app

Use the CLI to define and test a measurement in your repository. A definition
can include several steps: build from scratch, apply a patch and rebuild, or
measure the size of a generated file.

The app uses those committed definitions to schedule measurements on configured
runners and track their results across commits. A runner is the machine or CI
workflow that performs the measurements.

You can use the CLI on its own. To keep watching a repository as it changes,
connect it to the app and assign a runner.

## Get started

The [quickstart](/docs/quickstart) walks through one measurement, from a local
run to adding the project in the app.

Already have a project set up? [Open the app](https://app.wezel.build).

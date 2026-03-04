---
title: Regressions
description: What Wezel considers a build regression and how it detects them.
---

A **regression** is any commit that causes a tracked build scenario to take meaningfully longer than its established baseline.

## What counts as a regression?

Not every fluctuation is a regression. Build times vary due to machine load, cache state, and other noise. Wezel compares each new measurement against a rolling baseline of recent runs for the same scenario and branch. A regression is flagged when the delta exceeds a configurable threshold (default: 10%).

## What you get when one is detected

- **Which scenario** slowed down
- **Which commit** introduced the change
- **How much time** was added (absolute and percentage)
- **What was affected** — e.g. which crates were rebuilt downstream

## What Wezel does NOT do

Wezel will not block a merge or fail a CI job over a build time regression. Build times are one signal among many. Wezel's job is to make the regression visible and easy to revisit — what you do with that information is up to your team.

## Baseline drift

Over time, intentional changes will shift your baseline. Wezel's rolling baseline adapts naturally. You can also reset it explicitly from the dashboard after a deliberate architectural change.

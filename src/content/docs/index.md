---
title: Introduction
description: Understand how the Wezel CLI and Wezel Dashboard work together.
---

Wezel tracks build time, artifact size, and other signals produced by your
project. When a measurement changes, Wezel shows whether it improved or
regressed and which commit introduced the change.

You describe each repeatable measurement as an **experiment**.

## Wezel CLI

Use the Wezel CLI to define, validate, and run experiments in your local
repository. This local workflow lets you confirm that an experiment produces the
intended measurements before tracking it over time.

## Wezel Dashboard

Once an experiment is committed, the Wezel Dashboard runs it as the repository
changes and records its results across commits. This turns individual
measurements into a history you can follow and investigate.

## Start with the CLI

[Install Wezel](/docs/installation), then [create your first
measurement](/docs/cli/first-measurement).

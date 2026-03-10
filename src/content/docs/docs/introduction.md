---
title: Introduction
description: What Wezel is and why it exists.
---

Wezel is an open-source build observability tool for teams with slow builds.

It answers three questions:

- **Where does your team spend the most time waiting for builds?**
- **When did a build scenario get slower, and which change caused it?**
- **Is it getting better or worse over time?**

## The problem

Build time creep is invisible. No single commit feels catastrophic — a few seconds here, a few there — but over months it compounds into minutes of waiting per developer per day. By the time it's painful enough to notice, the cause is buried in months of history.

## How Wezel helps

Wezel observes real builds as they happen (locally and in CI), groups them into named **observations**, and tracks their performance over time. When an observation gets meaningfully slower, it tells you — which commit, how much time was added, and what was affected — while the change is still fresh.

## What it is not

- It does not block merges.
- It does not rewrite your build system.
- It measures wall-clock duration of build invocations, not individual compiler phases.

## Open source

Wezel is MIT-licensed. You can self-host the entire stack at no cost. No telemetry, no vendor lock-in.

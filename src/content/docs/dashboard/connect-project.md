---
title: Connect a project
description: Connect a repository and its experiments to the Wezel Dashboard.
---

The Wezel CLI gives you immediate feedback while you develop an experiment.
The Wezel Dashboard carries the same measurements across commits, so you can
see when a result moved and investigate the code responsible.

In this guide, you will connect the repository from the CLI tutorials. The
Dashboard will discover its Wezel project and experiment definitions from
GitHub.

## Before you begin

You need:

- a working experiment, such as the one from [Your first
  measurement](/docs/cli/first-measurement);
- the repository hosted on GitHub; and
- permission to connect that repository to a Wezel workspace.

## Add the repository

1. [Open the Wezel Dashboard](https://app.wezel.build) and sign in.
2. Choose the workspace that should own the project.
3. Select **Add project**.
4. Connect GitHub if the workspace does not have a GitHub connection yet.

The Dashboard discovers Wezel projects from the repository contents on GitHub.
Commit and push the project before selecting the repository:

```sh frame="terminal"
git add hello.c .wezel
git commit -m "Add the example Wezel experiment"
git push
```

Select the repository you pushed. Wezel scans it for `.wezel/config.toml`. If
the repository contains more than one Wezel project, select the one you want to
track.

## Track the project

Select **Track project**. The project page opens with the experiments found in
the repository, including `example-experiment`.

Connecting a project does not change how its experiments run. The committed
definitions remain the source of truth, and you can continue to lint and run
them with the Wezel CLI.

The connected project is now visible, but the Dashboard cannot run an
experiment until it has a runner. From the project page, open the command
palette with `⌘K` on macOS or `Ctrl+K` elsewhere, then select **Set up a
runner**. Continue with [runner setup](/docs/dashboard/runners).

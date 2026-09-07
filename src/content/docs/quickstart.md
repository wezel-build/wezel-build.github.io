---
title: Quickstart
description: Define a measurement locally, then track it as your repository changes in the Wezel app.
---

Start by measuring something your build produces. Once the measurement works
locally, use the app to track it as your code changes.

The **CLI** runs the steps you define and shows their results on your machine.
The **app** schedules measurements on configured runners, shows changes across
commits, and tracks regressions and improvements. A runner is the machine or CI
workflow that executes those measurements.

## Install and initialize

You'll need a Git repository with at least one commit, and the tools needed to
build it. Install Wezel on macOS or Linux:

```sh frame="terminal"
curl -fsSL https://wezel.build/install.sh | sh
wezel --version
```

If `wezel` isn't found, follow the installer's instructions to add
`~/.wezel/bin` to your `PATH`. See [Installation](/docs/installation) for details.

From your repository's root directory, run:

```sh frame="terminal"
wezel project init
```

Choose a project name when prompted. This creates `.wezel/config.toml` with a
project identifier and your machine's platform, plus a `.wezel/.gitignore` for
local run data.

## Define a measurement

This example runs a build and measures the size of one output file. It assumes
`make` builds your project and writes `dist/app`. Replace that command and path
with the ones your project uses.

Add these tables to the generated `.wezel/config.toml`, keeping its existing
project fields and `[tools]` table:

```toml title=".wezel/config.toml"
[tools.foragers.exec]
github = "wezel-build/forager_exec"

[tools.foragers.filesize]
github = "wezel-build/forager_filesize"
```

These are the two measurement tools, called *foragers*, used below: `exec` runs
a shell command, and `filesize` reports file sizes in bytes.

Create the scenario directory:

```sh frame="terminal"
mkdir -p .wezel/experiments/artifact-size
```

Put the following definition in `.wezel/experiments/artifact-size/experiment.toml`:

```toml title=".wezel/experiments/artifact-size/experiment.toml"
[step.exec.build]
cmd = "make"

[step.filesize.artifact]
glob = "dist/app"
summary.bytes.outcome = "dist/app"
```

Steps run in file order: build first, then measure. The `summary` selects the
number to track. Keep `glob` and `summary.bytes.outcome` set to the same file
path for this example.

The CLI calls a scenario an **experiment**. Its directory name, `artifact-size`,
is the name you'll use in commands.

## Check it locally

Install the declared tools, validate the definition, and run it:

```sh frame="terminal"
wezel project tool sync
wezel experiment lint
wezel experiment run artifact-size
```

The build runs in a separate checkout, so ignored build outputs from your
working directory aren't reused. Include dependency installation in your build
step if the build needs it.

The result should include a `bytes` summary for `dist/app`. Its value is the
file's size in bytes. If no value appears, check that the build produced the
file at the path in the definition.

Runs are saved under `.wezel/runs/artifact-size/`. Run the same command again
to compare with the last saved measurement. These local runs aren't
automatically uploaded to the app.

## Add the project to the app

Commit and push the `.wezel` configuration, the experiment definition, and the
generated `.wezel/wezel.lock` to your repository's default branch. The lockfile
pins the measurement tools so other machines use the same versions. Keep the
generated `.gitignore`; local run results don't belong in the commit.

Then [open the Wezel app](https://app.wezel.build):

1. Sign in and select your organisation if prompted.
2. Connect your Git host and grant access to the repository you want to track.
3. Choose **Add project**, select the repository, then add the project discovered
   from `.wezel/config.toml`.

The app reads the committed scenario definitions. If your project isn't listed,
check that `.wezel/config.toml` has been pushed to the default branch and that
the connected Git account or installation can access the repository.

## Enable ongoing measurements

Your project needs a configured runner before the app can execute measurements.
In your organisation's **Settings**, open **Runners** to see what's available.
In the project's **Settings**, the **Runners** section shows the assignment for
each scenario. Scenarios can inherit the organisation's default runner.

The runner needs your build tools and access to any dependencies the build
downloads. If it uses a different platform from your development machine, add
that platform to `[tools].targets` in `.wezel/config.toml`, rerun
`wezel project tool sync`, and commit and push the updated config and lockfile.

If this is your first project and no runner is configured,
[get in touch about runner setup](mailto:hi@wezel.build).

Once a runner is assigned and available, open a commit in the app and request a
measurement of `artifact-size`. Check that the run completes and its file-size
result appears. The app can then track the committed scenario as the repository
changes and investigate changes in its measurements.

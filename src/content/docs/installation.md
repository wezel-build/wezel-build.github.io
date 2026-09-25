---
title: Install Wezel
description: Install the Wezel CLI on macOS or Linux.
---

The Wezel CLI supports macOS and Linux on ARM64 and x86-64 systems. The installer
requires `curl`.

## Install the Wezel CLI

Run:

```sh frame="terminal"
curl -fsSL https://wezel.build/install.sh | sh
```

The installer places the `wezel` binary in `~/.wezel/bin` and updates your shell
configuration if that directory is not already on your `PATH`.

## Verify the installation

Open a new terminal, then run:

```sh frame="terminal"
wezel --version
```

This prints the installed CLI version and build identifier:

```text title="Output"
wezel 0.1.5-pre (726baac)
```

If your shell cannot find `wezel`, load the environment file created by the
installer:

```sh frame="terminal"
source "$HOME/.wezel/bin/env"
```

Then run `wezel --version` again.

Next, [create your first measurement](/docs/cli/first-measurement).

---
title: Installation
description: Install the Wezel CLI on macOS or Linux.
---

Wezel provides CLI binaries for macOS and Linux on Intel/AMD 64-bit and ARM64
machines. You don't need Rust installed to use a prebuilt binary.

## Install the CLI

```sh frame="terminal"
curl -fsSL https://wezel.build/install.sh | sh
```

The script downloads the installer from the newest GitHub release, including
prereleases. It installs the `wezel` binary in `~/.wezel/bin`.

Follow the installer's instructions to make that directory available on your
`PATH`, then verify the installation:

```sh frame="terminal"
wezel --version
```

This prints the CLI version and build identifier. If the command isn't found,
open a new terminal after following the installer's shell setup instructions.

Release downloads and their installers are also available on the
[GitHub releases page](https://github.com/wezel-build/wezel/releases).

## Measurement tools

Measurement tools are installed separately for each project's declared
configuration. After initializing a project and declaring its tools, run:

```sh frame="terminal"
wezel project tool sync
```

This downloads the declared tools and records their versions and hashes in
`.wezel/wezel.lock`. It doesn't install your project's compiler or build system;
those need to be available on the machine running the measurements.

Continue with the [quickstart](/docs/quickstart) to define a measurement and
connect the project to the app.

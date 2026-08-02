---
title: Installation
description: Getting the Wezel CLI onto a development machine or CI runner.
---

<!-- COPY SLOT: standfirst — what the install produces (single binary, etc.). -->

The install script fetches a single binary and places it on `PATH`.

```sh frame="terminal"
curl -fsSL https://wezel.build/install.sh | sh
```

## From source

```sh frame="terminal"
cargo install wezel
```

## Verifying the install

```sh frame="terminal"
wezel --version
```

<!-- COPY SLOT: what a correct install looks like; supported platforms. -->

:::caution
<!-- COPY SLOT: any platform caveat worth stating up front. Declarative, peer-toned. -->
:::

---
title: Introducing Wezel
description: Give your builds love they long for.
date: 2026-05-09
draft: false
author: osiewicz
---

In the age where code can be generated on a whim, we're still stuck waiting on compilers, linters, formatters, bundlers. 
Tale as old as time. So we tear our project apart, chasing that next high of a better build. Witness [(re)writes](https://devblogs.microsoft.com/typescript/typescript-native-port/) of tooling driven by a need for speed.
Yet the excitement [eventually](https://en.wikipedia.org/wiki/Jevons_paradox) fades away. Your fingertips thump against the face of a desk after a brief time apart.
![XKCD 301: Compiling](https://imgs.xkcd.com/comics/compiling.png)

Optimizing builds is fun at first, because gains can be tremendous and you feel it in your bones. Less so when you've done it a few dozen times. [Building](https://fasterthanli.me/articles/why-is-my-rust-build-so-slow) [that](https://aras-p.info/blog/2019/01/12/Investigating-compile-times-and-Clang-ftime-report/) [muscle](https://blog.rust-lang.org/inside-rust/2020/02/25/intro-rustc-self-profile/) [is](https://vitaut.net/posts/2024/faster-cpp-compile-times/) [**not**](https://matklad.github.io/2021/09/04/fast-rust-builds.html) [trivial](https://vitaut.net/posts/2017/improving-compile-times/), [and](https://aras-p.info/blog/2017/10/23/Best-unknown-MSVC-flag-d2cgsummary/) [it](https://aras-p.info/blog/2019/01/21/Another-cool-MSVC-flag-d1reportTime/) consists mostly of following [obscure](https://github.com/rust-lang/rust/issues/88438#issuecomment-908219618) rules found in the war stories posted by other people on the Internet. 
Worse still, most of that knowledge (if any at all) does not transfer across languages and tools. You're stuck figuring it out over and over again.

That frustration is the reason I've set out to build **Wezel**[^name] - a one-stop shop for build times. For starters, Wezel lets you track your build time (and other bits of DX) across commits, out-of-band from CI, on dev scenarios you care about. Build time regressions are important, but they should not block you from shipping. You can catch them while they're fresh without slowing anyone down.

## What Wezel actually does
Wezel's core primitive is an *experiment*; a list of steps that produce *outcomes* (such as build time, artifact size, size of LLVM IR, profiling data from the compiler). These outcomes are then **summarized** - turned into a metric value we can use to determine whether your build regressed or improved.
All of that is neatly encapsulated in an `experiment.toml` file, like so:

```toml
description = "Measures release-binary size of the wezel CLI"

# Steps are executed in order of definition in source.
[step.build-release]
# Tools run commands and post-process their results to provide outcomes.
# Exec is a generic tool that runs arbitrary commands without any outcomes.
tool = "exec"
cmd = "cargo build --release --workspace"

[step.measure-size]
# With artifact on disk, we can use a filesize tool to grab the file size of our release binary.
tool = "filesize"
glob = "target/release/wezel"
summaries = [
    { name = "Wezel binary size", measurement = "target/release/wezel", bisect = true }
]
```

Wezel is supposed to run periodically - not on each commit. The assumption is that build regressions happen relatively rarely; it should be okay to check up on your build's health once a day or so. 
When Wezel detects a regression in a summary marked `bisect = true`, it triggers a bisection: it runs the experiment on every commit in between the current and previous run, pinpointing which change introduced the regression. When a regression does happen, you don't need to do the spelunking yourself - the data is there, waiting for you to tackle.

## Extensible by design
Notice the tool field in every step above? Those tools - exec, filesize, all of them -
are not part of Wezel. They are separate binaries that Wezel invokes on your behalf.
[exec is one such binary](https://github.com/wezel-build/forager_exec). [So is filesize](https://github.com/wezel-build/forager_filesize/). Each one does what it says on the tin and hands the result back.

This is deliberate. I'm mostly interested in Rust build times myself - but Wezel
shouldn't be. There is no central registry, no plugin marketplace, no forge to gatekeep
what counts as a measurement. If you care about something I don't, ship a tool for it.
You don't need anyone's permission, mine included.

## Looking up, down the line
Bisecting regressions on your behalf is substantial, but Wezel could do so much more - it could devise the reason for build time regression. After all, that's what we do by hand anyways; we bisect regressions, inspect the diff, LLVM IR, changes to the crate graph and stitch the facts together to form a coherent conclusion... Why couldn't this be automated with a logic engine?

There is so much we could do to improve our build times. Let's start by stepping up on the quality of conversations we have around them. 

## Give Wezel a try

[^name]: "Węzeł" stands for both a knot and a node (in a graph) in Polish, my native language.
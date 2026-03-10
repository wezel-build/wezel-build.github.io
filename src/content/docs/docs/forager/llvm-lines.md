---
title: "llvm-lines"
description: Forager plugin that counts LLVM IR lines via cargo-llvm-lines.
---

Counts LLVM IR lines using [`cargo-llvm-lines`](https://github.com/dtolnay/cargo-llvm-lines).
Reports the total line count as a `count` measurement, with a per-function breakdown as detail.

Requires `cargo-llvm-lines` to be installed:

```sh
cargo install cargo-llvm-lines
```

## Inputs

None. The forager runs `cargo llvm-lines` in the project root.

## Example

```toml
[[steps]]
name = "measure-llvm"
forager = "llvm-lines"
```

## Output

```json
{
  "measurement": {
    "name": "llvm-lines",
    "kind": "count",
    "value": 125000,
    "unit": "lines",
    "detail": [
      { "name": "std::rt::lang_start_internal", "value": 405 },
      { "name": "core::fmt::write", "value": 392 }
    ]
  }
}
```

Anthill renders `count` measurements as a bar chart across commits.
The detail list shows the top functions by line count (up to 50 entries).

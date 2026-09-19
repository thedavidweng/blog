---
title: "Taming Multi-Gigabyte Rust Targets: Global Build Caching with Mr Boxington (mbx) and Mise"
description: "Reclaim dozens of gigabytes of disk space from Rust targets. How to use Mr Boxington (mbx) and Mise with macOS APFS reflink zero-copy cloning to manage Cargo caches effortlessly."
publishedDate: 2026-09-18
tags:
  - Tools
  - Workflow
  - CLI
draft: false
locale: en
related:
  - dotfiles-toolchains-mise
  - dotfiles-advanced-chezmoi
---

Developing multiple Rust projects or large applications on macOS quickly consumes tens of gigabytes of disk space across individual `target/` directories. With parallel testing or Git worktrees, every separate checkout compiles dependencies from scratch.

Traditional tools like `sccache` do not solve physical directory bloat. This article covers why I replaced `sccache`, and how to use **Mr Boxington (mbx, Rust build cache)** with Mise and macOS APFS reflinks to establish a globally shared compilation cache.

## Limitations of Sccache

I previously configured `sccache` in `~/.cargo/config.toml`:

```toml
[build]
rustc-wrapper = "/opt/homebrew/bin/sccache"
incremental = false
```

In practice, `sccache` has two limitations:

### 1. Conflict Between Incremental Compilation and Cache Hits

`sccache` cannot cache Rust's incremental compilation state. To hit the cache, configuration must explicitly disable incremental compilation (`incremental = false`).

Disabling it means single-line edits cannot use rustc's incremental optimizations, noticeably increasing rebuild times.

### 2. Uncontrolled Growth of Target Directories

`sccache` is a key-value store. Individual `target/` directories still retain all generated object files and debug symbols.

It does not reclaim abandoned worktree artifacts or enforce a total disk budget. When disk space runs low, manual directory cleanup with `cargo clean` is still required.

## Mr Boxington (mbx) Mechanics

[Mr Boxington](https://github.com/jdx/mr-boxington) (CLI binary `mbx`) is a Rust build cache and target directory manager created by Mise author [jdx](https://github.com/jdx).

Its mechanics:

### 1. No Background Daemon

`mbx` runs without a persistent background service. For each Cargo command, it starts a lightweight local cache agent within the process lifecycle and exits when the build completes. There are no background leaks or stalled sockets.

### 2. macOS APFS Reflink Zero-Copy

On APFS, `mbx` restores cache artifacts into project `target/` directories using copy-on-write reflinks instead of physical copies.

Restoring compiled artifacts takes milliseconds. Different projects and Git worktrees share the same underlying storage blocks without consuming duplicate disk space.

### 3. Managed Targets and Automated Garbage Collection

`mbx` introduces a disk budget (default 20.0 GiB).

During builds, `mbx` tracks active workspaces. For stale worktrees or abandoned project targets, `mbx gc` removes old entries using an LRU policy, keeping total Rust cache usage within the configured budget.

## Configuring Mise and mbx

Mise supports the `mr_boxington` option natively from version 2026.9 onward. A single command configures it globally:

```bash
mise use --global --tool-option mr_boxington=true rust mr-boxington
```

This command makes three changes:
1.  Installs the Rust toolchain and the `mr-boxington` (`mbx`) binary.
2.  Configures the Cargo wrapper in `~/.config/mise/config.toml`:

```toml
wrappers = { cargo = { command = "mbx", env = { MBX_CARGO_SHIM_MODE = "1" } } }

[tools]
mr-boxington = "latest"
rust = { version = "latest", mr_boxington = true }
```

3.  Runs `mbx setup --global`, configuring intercepting wrappers for `cargo` and `rust-analyzer`.

Running `cargo build` or IDE rust-analyzer checks automatically routes compilation through the `mbx` central cache.

## Chezmoi Configuration and Migration Details

When tracking this setup in Chezmoi, two details require attention:

### 1. Removing Old Sccache Wrappers

Both `sccache` and `mbx` work by intercepting rustc. They cannot run together in the same build. If `RUSTC_WRAPPER` or `build.rustc-wrapper` remains active, `mbx` yields and disables caching.

Track `dot_cargo/config.toml` in Chezmoi and remove the old `rustc-wrapper`:

```toml
# ~/.local/share/chezmoi/dot_cargo/config.toml
# Global Cargo configuration.
# Managed by chezmoi

[build]
# mr-boxington (mbx) manages shared cache through mise shims
# sccache removed to avoid RUSTC_WRAPPER conflict

[profile.dev]
debug = false
```

### 2. Ensuring Shim Precedence in ~/.zshenv

Non-interactive subshells spawned by Coding Agents only evaluate `~/.zshenv`. In `dot_zshenv.tmpl`, prepend Mise shims and the mbx path:

```zsh
export PATH="$HOME/.local/share/mise/shims:$HOME/Library/Application Support/mbx/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
```

## Verification

Run the built-in diagnostic command:

```bash
mbx doctor
```

The output should show clean green checks:

```
  ok  cargo        cargo 1.98.1
  ok  rustc        rustc 1.98.1
  ok  cache        /Users/david/Library/Caches/mbx is writable
  ok  config       20.0 GiB budget, automatic gc enabled, managed targets enabled
  ok  reflink      cloning is supported (macOS APFS reflink)
  ok  setup        mise Cargo wrapper is active
0 failures, 0 warnings
```

Daily commands:
*   `mbx stats`: Inspect global cache usage, accumulated time saved, and deduplicated bytes across workspaces.
*   `mbx tui`: Open a live terminal dashboard showing crate progress and cache hit status.
*   `mbx gc`: Manually trigger cache cleanup against configured budgets.

## References

> [Mr Boxington GitHub Repository](https://github.com/jdx/mr-boxington)
> 
> [Mr Boxington Official Documentation](https://mr-boxington.jdx.dev/)
> 
> [Mise Official Documentation](https://mise.jdx.dev/)
> 
> [Dotfiles Part 3: Unifying Polyglot Toolchains and AI Agent Environments with Mise](/posts/dotfiles-toolchains-mise/)

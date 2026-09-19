---
title: "Dotfiles Part 3: Unifying Polyglot Toolchains and AI Agent Environments with Mise"
description: "Say goodbye to the fragmented shims of nvm, pyenv, and rustup. Build a deterministic polyglot environment with Mise and Chezmoi, solving PATH drift for AI coding agents."
publishedDate: 2026-09-18
tags:
  - Tools
  - Workflow
  - CLI
draft: false
locale: en
related:
  - dotfiles-setup-with-dotbot
  - dotfiles-advanced-chezmoi
---

The previous two articles covered [Dotbot's symlink approach](/posts/dotfiles-setup-with-dotbot/) and [Chezmoi's template and secret management](/posts/dotfiles-advanced-chezmoi/). That setup handles configuration versioning and distribution, but leaves runtime version management unresolved.

With Coding Agents working in day-to-day development, traditional version managers expose a critical failure mode: non-interactive shells drop environment variables. This article covers using Mise to manage polyglot environments and ensure terminal sessions and background agents run identical toolchains.

## Problems with Polyglot Version Management

### 1. Shim Collisions and Startup Latency Across Tools

Setting up a polyglot development machine usually means installing multiple independent version managers:

*   Node.js: `nvm` or `fnm`
*   Python: `pyenv`
*   Go: `gvm` or `goenv`
*   Rust: `rustup`
*   Plus various CLI tools from Homebrew

To hook into commands, each tool appends initialization routines to `~/.zshrc`:

```zsh
eval "$(fnm env --use-on-cd)"
eval "$(pyenv init --path)"
eval "$(pyenv init -)"
. "$HOME/.cargo/env"
export PATH="/usr/local/go/bin:$PATH"
```

This causes two problems:
1.  **Shell startup latency**: Every new terminal tab runs multiple `eval` statements sequentially, adding hundreds of milliseconds of delay.
2.  **PATH priority chaos**: Shims prepend themselves to `$PATH`, causing system binaries to shadow version-managed tools or global packages to shadow local binaries.

### 2. Non-Interactive Shell PATH Drift

Commands like `cargo build` or `pnpm test` succeed in an interactive terminal, but background Coding Agents often fail with `command not found` or invoke outdated system versions.

The root cause is macOS Zsh startup file loading order:

```
Interactive login shell (new terminal tab):
/etc/zshenv → ~/.zshenv → /etc/zprofile → ~/.zprofile → /etc/zshrc → ~/.zshrc → /etc/zlogin → ~/.zlogin

Non-interactive subshell (scripts, cron, agents running zsh -c):
/etc/zshenv → ~/.zshenv
```

Most developers put all version manager initialization in `~/.zshrc`. When an agent spawns a non-interactive shell to run a build, the system never loads `~/.zshrc`.

If the system falls back to macOS's built-in Python 3.9, or fails to find Node 24 and Cargo configured in `~/.zshrc`, the build fails.

## Mise Architecture

[Mise](https://mise.jdx.dev/) (formerly rtx) is a polyglot runtime manager and task runner written in Rust.

*   **Single binary**: No shell wrapper layers, minimal execution overhead.
*   **Unified management**: Supports Node, pnpm, Go, Rust, Python, Java, Ruby, and standalone GitHub Release binaries.
*   **Standardized configuration**: Supports global `~/.config/mise/config.toml` and project `mise.toml`, compatible with `.tool-versions`.
*   **Dual modes**: Supports dynamic activation in interactive shells and static shim links in `~/.local/share/mise/shims` for PATH integration.

## Managing Global Mise Configuration with Chezmoi

Manage the global development environment declaratively. Track `dot_config/mise/config.toml` in Chezmoi:

```toml
# ~/.local/share/chezmoi/dot_config/mise/config.toml

[tools]
actionlint = "latest"
go = "latest"
node = "24"
pnpm = "12"
rust = "latest"
zizmor = "1.26.1"

[settings]
legacy_version_file = true
```

Running `chezmoi apply` distributes the configuration to `~/.config/mise/config.toml`. Running `mise install` then installs any missing runtimes.

## Adding Mise Shims to ~/.zshenv

To prevent PATH drift in background subprocesses and agents, put Mise's shims in `~/.zshenv`, which runs for every shell invocation.

In the Chezmoi template `dot_zshenv.tmpl`:

```zsh
# ~/.local/share/chezmoi/dot_zshenv.tmpl

# .zshenv: environment variables only, loaded for every zsh invocation
# Keep this file minimal, put heavy initialization in .zprofile or .zshrc

# 1. mise shims at the front of PATH:
#    Ensures Coding Agents, IDE tasks, and background subshells use declared tool versions
# 2. Homebrew follows immediately:
#    Ensures modern CLI tools override Apple system defaults
export PATH="$HOME/.local/share/mise/shims:/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
```

### Design Details

1.  **Consistency across execution modes**: Terminal commands and background Coding Agent commands resolve to the exact same `node`, `cargo`, and `pnpm` paths.
2.  **No activation overhead**: `.zshenv` avoids `eval "$(mise activate zsh)"`. Static shims in `~/.local/share/mise/shims` dispatch directly based on the current directory config.
3.  **Interactive features preserved**: Interactive shells retain `eval "$(/opt/homebrew/bin/mise activate zsh)"` at the end of `~/.zshrc` and `~/.zprofile` for completions and shell hooks.

## Verification

After applying the configuration, verify in both interactive and non-interactive shells:

```bash
# Verify interactive terminal resolution
which node cargo pnpm
# Output: all point to ~/.local/share/mise/shims/...

# Verify background non-interactive invocation
zsh -c "which node; which cargo"
# Output: resolves to ~/.local/share/mise/shims/node and cargo
```

Run `mise reshim` to refresh shim symlinks when needed.

When a project root contains `mise.toml`, entering the directory selects the project version. Without project configuration, the global defaults apply. Background processes resolve the intended runtime directly.

Next post: [Taming Multi-Gigabyte Rust Targets: Global Build Caching with Mr Boxington (mbx) and Mise](/posts/rust-cache-mr-boxington/).

## References

> [Mise Official Documentation](https://mise.jdx.dev/)
> 
> [Mise Shims and PATH Architecture](https://mise.jdx.dev/dev-tools/shims.html)
> 
> [Dotfiles Part 2: Advanced Chezmoi Configuration and Secrets](/posts/dotfiles-advanced-chezmoi/)

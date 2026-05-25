---
title: "From 15 Files to One Command: How I Set Up a New Mac in 10 Minutes"
slug: dotfiles-setup-with-dotbot
description: "After years of manually copying config files between machines, I finally built a setup where one command installs everything I need."
publishedDate: 2026-05-08
tags:
  - Tools
  - Workflow
  - CLI
draft: false
locale: en
---

Every time I get a new Mac, the same nightmare starts: open 15 browser tabs, find each tool's download page, install, then manually recreate all my settings. Keyboard shortcuts, editor themes, shell aliases, Git config, GPG keys. Half a day gone.

So I spent a weekend fixing this permanently. Now one terminal command gives me a fully configured machine in under 10 minutes. Here's how.

## What Gets Installed

The setup handles three things: **apps**, **configuration files**, and **preferences**.

### Apps (58 formulae + 28 desktop apps + 17 App Store apps)

**Essentials** — the tools I use every day:
- **Browser**: Zen (replaced Chrome — lighter, no Google tracking)
- **Terminal & editors**: Warp, Zed, Cursor, Obsidian
- **Communication**: WeChat (via App Store)
- **Productivity**: Amphetamine, Dropover, Spark, Raycast, Stats
- **Development**: Docker, Go, Node, Python, Git, GitHub CLI
- **Media**: iINA, HandBrake, yt-dlp
- **Utilities**: Keka, ImageOptim, Haze, Calendr, OpenLoop

Plus 17 apps from the Mac App Store (Xcode, TestFlight, Infuse, Bitwarden, Tailscale, and others).

### Configuration Files (12 tools)

The dotfiles repo stores my personal settings for tools I use across machines:
- **Shell** (zsh + login shell)
- **Git** (GPG signing, LFS, user info)
- **GitHub CLI**, **Zed editor**, **Obsidian**, **Himalaya email client**, **Gollama**, **OpenCode**

### Machine-Specific Settings (not synced)

Some things are intentionally excluded — they're different on every machine:
- SSH keys and API tokens
- Email credentials
- Per-machine path overrides

These live in `.local` files on each machine. They're created once, never committed.

## How It Works

The setup uses [Dotbot](https://github.com/anishathalye/dotbot) — a tool that creates symlinks between my config files in the repo and the locations apps expect them. Combined with [dotbot-brew](https://github.com/d12frosted/dotbot-brew) for app installation.

The repo lives on GitHub (private): [thedavidweng/dotfiles](https://github.com/thedavidweng/dotfiles).

## Setting Up a New Machine

Three commands:

```bash
git clone git@github.com:thedavidweng/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
./install
```

That's it. Brew installs 58 packages, 28 desktop apps, and 17 App Store apps. Then create a few local override files (documented in the repo), and everything works exactly like the old machine.

## What I Gained

- **New Mac setup**: 10 minutes instead of half a day
- **Version history**: Every config change is tracked in Git
- **No vendor lock-in**: Plain text files, standard tools
- **Reproducible**: Works on any Mac, any number of times

The initial setup took a weekend of trial and error. But it paid for itself on the very first machine swap.

## My Setup References

> [respawn.io — dotfiles, Brewfile, and Mackup](https://respawn.io/posts/dotfiles-brew-bundle-and-mackup)

> [anishathalye.com — managing your dotfiles](https://anishathalye.com/managing-your-dotfiles/)

> [anishathalye/dotbot](https://github.com/anishathalye/dotbot)

> [d12frosted/dotbot-brew](https://github.com/d12frosted/dotbot-brew)
---
title: "A Lightweight, Elegant Backup: Dotfiles"

description: "After years of manually copying config files between machines, I finally built a setup where one command installs everything I need."
publishedDate: 2026-05-08
tags:
  - Tools
  - Workflow
  - CLI
draft: false
locale: en
---

Every time I get a new Mac, the same dilemma starts. If you restore from the old machine, you carry over years of cruft. If you set up from scratch, you lose half a day installing and configuring everything manually.

Managing a dotfiles repo solves this completely. One terminal command, and a brand new machine is restored to your ideal state.

## Core Concepts

Dotfiles don't mean dumping your entire $HOME into Git. The right approach is to keep config files in a dedicated repo, then use symlinks to place them where the system expects them.

This gives you two benefits. First, apps still read from standard paths like ~/.zshrc and ~/.gitconfig — they have no idea a repo exists. Second, the repo lives cleanly in ~/.dotfiles without cluttering your home directory. And since you're only backing up plain text configs (not caches), the repo stays tiny and is perfect for Git version control.

If you use a package manager, the repo can also record every installed package for one-command reinstallation.

My dotfiles repo uses four tools:

- **Dotbot**: A lightweight setup launcher. Uses YAML to describe which files to link where, then creates the symlinks.
- **Homebrew Bundle**: Homebrew's Brewfile records every CLI tool, desktop app, and Mac App Store app as plain text.
- **MAS**: Complements Homebrew by managing Mac App Store apps.
- **dotbot-brew**: A Dotbot plugin that runs `brew bundle` before creating symlinks.

## Building from Scratch

These examples are on macOS, but the workflow is similar on other systems.

### 1. Create the Repo and Add Dotbot

```bash
mkdir ~/.dotfiles
cd ~/.dotfiles
git init
git submodule add https://github.com/anishathalye/dotbot
cp dotbot/tools/git-submodule/install .
touch install.conf.yaml
```

The install script reads `install.conf.yaml` and executes the config. Dotbot is added as a Git submodule with no external dependencies.

### 2. Write install.conf.yaml

Here's my config skeleton (personal paths removed):

```yaml
- defaults:
    link:
      create: true
      relink: true
      force: true

- clean: ["~"]

- link:
    ~/.zshrc: zshrc
    ~/.gitconfig: gitconfig
    ~/.config/zed: config/zed
    ~/.config/opencode: config/opencode
    ~/.config/himalaya: config/himalaya
    ~/.gnupg/gpg-agent.conf: gpg-agent.conf
    ~/Library/LaunchAgents/link-ssh-auth-sock.plist:
      path: Library/LaunchAgents/link-ssh-auth-sock.plist

- brew:
    - Brewfile
```

`clean` removes stale symlinks pointing outside the repo. Each item under `link` maps a target path to a relative path in the repo. The `brew` section is handled by dotbot-brew.

### 3. Generate a Brewfile

```bash
brew bundle dump --file ~/.dotfiles/Brewfile --force
```

This exports every manually installed formula, cask, and MAS app as text. Brewfile is idempotent — on a new machine, already-installed packages are skipped, only missing ones are added.

A typical Brewfile looks like this:

```ruby
# CLI
tap "homebrew/bundle"

brew "git"
brew "gh"
brew "node"
brew "go"
brew "mas"
brew "yt-dlp"

# Desktop apps
cask "zed"
cask "warp"
cask "docker"
cask "iina"
cask "keka"

# Mac App Store
mas "Xcode", id: 497799835
mas "Bitwarden", id: 1352778147
mas "Tailscale", id: 1475387142
```

Note: MAS requires you to be signed into the Apple ID on the new machine, or the App Store entries will error (without interrupting Homebrew installations).

### 4. Handling Machine-Specific Config

Not everything belongs in a shared repo. SSH keys, API tokens, email credentials, per-machine download paths — these should stay local.

My approach is to add an include directive in the main config file that points to a `.local` file not tracked by Git.

#### 4.1 What is a .local File

A `.local` file is a config isolation pattern: the repo stores **shared config**, while machine-specific content lives in a separate `.local` file that is **not tracked by Git**.

Core principle:

- **Repo = shared config**: Everything common across machines (shortcuts, plugins, themes, workflows) goes in Git.
- **.local = local overrides**: Per-machine secrets, paths, proxies, credentials stay in untracked `.local` files.

This means you can safely sync the repo to any machine — all shared config applies automatically, while each machine keeps its own personality.

#### 4.2 Common .local Patterns by Tool

Different software has different include mechanisms. Here are the most common ones:

**zshrc**

Add at the end of `~/.zshrc`:

```bash
if [ -f ~/.zshrc.local ]; then
    source ~/.zshrc.local
fi
```

Use `.zshrc.local` for machine-specific aliases, proxy settings, environment variables, and dev paths.

**gitconfig**

Git supports `includeIf` for conditional config loading:

```ini
[user]
    editor = code --wait
    commitTemplate = ~/.gitmessage

[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig_work

[include]
    path = ~/.gitconfig_local
```

Use `.gitconfig_local` for personal email, GPG signing keys, work usernames, and private repo credential helpers.

**vim / neovim**

```vim
" ~/.config/nvim/init.vim
if filereadable(expand('~/.config/nvim/init.local.vim'))
    source ~/.config/nvim/init.local.vim
endif
```

Or with Lua:

```lua
-- ~/.config/nvim/lua/config/local.lua
local ok, local_config = pcall(require, "config.local")
if ok then
    -- apply local overrides
end
```

**tmux**

```bash
# ~/.tmux.conf
if-shell "test -f ~/.tmux.conf.local" "source-file ~/.tmux.conf.local"
```

**VS Code**

VS Code's `settings.json` doesn't support includes, but you can work around it:

```json
{
    "editor.fontSize": 14,
    "editor.tabSize": 2
}
```

Commit only the shared settings. Per-machine overrides are edited through the GUI and left uncommitted. For a cleaner approach, use the [Settings Sync](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync) extension to sync shared config to a Gist.

**Other tools**

For apps that don't support includes, use a local override file with a symlink:

```
~/.config/myapp/config    →  ~/dotfiles/config/myapp/config
~/.config/myapp/config.local     (not tracked)
```

Then in the app's startup script, check for `config.local` and prefer it when present.

#### 4.3 Recommended Directory Structure

Keep all `.local` files under `$HOME`, mirroring the repo structure:

```
$HOME/
├── .zshrc              ← repo (shared)
├── .zshrc.local        ← untracked (local)
├── .gitconfig          ← repo (shared)
├── .gitconfig_local    ← untracked (local)
├── .tmux.conf          ← repo (shared)
├── .tmux.conf.local    ← untracked (local)
└── .config/
    └── myapp/
        ├── config       ← repo (shared)
        └── config.local ← untracked (local)
```

Add this to your repo's `.gitignore`:

```
*.local
```

Now `git status` will never show dirty untracked `.local` files.

#### 4.4 New Machine Workflow

1. Clone and install:

```bash
git clone git@github.com:yourname/dotfiles.git ~/.dotfiles
cd ~/.dotfiles && ./install
```

2. Create local override files:

```bash
touch ~/.zshrc.local
touch ~/.gitconfig_local
touch ~/.tmux.conf.local
```

3. Fill in machine-specific config.

Day to day, you edit shared config in the repo and local overrides in the `.local` files — they never interfere.

#### 4.5 Advanced: Environment-Based Loading

If you have multiple machine roles (work, home, server), use more granular logic:

```bash
# ~/.zshrc
HOSTNAME=$(hostname)

if [ -f ~/.zshrc.local ]; then
    source ~/.zshrc.local
fi

case "$HOSTNAME" in
    work-mbp)
        source ~/dotfiles/machines/work.zsh
        ;;
    home-desktop)
        source ~/dotfiles/machines/home.zsh
        ;;
esac
```

Or with Git's `includeIf` (2.13+):

```ini
[includeIf "gitdir/i:~/work/"]
    path = ~/.gitconfig_work
```

This lets a single dotfiles repo auto-switch config based on the current directory — great for juggling work and personal projects.

## Common Pitfalls

**Don't fork someone else's dotfiles**

Dotfiles are a personal config backup. Someone else's shortcuts, shell themes, and Git aliases are noise to you. Reference official docs and community solutions, but understand each line before adding it to your own repo.

**Don't commit secrets to Git**

Even if the repo is private, never store plaintext secrets. GPG keys, SSH keys, and API tokens belong in `.local` files or a password manager.

**Watch out for cloud-synced apps**

Some apps (like VS Code) have their own cloud sync. If you also manage their config with dotfiles symlinks, the two will fight for control and your repo will show constant drift. Let those apps handle their own sync, and exclude their paths from dotfiles.

## Setting Up a New Machine

```bash
git clone git@github.com:thedavidweng/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
./install
```

The install script runs in order: initializes the Dotbot submodule, runs `brew bundle`, and creates all symlinks. When it finishes, every CLI tool, desktop app, and App Store app is installed.

Then create two local override files:

```bash
touch ~/.zshrc.local
touch ~/.gitconfig_local
```

Fill in the machine-specific details.

## What I Gained

- **New Mac setup**: 10 minutes instead of half a day
- **Version history**: Every config change is a Git commit — roll back to last month's zsh theme in one command
- **Environment consistency**: Same editor shortcuts, shell aliases, and Git behavior across machines — zero cognitive friction when switching
- **No vendor lock-in**: Plain text files and standard CLI tools, no paid sync service required

## References

> [respawn.io — dotfiles, Brewfile, and Mackup](https://respawn.io/posts/dotfiles-brew-bundle-and-mackup)
>
> [anishathalye.com — managing your dotfiles](https://anishathalye.com/managing-your-dotfiles/)
>
> [anishathalye/dotbot](https://github.com/anishathalye/dotbot)
>
> [d12frosted/dotbot-brew](https://github.com/d12frosted/dotbot-brew)

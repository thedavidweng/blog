---
title: "The Cleanest Way to Back Up Your Mac Setup: dotfiles"
slug: dotfiles-setup-with-dotbot
description: "Stop manually reconfiguring every new Mac. One dotfiles command restores all your settings."
publishedDate: 2026-05-08
tags:
  - Tools
  - Workflow
  - CLI
draft: false
locale: en
---

Getting a new machine or reinstalling your OS — importing from an old one brings over all the tech debt and junk. Starting from scratch means manually downloading every app and tweaking every setting, and a full day is gone.

A dotfiles repo solves this completely. One terminal command restores a fresh machine to your ideal state.

## Core Concepts

Dotfiles doesn't mean throwing your entire $HOME into Git. You keep config files in a separate repo and use symlinks to mount them where the system expects them.

Two direct benefits. First, apps still read their standard paths (~/.zshrc, ~/.gitconfig, etc.) without knowing a repo exists. Second, the repo stays clean in ~/dotfiles or ~/.dotfiles, not mixed with other $HOME files. It's a precise config backup with no cached cruft.

If you use a package manager, the dotfiles repo can also record every installed package for one-command reinstallation. And because the backup is plain text, it takes almost no space and works perfectly with Git.

My dotfiles repo uses three tools:

- **Dotbot**: A lightweight bootstrapper that reads a YAML description of "which files link where" and creates symlinks automatically.
- **Homebrew Bundle**: Records all manually installed CLI tools and desktop apps as text in a Brewfile.
- **MAS**: Complements Homebrew by managing Mac App Store apps.
- **dotbot-brew**: A Dotbot plugin that runs `brew bundle` automatically before creating symlinks.

## Building from Scratch

The following example is on macOS. Specifics vary by system, but the overall flow is the same.

### 1. Create the Repo and Add Dotbot

```bash
mkdir ~/.dotfiles
cd ~/.dotfiles
git init
git submodule add https://github.com/anishathalye/dotbot
cp dotbot/tools/git-submodule/install .
touch install.conf.yaml
```

The `install` script comes from Dotbot's official template. It reads `install.conf.yaml` and executes the config. Dotbot itself is added as a Git submodule with no external package manager dependency.

### 2. Write install.conf.yaml

This is my config skeleton with some personal paths removed:

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

`clean` removes stale symlinks pointing outside the repo. Each entry under `link` maps a target path to a relative path in the repo. The `brew` section is handled by dotbot-brew.

### 3. Generate the Brewfile

```bash
brew bundle dump --file ~/.dotfiles/Brewfile --force
```

This exports all manually installed formulae, casks, and MAS (Mac App Store) apps as text. Brewfile is idempotent: when you run `brew bundle` on a new machine, already-installed packages are skipped and only missing ones are added.

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

Note: MAS requires the new machine to be signed into an Apple ID, otherwise the App Store section will error. It won't interrupt Homebrew package installation.

### 4. Handling Machine-Specific Config

Not all config should be shared. SSH keys, API tokens, email passwords, and per-machine download paths should stay local.

My approach: leave an include entry in the main config that points to a `.local` file not tracked in the repo.

#### 4.1 What Is a .local File

A `.local` file is a config isolation pattern: the dotfiles repo stores **shared config**, while machine-specific content lives in a separate `.local` file that is **not tracked by Git**.

Core principles:

- **Repo = shared config**: Everything shared across machines (shortcuts, plugins, themes, workflows) goes into Git.
- **.local = local overrides**: Per-machine content (secrets, paths, proxies, credentials) goes in `.local` files and is not committed.

You can safely sync the repo across machines. All shared config takes effect automatically, while each machine keeps its own settings.

#### 4.2 How Different Apps Load .local Files

Different software has different include mechanisms:

**zshrc**

Add this at the end of `~/.zshrc`:

```bash
# Load local config if present
if [ -f ~/.zshrc.local ]; then
    source ~/.zshrc.local
fi
```

`~/.zshrc.local` can hold: machine-specific aliases, corporate proxy settings, personal environment variables, local dev paths.

**gitconfig**

Git natively supports `includeIf` for conditional config loading:

```ini
[user]
    # Shared: commit template, default editor
    editor = code --wait
    commitTemplate = ~/.gitmessage

[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig_work

[include]
    path = ~/.gitconfig_local
```

`~/.gitconfig_local` holds: personal email/GPG signing key, company Git username, private repo credential helpers.

**vim / neovim**

```vim
" ~/.config/nvim/init.vim

" Try loading local config at the end
if filereadable(expand('~/.config/nvim/init.local.vim'))
    source ~/.config/nvim/init.local.vim
endif
```

Or with Lua config:

```lua
-- ~/.config/nvim/lua/config/local.lua
local ok, local_config = pcall(require, "config.local")
if ok then
    -- apply local overrides
end
```

**tmux**

```tmux
# ~/.tmux.conf

# Try loading local config
if-shell "test -f ~/.tmux.conf.local" "source-file ~/.tmux.conf.local"
```

**VS Code**

VS Code's `settings.json` doesn't support includes, but you can work around it:

```jsonc
// ~/.config/Code/User/settings.json
{
    // Shared settings (in repo)
    "editor.fontSize": 14,
    "editor.tabSize": 2,
    // Local settings are modified via GUI, written to the same file
    // Tip: only commit the shared part, leave local changes uncommitted
}
```

A better approach: use [Settings Sync](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync) to sync shared config to a Gist, then override locally on each machine.

**Other Apps**

For apps without native include support, use symlinks as a workaround:

```bash
# Shared config in repo
~/.config/myapp/config    →  ~/dotfiles/config/myapp/config

# Local override (not tracked)
~/.config/myapp/config.local
```

Then check in the app's startup script: if `config.local` exists, load it first.

#### 4.3 Recommended Directory Structure

Keep all `.local` files under `$HOME` to mirror the repo structure:

```
$HOME/
├── .zshrc              ← repo (shared)
├── .zshrc.local        ← not tracked (local)
├── .gitconfig          ← repo (shared)
├── .gitconfig_local    ← not tracked (local)
├── .tmux.conf          ← repo (shared)
├── .tmux.conf.local    ← not tracked (local)
└── .config/
    └── myapp/
        ├── config       ← repo (shared)
        └── config.local ← not tracked (local)
```

In the repo's `.gitignore`, ignore all `.local` files:

```gitignore
# .gitignore
*.local
```

This way, even if you accidentally create a `.local` file locally, `git status` won't show it.

#### 4.4 Setting Up a New Machine

1. Clone the repo and run the install script:

```bash
git clone git@github.com:yourname/dotfiles.git ~/.dotfiles
cd ~/.dotfiles && ./install
```

2. Create the `.local` files you need:

```bash
touch ~/.zshrc.local
touch ~/.gitconfig_local
touch ~/.tmux.conf.local
```

3. Fill in the machine-specific config.

4. In daily use, editing shared vs. local config is just editing different files. They don't interfere.

#### 4.5 Advanced: Dynamic Loading by Environment

If you have multiple machine roles (work, home, server), use finer-grained conditionals:

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

Or use `includeIf` with Git (2.13+):

```ini
[includeIf "gitdir/i:~/work/"]
    path = ~/.gitconfig_work
```

This pattern lets a single dotfiles repo switch config based on the current directory, ideal for people with both work and personal projects.

## Common Pitfalls

**Don't fork someone else's dotfiles**

Dotfiles are personal preferences. Someone else's shortcuts, shell themes, and Git aliases are noise for you. Read the official docs and community solutions, but understand every line before adding it to your own repo.

**Never put secrets in Git**

Even with a private repo, don't store plaintext secrets in dotfiles. GPG private keys, SSH keys, and API tokens all go in .local files or a password manager.

**Watch out for cloud-sync apps**

Some apps (like VS Code) have built-in cloud sync. If you also manage their config files via symlinks in dotfiles, the two fight for control and the repo will show constant drift. Let these apps use their own sync, and exclude their paths from dotfiles.

**Brewfile shouldn't be a dumping ground**

`brew bundle dump` faithfully exports every manually installed package. If you tried a tool three years ago and forgot to uninstall it, it's in the Brewfile. Review periodically and remove unused entries, or your new machine will install a pile of junk.

## Setting Up a New Machine (in Practice)

Three commands:

```bash
git clone git@github.com:thedavidweng/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
./install
```

The install script runs in sequence: initialize the dotbot submodule, run brew bundle, create all symlinks. After it finishes, 58 CLI tools, 28 desktop apps, and 17 App Store apps are ready.

Then create two local override files:

```bash
touch ~/.zshrc.local
touch ~/.gitconfig_local
```

Fill in the machine-specific config as needed.

## Results

- **Migration time**: from half a day to 10 minutes
- **Version tracking**: every config change is a Git commit, rollback to any point
- **Environment consistency**: same editor shortcuts, shell aliases, and Git behavior across work and personal machines
- **No vendor lock-in**: plain text files and standard CLI tools, no paid sync service required

## References

> [respawn.io — dotfiles, Brewfile, and Mackup](https://respawn.io/posts/dotfiles-brew-bundle-and-mackup)
>
> [anishathalye.com — managing your dotfiles](https://anishathalye.com/managing-your-dotfiles/)
>
> [anishathalye/dotbot](https://github.com/anishathalye/dotbot)
>
> [d12frosted/dotbot-brew](https://github.com/d12frosted/dotbot-brew)

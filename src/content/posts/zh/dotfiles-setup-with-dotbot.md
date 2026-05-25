---
title: "轻量优雅的备份方式：dotfiles"
slug: dotfiles-setup-with-dotbot
description: "每次换新机器都要花半天重新配置软件和设置，现在一条命令搞定。"
publishedDate: 2026-05-08
tags:
  - Tools
  - Workflow
  - CLI
draft: false
locale: zh
---

买新机器或者重装电脑，如果选择从老机器导入数据，那会把以前的技术债和垃圾也一起带过来。如果要手动重新从零开始配，一个个下完软件并调整好配置，一天也就没了。

管理 dotfiles 仓库彻底解决了这个问题。终端里敲一条命令，一台全新机器就能恢复到和你想要的理想状态。

## 核心概念

dotfiles 不是把 $HOME 目录整个丢进 Git。而是将配置文件集中存放在一个独立仓库里，然后通过符号链接（symlink）把它们挂到系统期望的位置。

这样做有两个直接好处。第一，系统读取的还是 ~/.zshrc、~/.gitconfig 这些标准路径，各软件无需感知仓库存在。第二，仓库本身可以整洁地存放于 ~/dotfiles 或 ~/.dotfiles，不会和 $HOME 里的其他文件混在一起。并且这是精准的配置文件备份，不会带上缓存。

如果你使用包管理器安装软件，dotfiles 仓库还可以记录所有安装的软件，实现一键重装。并且因为备份的是纯文本，实际的占用的空间非常小，完全可以用 Git 进行版本控制。

我的 dotfiles 仓库里有三个工具：

- **Dotbot**：一个轻量级的安装引导器，用 YAML 描述"哪些文件需要链接到哪里"，并自动创建符号链接。
- **Homebrew Bundle**：macOS 的包管理器 Homebrew，通过 Brewfile 以文本形式记录所有手动安装的命令行工具和桌面应用。
- **MAS**：作为 Homebrew 的补充，管理记录 Mac App Store 应用。
- **dotbot-brew**：Dotbot 的插件，让 install 脚本在安装符号链接之前自动执行 brew bundle。

## 从零搭建

以下示例是在 macOS 下进行的。不同的系统下具体的配置有所差异但是整体流程是类似的。

### 1. 创建仓库并引入 Dotbot

```bash
mkdir ~/.dotfiles
cd ~/.dotfiles
git init
git submodule add https://github.com/anishathalye/dotbot
cp dotbot/tools/git-submodule/install .
touch install.conf.yaml
```

install 脚本来自 Dotbot 官方模板，它会读取 install.conf.yaml 并执行配置。dotbot 本身作为 Git 子模块引入，不依赖外部包管理器。

### 2. 编写 install.conf.yaml

这是我的配置骨架，删减了部分个人路径：

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

clean 会清理指向仓库外部的不活跃符号链接，防止旧链接残留。link 下的每一项都是目标路径到仓库内相对路径的映射。brew 段落交给 dotbot-brew 处理。

### 3. 生成 Brewfile

```bash
brew bundle dump --file ~/.dotfiles/Brewfile --force
```

这条命令会把当前机器上所有手动安装的 formulae、casks 和 mas（Mac App Store）应用导出为文本。Brewfile 具有幂等性：在新机器上运行 brew bundle 时，已安装的包会被跳过，只补充缺失项。

一个典型的 Brewfile 长这样：

```ruby
# CLI
tap "homebrew/bundle"

brew "git"
brew "gh"
brew "node"
brew "go"
brew "mas"
brew "yt-dlp"

# 桌面应用
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

注意：mas 要求新机器先登录 Apple ID，否则 Mac App Store 部分会报错，但不会中断 Homebrew 包的安装。

### 4. 处理机器特定配置

不是所有配置都适合共享。SSH 私钥、API Token、邮箱账户密码、不同机器上的下载路径，这些应该留在本地。

我的做法是在主配置文件里预留一个 include 入口，指向一个不上传仓库的 `.local` 文件。

#### 4.1 什么是 .local 文件

`.local` 文件是一种配置隔离模式：每份 dotfiles 在仓库里存放的是**通用配置**（shared config），而机器专属的内容则放在一个独立的 `.local` 后缀文件中。这个 `.local` 文件**不被 Git 追踪**，因此永远不会进入仓库。

核心原则：

- **仓库 = 通用配置**：所有机器共享的部分（快捷键、插件、外观主题、工作流脚本）提交到 Git。
- **.local = 本地覆盖**：每台机器独有的内容（密钥、路径、代理、账户凭证）放在 `.local` 文件中，不提交。

这样做的好处显而易见：你可以放心地将仓库同步到不同电脑，所有通用配置自动生效，同时每台机器保留自己的个性化设置。

#### 4.2 常见配置文件的 .local 引用方式

不同软件有不同的 include 机制，以下是几种常见场景：

**zshrc**

在 `~/.zshrc` 末尾添加：

```bash
# 加载本地配置（如果存在）
if [ -f ~/.zshrc.local ]; then
    source ~/.zshrc.local
fi
```

`~/.zshrc.local` 中可以放置：机器专属别名、公司内网代理设置、个人环境变量、本地开发路径等。

**gitconfig**

Git 原生支持 `includeIf` 指令，可以按条件加载不同配置：

```ini
[user]
    # 通用配置：共享的 commit 模板、默认编辑器
    editor = code --wait
    commitTemplate = ~/.gitmessage

[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig_work

[include]
    path = ~/.gitconfig_local
```

`~/.gitconfig_local` 中放：个人邮箱/GPG 签名密钥、公司 Git 用户名、私有仓库的 credential helper。

**vim / neovim**

```vim
" ~/.config/nvim/init.vim

" 在末尾尝试加载本地配置
if filereadable(expand('~/.config/nvim/init.local.vim'))
    source ~/.config/nvim/init.local.vim
endif
```

或者使用 Lua 配置时：

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

# 尝试加载本地配置
if-shell "test -f ~/.tmux.conf.local" "source-file ~/.tmux.conf.local"
```

**VS Code**

VS Code 的 `settings.json` 不支持 include，但可以通过以下方式间接实现：

```json
// ~/.config/Code/User/settings.json
{
    // 通用设置（仓库中）
    "editor.fontSize": 14,
    "editor.tabSize": 2,
    // 本地设置通过 GUI 修改，会写入同一文件
    // 建议：只将通用部分提交，手动修改的部分不提交
}
```

更好的做法是使用 [Settings Sync](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync) 插件，将通用配置同步到 Gist，然后每台机器在本地覆盖个性化设置。

**其他软件**

对于不原生支持 include 的软件，可以用符号链接的方式变通：

```
# 仓库中存放通用配置
~/.config/myapp/config    →  ~/dotfiles/config/myapp/config

# 本地覆盖文件（不追踪）
~/.config/myapp/config.local
```

然后在应用启动脚本中判断：如果存在 `config.local` 则优先加载。

#### 4.3 .local 文件的目录结构建议

推荐将所有 `.local` 文件集中放在 `$HOME` 下，保持与仓库结构一致：

```
$HOME/
├── .zshrc              ← 仓库中（通用）
├── .zshrc.local        ← 不追踪（本地）
├── .gitconfig          ← 仓库中（通用）
├── .gitconfig_local    ← 不追踪（本地）
├── .tmux.conf          ← 仓库中（通用）
├── .tmux.conf.local    ← 不追踪（本地）
└── .config/
    └── myapp/
        ├── config       ← 仓库中（通用）
        └── config.local ← 不追踪（本地）
```

在仓库的 `.gitignore` 中统一忽略所有 `.local` 文件：

```
# .gitignore
*.local
```

这样即使不小心在本地创建了 `.local` 文件，`git status` 也不会提示未追踪的脏文件。

#### 4.4 换新机器时的操作流程

1. 克隆仓库并运行 install 脚本：

```bash
git clone git@github.com:yourname/dotfiles.git ~/.dotfiles
cd ~/.dotfiles && ./install
```

2. 创建需要的 `.local` 文件：

```bash
touch ~/.zshrc.local
touch ~/.gitconfig_local
touch ~/.tmux.conf.local
```

3. 在 `.local` 文件中填入当前机器的专属配置。

日常使用时，在通用配置和本地配置之间切换只需要编辑对应的文件，互不影响。

#### 4.5 进阶：按环境动态加载

如果机器角色更多（如「工作机」「家用机」「服务器」），可以用更细粒度的判断：

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

或者利用 `includeIf` 的条件判断（Git 2.13+）：

```ini
[includeIf "gitdir/i:~/work/"]
    path = ~/.gitconfig_work
```

这种模式让同一份 dotfiles 仓库能够根据当前目录自动切换配置，适合同时有工作和个人项目的场景。

## 常见陷阱

**fork 别人的 dotfiles**

dotfiles 是个人配置备份，别人的快捷键、Shell 主题、Git 别名对你来说可能是噪音。有些人会把别人的 dotfiles 当作模板使用，但是大部分时候这都不是最佳实践。

**把机密上传到 Git**

即使仓库设为私有，也不应该在 dotfiles 里放明文密钥。GPG 私钥、SSH 密钥、API Token 应该用 .local 文件或密码管理器管理。

**自带配置同步的 App**

某些 App（如 VSCode）自带云端设置同步，如果在 dotfiles 里同时用符号链接管理其配置文件，两边会争夺控制权，导致仓库持续显示有未提交的漂移。这类 App 建议交给它自己的同步机制，dotfiles 里排除对应路径。

## 换新机器怎么做

```bash
git clone git@github.com:thedavidweng/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
./install
```

install 脚本会按顺序执行：安装 dotbot 子模块、运行 brew bundle、创建所有符号链接。执行完以后，我的命令行工具、桌面应用、App Store 应用都会完成安装。

接着创建两个本地覆盖文件：

```bash
touch ~/.zshrc.local
touch ~/.gitconfig_local
```

按需填入这台机器的专属配置。

## 效果

- **换机时间**：从手动配置的半天缩短到 10 分钟
- **版本追踪**：每一次配置调整都是一条 Git 提交，可以随时回滚到三个月前的 zsh 主题
- **环境一致性**：工作机和个人机保持相同的编辑器快捷键、Shell 别名和 Git 行为，减少切换时的认知摩擦
- **无厂商锁定**：纯文本文件和标准 CLI 工具，不依赖任何付费同步服务

## 参考

> [respawn.io — dotfiles, Brewfile, and Mackup](https://respawn.io/posts/dotfiles-brew-bundle-and-mackup)
>
> [anishathalye.com — managing your dotfiles](https://anishathalye.com/managing-your-dotfiles/)
>
> [anishathalye/dotbot](https://github.com/anishathalye/dotbot)
>
> [d12frosted/dotbot-brew](https://github.com/d12frosted/dotbot-brew)

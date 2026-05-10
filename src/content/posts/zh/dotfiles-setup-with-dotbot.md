---
title: "从 15 个文件到一个命令：新 Mac 10 分钟搞定"
slug: dotfiles-setup-with-dotbot
description: "每次换 Mac 都要花半天重新配置软件和设置，现在一条命令搞定。"
publishedDate: 2026-05-08
tags:
  - Tools
  - Workflow
  - CLI
draft: true
locale: zh
---

买新机器或者重装电脑，开头总是最兴奋也最难受的。

如果选择从老机器导入数据，那会把以前的技术债和垃圾也一起带过来。如果要手动重新从零开始配，一个个下完软件并调整好配置，一天也就没了。

管理 dotfiles 仓库彻底解决了这个问题。终端里敲一条命令，一台全新机器就能恢复到和你想要的理想状态。

## 核心概念

dotfiles 不是把 $HOME 目录整个丢进 Git。正确做法是将配置文件集中存放在一个独立仓库里，然后通过符号链接（symlink）把它们挂到系统期望的位置。

这样做有两个直接好处。第一，系统读取的还是 ~/.zshrc、~/.gitconfig 这些标准路径，各软件无需感知仓库存在。第二，仓库本身可以整洁地存放于 ~/dotfiles 或 ~/.dotfiles，不会和 $HOME 里的其他文件混在一起。

流行的工具链有三件：

- **Dotbot**：一个轻量级的安装引导器，用 YAML 描述"哪些文件需要链接到哪里"，并自动创建符号链接。
- **Homebrew Bundle**：通过 Brewfile 以文本形式记录所有手动安装的命令行工具、桌面应用和 Mac App Store 应用，实现一键重装。
- **dotbot-brew**：Dotbot 的插件，让 install 脚本在安装符号链接之前自动执行 brew bundle。

## 从零搭建

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

我的做法是在主配置文件里预留一个 include 入口，指向一个不上传仓库的 .local 文件。

**zshrc**

```bash
if [ -f ~/.zshrc.local ]; then
    source ~/.zshrc.local
fi
```

**gitconfig**

```ini
[include]
    path = ~/.gitconfig_local
```

~/.zshrc.local 里可以放机器专属别名、环境变量或公司内网代理配置；~/.gitconfig_local 里放签名用的 GPG 密钥 ID 和公司 Git 用户名。这些 .local 文件在每台机器上只写一次，终身复用。

## 常见陷阱

**不要 fork 别人的 dotfiles**

dotfiles 是个人偏好集合，别人的快捷键、Shell 主题、Git 别名对你来说可能是噪音。参考官方文档和社区方案，但逐行理解后再写入自己的仓库。

**不要把密钥塞进 Git**

即使仓库设为私有，也不应该在 dotfiles 里放明文密钥。GPG 私钥、SSH 密钥、API Token 全部用 .local 文件或系统钥匙串管理。

**小心 Cloud 同步类 App**

某些 App（如 VSCode）自带云端设置同步，如果在 dotfiles 里同时用符号链接管理其配置文件，两边会争夺控制权，导致仓库持续显示有未提交的漂移。这类 App 建议交给它自己的同步机制，dotfiles 里排除对应路径。

**Brewfile 不是越全越好**

brew bundle dump 会忠实地导出所有手动安装的包。如果你三年前试过某个工具然后忘了卸载，它也会出现在 Brewfile 里。定期审查并删除不再使用的条目，否则新机器上会多装一堆垃圾。

## 换新机器怎么做

三条命令：

```bash
git clone git@github.com:thedavidweng/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
./install
```

install 脚本会按顺序执行：安装 dotbot 子模块、运行 brew bundle、创建所有符号链接。执行完以后，58 个命令行工具、28 个桌面应用、17 个 App Store 应用全部就位。

接着创建两个本地覆盖文件：

```bash
touch ~/.zshrc.local
touch ~/.gitconfig_local
```

按需填入这台机器的专属配置即可。

## 效果

- **换机时间**：从手动配置的半天缩短到 10 分钟
- **版本追踪**：每一次配置调整都是一条 Git 提交，可以随时回滚到三个月前的 zsh 主题
- **环境一致性**：工作机和个人机保持相同的编辑器快捷键、Shell 别名和 Git 行为，减少切换时的认知摩擦
- **无厂商锁定**：纯文本文件和标准 CLI 工具，不依赖任何付费同步服务

搭建这个系统花了一个周末阅读和试错。但在第一次换机时就彻底赚回了时间。

## 参考

> [respawn.io — dotfiles, Brewfile, and Mackup](https://respawn.io/posts/dotfiles-brew-bundle-and-mackup)
>
> [anishathalye.com — managing your dotfiles](https://anishathalye.com/managing-your-dotfiles/)
>
> [anishathalye/dotbot](https://github.com/anishathalye/dotbot)
>
> [d12frosted/dotbot-brew](https://github.com/d12frosted/dotbot-brew)

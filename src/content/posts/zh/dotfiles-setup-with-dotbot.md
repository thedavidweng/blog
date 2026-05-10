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

## 装什么

这套方案管理三类东西：**软件**、**配置文件**、**个人偏好**。

### 软件（58 个命令行工具 + 28 个桌面应用 + 17 个 App Store 应用）

**每天必用**：
- **浏览器**：Zen（替换了 Chrome，更轻，没有 Google 追踪）
- **终端和编辑器**：Warp、Zed、Cursor、Obsidian
- **通讯**：WeChat（App Store 安装）
- **效率工具**：Amphetamine、Dropover、Spark、Raycast、Stats
- **开发环境**：Docker、Go、Node、Python、Git、GitHub CLI
- **媒体工具**：iINA、HandBrake、yt-dlp
- **实用工具**：Keka、ImageOptim、Haze、Calendr、OpenLoop

加上 Mac App Store 的 17 个应用（Xcode、TestFlight、Infuse、Bitwarden、Tailscale 等）。

### 配置文件（12 个工具）

代码仓库里存放我在多台机器间同步的个人配置：
- **Shell**（zsh + login shell）
- **Git**（GPG 签名、LFS、用户信息）
- **GitHub CLI**、**Zed 编辑器**、**Obsidian**、**Himalaya 邮件客户端**、**Gollama**、**OpenCode**

### 机器特定设置（不同步）

有些东西故意不纳入版本控制，因为每台机器都不一样：
- SSH 密钥和 API 令牌
- 邮箱账号凭据
- 机器专属路径

这些通过 `.local` 文件在每台机器单独保存，只创建一次，从不上传。

## 工作原理

方案基于 [Dotbot](https://github.com/anishathalye/dotbot)，它会在仓库中的配置文件和系统应用期望的位置之间创建符号链接。配合 [dotbot-brew](https://github.com/d12frosted/dotbot-brew) 插件实现一键安装应用。

仓库托管在 GitHub 上（私有）：[thedavidweng/dotfiles](https://github.com/thedavidweng/dotfiles)。

## 换新机器怎么做

三条命令：

```bash
git clone git@github.com:thedavidweng/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
./install
```

完成后，58 个命令行工具、28 个桌面应用、17 个 App Store 应用全部装好。创建几个本地覆盖文件（仓库里有文档），一切就绪。

## 效果

- **换机时间**：从半天缩短到 10 分钟
- **版本追踪**：每次配置修改都有 Git 记录
- **无厂商锁定**：纯文本文件 + 标准工具
- **可重复**：任意 Mac、任意次数，一键恢复

初始搭建花了一个周末试错。但在第一次换机时就赚回来了。

## 参考

> [respawn.io — dotfiles, Brewfile, and Mackup](https://respawn.io/posts/dotfiles-brew-bundle-and-mackup)

> [anishathalye.com — managing your dotfiles](https://anishathalye.com/managing-your-dotfiles/)

> [anishathalye/dotbot](https://github.com/anishathalye/dotbot)

> [d12frosted/dotbot-brew](https://github.com/d12frosted/dotbot-brew)

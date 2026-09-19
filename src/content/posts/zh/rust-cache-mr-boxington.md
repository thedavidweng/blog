---
title: "告别几十 GB 的 Target 膨胀：用 Mr Boxington (mbx) 与 Mise 打造全局 Rust 缓存"
description: "Rust 编译产物动辄数十 GB。结合 Mise 与 Mr Boxington (mbx)，借助 macOS APFS Reflink 零拷贝与全局自动垃圾回收，彻底终结多 Worktree 重复编译与磁盘焦虑。"
publishedDate: 2026-09-18
tags:
  - Tools
  - Workflow
  - CLI
draft: false
locale: zh
related:
  - dotfiles-toolchains-mise
  - dotfiles-advanced-chezmoi
---

在 macOS 上开发多个 Rust 项目或大型应用，各个项目目录下的 `target/` 会快速吞掉数十 GB 磁盘空间。在并发测试或 Git Worktree 分支下，每个独立的检出目录都会从零重新编译。

传统的 `sccache` 无法解决物理目录膨胀的问题。这篇文章写为什么替换 `sccache`，以及如何用 **Mr Boxington（mbx，Rust 构建缓存工具）** 配合 Mise 与 macOS APFS Reflink 实现全局共享编译缓存。

## Sccache 的限制

我之前在全局 `~/.cargo/config.toml` 中配置过 `sccache`：

```toml
[build]
rustc-wrapper = "/opt/homebrew/bin/sccache"
incremental = false
```

实际使用中，`sccache` 有两个限制：

### 1. 增量编译与缓存命中的冲突

`sccache` 无法缓存 Rust 的增量编译状态（Incremental Compilation）。为了让 `sccache` 命中缓存，配置中必须强制关闭增量编译（`incremental = false`）。

关闭后，日常修改单行代码无法享受编译器的增量优化，重编等待时间明显变长。

### 2. 无法阻止 target 目录本身的物理膨胀

`sccache` 是键值存储，各个项目的 `target/` 目录依然保留全部生成的目标文件与调试符号。

它不会回收废弃的 worktree 产物，也不会限制总磁盘用量。磁盘耗尽时，仍然需要写脚本遍历目录执行 `cargo clean`。

## Mr Boxington (mbx) 的机制

[Mr Boxington](https://github.com/jdx/mr-boxington)（命令行工具名 `mbx`）是 Mise 作者 [jdx](https://github.com/jdx) 开发的 Rust 构建缓存与目标目录管理工具。

它的工作机制如下：

### 1. 零常驻守护进程（No Daemon）

`mbx` 没有后台常驻服务。每次执行 Cargo 命令时，它在当前进程生命周期内启动一个轻量本地 cache agent，构建结束即刻退出，不存在后台泄漏与挂起问题。

### 2. macOS APFS Reflink 零拷贝

在 APFS 文件系统上，`mbx` 把中央缓存恢复到项目的 `target/` 目录时使用 Copy-on-Write 的 Reflink 引用，而非物理拷贝。

恢复编译产物只需数毫秒。不同项目与不同 Git Worktree 共享同一份底层数据块，不重复占用物理存储。

### 3. 受控目标（Managed Targets）与自动垃圾回收

`mbx` 引入了配额机制（默认全局 20.0 GiB）。

每次构建时，`mbx` 记录活跃工作区。对于长期未访问的临时 worktree 或废弃项目产物，`mbx gc` 按 LRU 策略自动清除，将整机的 Rust 编译缓存保持在预设水位内。

## 配置 Mise 与 mbx

Mise 在 2026.9 以上版本原生支持 `mr_boxington` 选项，一行命令即可全局配置：

```bash
mise use --global --tool-option mr_boxington=true rust mr-boxington
```

该命令执行三项变更：
1.  下载安装 Rust 工具链与 `mr-boxington`（`mbx`）二进制。
2.  在 `~/.config/mise/config.toml` 中配置 Cargo Wrapper：

```toml
wrappers = { cargo = { command = "mbx", env = { MBX_CARGO_SHIM_MODE = "1" } } }

[tools]
mr-boxington = "latest"
rust = { version = "latest", mr_boxington = true }
```

3.  执行 `mbx setup --global`，为 `cargo` 与 `rust-analyzer` 配置拦截代理。

日常运行 `cargo build` 或 IDE rust-analyzer 后台检查时，命令自动通过 `mbx` 走中央缓存。

## Chezmoi 配置与迁移细节

将该配置固化到 Chezmoi 时，需要注意两个细节：

### 1. 移除旧的 Sccache Wrapper

`sccache` 与 `mbx` 均通过拦截 rustc 工作，两者不能在同一个构建中混用。如果环境中残留了 `RUSTC_WRAPPER` 或 `build.rustc-wrapper`，`mbx` 会自动退让并不生效。

将 `dot_cargo/config.toml` 纳入 Chezmoi 管理，并移除原有的 `rustc-wrapper`：

```toml
# ~/.local/share/chezmoi/dot_cargo/config.toml
# Global Cargo configuration.
# Managed by chezmoi

[build]
# mr-boxington (mbx) 通过 mise shim 统一管理中央缓存
# 已移除 sccache 避免 RUSTC_WRAPPER 冲突

[profile.dev]
debug = false
```

### 2. 保证 ~/.zshenv 中的 Shims 优先级

为了防止后台子进程派生非交互 shell 时跳过 `mbx`，在 `dot_zshenv.tmpl` 中将 mise shims 与 mbx 路径置顶：

```zsh
export PATH="$HOME/.local/share/mise/shims:$HOME/Library/Application Support/mbx/bin:/opt/homebrew/bin:/opt/homebrew/sbin:$PATH"
```

## 验证

运行内置检查命令：

```bash
mbx doctor
```

输出应为全绿状态：

```
  ok  cargo        cargo 1.98.1
  ok  rustc        rustc 1.98.1
  ok  cache        /Users/david/Library/Caches/mbx is writable
  ok  config       20.0 GiB budget, automatic gc enabled, managed targets enabled
  ok  reflink      cloning is supported (macOS APFS reflink)
  ok  setup        mise Cargo wrapper is active
0 failures, 0 warnings
```

日常命令：
*   `mbx stats`：查看全局缓存用量、累计节约的编译时间、跨工作区去重字节数。
*   `mbx tui`：打开实时终端仪表盘，查看编译中的 crates 进度与缓存命中状态。
*   `mbx gc`：手动触发一次全局缓存回收。

## 参考

> [Mr Boxington GitHub 仓库](https://github.com/jdx/mr-boxington)
> 
> [Mr Boxington 官方文档](https://mr-boxington.jdx.dev/)
> 
> [Mise 官方文档](https://mise.jdx.dev/)
> 
> [dotfiles 进阶篇：用 Mise 统一多语言开发工具链与 AI Agent 环境](/posts/dotfiles-toolchains-mise/)

---
title: "dotfiles 进阶篇：用 Chezmoi 管理跨机器配置与密钥"
description: "从 Dotbot 迁移到 Chezmoi，把公共配置、机器私有配置、密钥分层管理。"
publishedDate: 2026-05-19
tags:
  - Tools
  - Workflow
  - CLI
draft: false
locale: zh
---

上一篇写了如何用 Dotbot + Brewfile 搭一套轻量的 dotfiles。那套方案的核心是把配置文件放在一个 Git 仓库里，再通过符号链接挂回系统期待的位置。这已经能解决 80% 的问题。换新机器时，克隆仓库、运行 install 脚本、等 Homebrew 把软件装完，就能恢复熟悉的开发环境。

但用了一段时间以后，我开始遇到另外一些问题：

- 有些软件会自动改配置文件，导致 dotfiles 仓库经常变脏。
- 有些配置文件里混着 API key、本机路径、邮箱账号、SSH host。.local 文件虽然能隔离私有配置，但不是所有软件都支持 include 或 source。
- symlink 让配置变得直观，但也让「软件写入」直接变成「仓库写入」。

于是我把 dotfiles 从 Dotbot 迁到了 Chezmoi。

这篇是 Part 2，讲的是 dotfiles 的进阶形态：不只是备份配置，而是把「公共配置」「机器私有配置」「密钥」分层管理。

## Dotbot 和 Chezmoi 的核心区别

Dotbot 常见的工作方式是 symlink：

```
~/.zshrc           -> ~/.dotfiles/shell/.zshrc
~/.config/zed      -> ~/.dotfiles/config/zed
~/.config/opencode -> ~/.dotfiles/config/opencode
```

系统和软件读取的仍然是标准路径，比如 ~/.zshrc、~/.config/zed/settings.json，但真实文件在 dotfiles 仓库里。

这带来一个结果：软件写配置时，实际上直接写到了 Git 仓库里的文件。这既是优点，也是缺点。优点是改完设置，仓库马上出现 diff；缺点是 token、cache、最近打开文件、窗口位置、自动生成的状态文件，也可能一起进入仓库。

Chezmoi 默认不是 symlink 模式，而是 source/apply 模式：

```
~/.local/share/chezmoi/dot_zshrc.tmpl         --apply--> ~/.zshrc
~/.local/share/chezmoi/dot_config/zed/...     --apply--> ~/.config/zed/...
~/.local/share/chezmoi/private_dot_ssh/config --apply--> ~/.ssh/config
```

也就是说，仓库里保存的是「源文件」或「模板」，chezmoi apply 时才把它们生成到真正的 $HOME 位置。这样第三方软件再写 ~/.config/zed/settings.json，只会修改 $HOME 里的真实文件，不会自动污染 source repo。如果你确实想把这次修改收回仓库，需要显式执行：

```bash
chezmoi re-add ~/.config/zed/settings.json
```

## 为什么从 Dotbot 迁到 Chezmoi

Dotbot 非常适合最小化系统：配置文件少、结构清晰、没有太多机器差异时，symlink 简单可靠。

但一旦 dotfiles 开始管理下面这些东西，Chezmoi 的优势就会明显很多：

- 多台机器共享一套配置，但每台机器有不同的用户信息、路径、密钥。
- 某些软件不支持 .local 文件，但配置里又必须包含机器私有值。
- 不想把 API key 明文放到 Git，也不想长期放在本机明文配置里。
- 支持密码管理器，可以配合 Bitwarden CLI 等工具管理敏感数据。

软件最终看到的仍然是普通配置文件。但这些配置文件不再是仓库文件本身，而是由 Chezmoi 在 apply 时生成。

## 从零建立 Chezmoi 仓库

Chezmoi 可以从已有 `$HOME` 文件开始管理：

```bash
brew install chezmoi
chezmoi init
chezmoi add ~/.zshrc
chezmoi add ~/.gitconfig
chezmoi add ~/.config/zed/settings.json
```

默认 source 目录在：`~/.local/share/chezmoi`

这个目录本身就是一个 Git 仓库。初始化后可以进入 source 目录：

```bash
chezmoi cd
```

再添加 remote：

```bash
git remote add origin git@github.com:yourname/dotfiles.git
git add -A
git commit -m "Initial dotfiles"
git push -u origin main
```

Chezmoi 的文件命名有一套规则。几个常见例子：

```
dot_zshrc                       -> ~/.zshrc
dot_gitconfig                   -> ~/.gitconfig
dot_config/zed/settings.json    -> ~/.config/zed/settings.json
private_dot_ssh/config          -> ~/.ssh/config，并设置更严格权限
```

如果文件需要模板能力，就加 .tmpl：

```
dot_zshrc.tmpl                  -> ~/.zshrc
dot_gitconfig.tmpl              -> ~/.gitconfig
dot_config/opencode/config.tmpl -> ~/.config/opencode/config
```

## 用模板解决 .local 做不到的事情

上一篇里我用 .local 文件解决机器私有配置：

```bash
# ~/.zshrc
[ -f ~/.zshrc.local ] && source ~/.zshrc.local
```

这个模式对 shell、SSH、tmux 这类支持 include/source 的工具很好。但很多软件并不支持。比如一个 GUI app 只读：

```
~/.config/app/settings.json
```

它不会帮你加载：

```
~/.config/app/settings.local.json
```

这时 Chezmoi 的模板就派上用场了。它不是让软件支持 .local，而是在软件读取之前，先把配置合成好。

仓库里放：

```
dot_config/app/settings.json.tmpl
```

模板内容可以是：

```json
{
  "theme": "dark",
  "email": {{ .email | quote }},
  "apiKey": {{ .app_api_key | quote }}
}
```

本机数据放在：

```
~/.config/chezmoi/chezmoi.toml
```

```toml
[data]
email = "me@example.com"
app_api_key = "..."
```

执行：

```bash
chezmoi apply
```

最终生成给软件读取的是普通 JSON：

```json
{
  "theme": "dark",
  "email": "me@example.com",
  "apiKey": "..."
}
```

软件完全不需要知道模板和 .local 的存在。

## 本机数据：chezmoi.toml

Chezmoi 支持每台机器拥有自己的本地配置。我的本机配置放在：

```
~/.config/chezmoi/chezmoi.toml
```

这个文件不进入 dotfiles 仓库，权限设置为 600：

```bash
chmod 600 ~/.config/chezmoi/chezmoi.toml
```

里面适合放非敏感的机器差异，以及密码管理器里的 item 名称：

```toml
[data]
machine_profile = "personal-mac"
git_user_name = "Davy"
git_user_email = "95214375+thedavidweng@users.noreply.github.com"
git_signing_key = "~/.ssh/id_ed25519.pub"

use_bitwarden_secrets = true
opencode_api_key_minimax_bw_item = "chezmoi/opencode/minimax-api-key"
```

真实 API key 不存在这里，chezmoi.toml 只保存「去 Bitwarden 取哪个 item」。

## 用 Bitwarden 管理真正的密钥

Chezmoi 可以通过模板调用密码管理器，比如 Bitwarden CLI。

模板里可以这样从 Bitwarden 取值：

```json
"apiKey": {{ (bitwarden "item" .opencode_api_key_minimax_bw_item).login.password | quote }}
```

运行 chezmoi apply 前，需要先解锁 Bitwarden CLI：

```bash
export BW_SESSION="$(bw unlock --raw)"
```

然后再执行：

```bash
chezmoi apply
```

这样 Git 仓库里没有 API key，本机 chezmoi.toml 里也没有 API key。Secret 存在 Bitwarden 里。

需要注意的是：如果目标软件要求配置文件里出现明文 key，那么 apply 后生成的最终配置文件里仍然会有明文 key。密码管理器解决的是「不要把 secret 放进 Git」，不是让所有本地明文消失。因此生成后的目标文件仍然应该注意权限和备份范围。

## 迁移一个真实配置：OpenCode

以 OpenCode 为例，它的配置里有多个 provider，每个 provider 需要一个 API key。

Dotbot 时代，如果整个 ~/.config/opencode 是 symlink，那么任何 GUI 或 CLI 写入都会直接污染仓库。

迁到 Chezmoi 后，我把：

```
dot_config/opencode/opencode.json
```

改成：

```
dot_config/opencode/opencode.json.tmpl
```

里面的 key 从明文改成：

```json
{
  "provider": {
    "minimax": {
      "options": {
        "apiKey": {{ (bitwarden "item" .opencode_api_key_minimax_bw_item).login.password | quote }}
      }
    }
  }
}
```

本机 chezmoi.toml 里只保存：

```toml
[data]
opencode_api_key_minimax_bw_item = "chezmoi/opencode/minimax-api-key"
```

这个 item 名称可以同步，真正的 key 不同步。

## SSH 私钥要不要放进密码管理器

技术上可以。你可以让 Chezmoi 从 Bitwarden 取 SSH 私钥，然后生成：

```
~/.ssh/id_ed25519
```

但我不推荐默认这么做。更好的做法是每台机器生成自己的 SSH key，只同步 SSH config 的公共结构。

```bash
ssh-keygen -t ed25519 -C "your-email"
```

然后把每台机器的 public key 加到 GitHub 或服务器。这样一台机器丢了，只撤销那台机器的 key，不需要轮换所有设备共享的一把私钥。

我会把 SSH host 配置分成两类：

- 公共 host alias，可以进 Chezmoi 模板。
- 私有 host、内网 IP、特殊 key 路径，可以放 Bitwarden 或本机 data。

## Chezmoi 常见命令

查看将要改变什么：

```bash
chezmoi diff
```

进入 source 仓库：

```bash
chezmoi cd
git diff
```

Dry-run：

```bash
chezmoi apply --dry-run --verbose
```

正式应用：

```bash
chezmoi apply --verbose
```

软件改了配置以后，如何收回仓库：

Chezmoi 不会自动把目标文件写回 source。如果我在软件里改了设置，想把它纳入 dotfiles，需要显式执行：

```bash
chezmoi re-add ~/.config/zed/settings.json
```

然后检查 diff：

```bash
chezmoi cd
git diff
```

确认没有把 token、cache、机器路径带进去，再 commit。

## 新机器上的恢复流程

新机器从零开始大致是：

```bash
# 1. 安装 Homebrew 后，安装 chezmoi 和 bitwarden-cli
brew install chezmoi bitwarden-cli

# 2. 克隆 dotfiles 到 ~/.local/share/chezmoi
chezmoi init git@github.com:yourname/dotfiles.git

# 3. 准备本机 chezmoi.toml
mkdir -p ~/.config/chezmoi
vim ~/.config/chezmoi/chezmoi.toml

# 4. 登录并解锁 Bitwarden
bw login
export BW_SESSION="$(bw unlock --raw)"

# 5. dry-run
chezmoi apply --dry-run --verbose

# 6. 正式 apply
chezmoi apply --verbose
```

## 忽略规则：.gitignore 和 .chezmoiignore 都要有

.gitignore 只阻止文件进入 Git，不会阻止 Chezmoi apply。

.chezmoiignore 才会阻止文件从 source materialize 到 $HOME。

我的基础规则：

```
# local overrides
*.local
*.local.*
*.bak
*.backup

# secrets / auth
*token*
*secret*
*credential*
*credentials*
*client_secret*
*license*
hosts.yml

# package/cache artifacts
node_modules/
package-lock.json
bun.lock
bun.lockb
.pnpm-store/

# local chezmoi config
.chezmoi*.toml
.chezmoi*.yaml
```

这套规则同时放进 .gitignore 和 .chezmoiignore。前者防止误提交，后者防止误生成。

## 温馨提示

**不要让 Chezmoi 管理登录态文件**

例如 `~/.config/gh/hosts.yml` 是 GitHub CLI 的登录状态，应该在每台机器上用 `gh auth login` 生成，而不是同步。

**不要默认同步 SSH 私钥**

SSH 私钥可以放密码管理器，但每台机器独立 key 更安全。

## 效果

迁到 Chezmoi 后，dotfiles 的角色从「备份一组文件」变成了「生成一台机器的配置」。

- **公共配置进 Git**：Shell、Git、编辑器、CLI 工具配置可版本化。
- **机器差异留本机**：路径、用户名、机器角色不污染仓库。
- **密钥进密码管理器**：API key 不在 Git，也不长期明文放在 chezmoi.toml。
- **软件写入不再自动污染 repo**：需要显式 re-add，减少误提交。
- **迁移更可控**：dry-run 能清楚看到哪些 symlink 会被替换，哪些文件会生成。

Dotbot 是一个很好的起点。它轻、直观、足够解决大多数配置同步问题。Chezmoi 更复杂，但对多机器和需要更细颗粒度的场景更好。

## 参考

> [Chezmoi 官方文档](https://chezmoi.io)
>
> [Chezmoi: Templates](https://chezmoi.io/templates/)
>
> [Chezmoi: Password managers](https://chezmoi.io/password-managers/)
>
> [Bitwarden CLI](https://bitwarden.com/help/cli/)

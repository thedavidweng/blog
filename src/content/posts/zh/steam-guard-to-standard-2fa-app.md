---
title: "把 Steam Guard 导入标准 2FA 软件"
locale: zh
description: "用 steamguard-cli 把 Steam 手机令牌转移到电脑，再导入 2FAS 等 2FA 软件。记录 Transfer、Revoke、二维码导入和 Base64 密钥的坑。"
publishedDate: 2026-09-28
tags:
  - Tools
  - CLI
draft: true
---

Steam Guard 手机令牌只能在 Steam App 里用。我手上 4 个 Steam 账号的令牌都在一台 iPhone 上，想统一放进 [2FAS](https://2fas.com/)，和其他账号的 2FA 码放在一起。

最后可行的路线是用 [steamguard-cli](https://github.com/dyc3/steamguard-cli) 把令牌转移到 Mac，拿到密钥，再导入 2FAS。本文按实际能跑通的顺序写，失败的尝试放在最后的「坑」里。

## 先说结论

- 新版 Steam iOS App 的密钥无法通过 iPhone 备份提取，只能重新转移令牌
- 转移令牌会触发 2 天交易限制，用撤销码重建会触发 15 天交易限制
- 导入 2FA 软件优先用 `steamguard qr`，不要把 maFile 里的 `shared_secret` 直接贴进去
- 2FA 软件里的类型必须选 Steam，生成 5 位字母数字码

## 为什么不走 iPhone 备份

网上很多教程教你从 iPhone 加密备份里找 `Steamguard-<steamid>` 文件，读出 `shared_secret`。这个方法对新版 Steam iOS App 已经失效。

我做过两次 iPhone 加密备份并完整解密。App 目录里没有 `Steamguard-*` 文件，钥匙串（Keychain）里 3 万多条记录也没有任何 Steam 相关条目。App 只保存了登录用的 `refreshToken` 和 `accessToken`，拿不到令牌密钥。

所以唯一的办法是让 Steam 把令牌转给另一个客户端，也就是 steamguard-cli。

## 准备

需要这些东西：

- 一台 Mac（Linux 和 Windows 也行，命令一样）
- 当前绑定令牌的手机，Steam App 能正常打开
- 每个账号的 Steam 密码
- 账号绑定的手机号能收短信（走 Transfer 时需要）
- 或者账号的撤销码，格式是 `R` 加 5 位数字，比如 `R12345`（走 Revoke 时需要）

用 Homebrew 安装：

```bash
brew install steamguard-cli
steamguard --version
```

macOS 上 maFiles 存放在：

```
~/Library/Application Support/steamguard-cli/maFiles/
```

Linux 是 `~/.config/steamguard-cli/maFiles/`，Windows 是 `%APPDATA%\steamguard-cli\maFiles\`。每个账号一个 `<account>.maFile`，外加一个 `manifest.json`。

## 第一步：登录

每个账号单独跑一次：

```bash
steamguard setup
```

它会依次问用户名和密码：

```
Log in to the account that you want to link to steamguard-cli
Username: <account>
Password:
```

密码正确后进入登录验证，提示因账号状态而异：

```
Please confirm this login on your other device and press enter, OR
Enter the 2fa code from your device:
```

这时有两种做法：

- 在手机 Steam App 里点「批准登录」，然后回到终端按回车
- 在 Steam App 里查看这个账号当前的 5 位码，比如 `ABCDE`，输入后回车

如果账号绑的是邮箱令牌，提示会变成 `Enter the 2fa code sent to your email:`，去邮箱找 Steam 发来的码。

验证码 30 秒左右就会过期。每个码只提交一次，失败了等 App 刷出下一个码再试。重复提交旧码会被拒绝，还会消耗尝试次数。

多个账号时，先在 Steam App 里切换到对应的账号，再看码或批准。

## 第二步：转移或撤销

登录成功后，如果账号已经有手机令牌，会看到：

```
[T] Transfer authenticator to steamguard-cli (2 day trade ban)
[R] Revoke authenticator with revocation code (15 day trade ban)
[A] Abort setup
What would you like to do? [Tra]
```

两个选项的区别：

| 选项 | 需要 | 交易限制 |
|---|---|---|
| T（Transfer，转移） | 账号绑定的手机号收短信 | 2 天 |
| R（Revoke，撤销） | 撤销码 `R12345` | 15 天 |

交易限制期间可以正常登录和玩游戏，只是不能交易物品和使用市场。

### 选 T：转移

输入 `t` 回车，Steam 会给绑定的手机号发短信：

```
Enter SMS code:
```

输入短信里的数字码。成功后会打印新的撤销码：

```
Transfer successful, adding account to manifest
Take a moment to write down your revocation code: R12345
```

把撤销码记到密码管理器里。转移完成后，手机 Steam App 里这个账号的令牌立刻失效。

### 选 R：撤销

账号没绑手机号，或者收不到短信，只能走这条。输入 `r` 回车，再输入撤销码：

```
Enter your revocation code (R#####): R12345
```

撤销后 steamguard-cli 会给账号绑一个全新的令牌，流程见下一节。

## 没有令牌的账号：新绑定

如果账号本来就没有手机令牌，或者刚刚用撤销码撤掉了，`setup` 会直接走新绑定流程：

```
Authenticator has not yet been linked. Before continuing with finalization, please take the time to write down your revocation code: R12345
Press enter to continue...
```

先记下这个新撤销码，然后按回车。Steam 会发一封确认邮件：

```
A code has been sent to the email address associated with this account.
Enter email code:
```

注意这封邮件和登录时的邮件不是同一封。登录码只能用来登录，这里要用新收到的码。输入后看到这行才算完成：

```
Authenticator has been finalized.
```

检查状态：

```bash
steamguard -u <account> status
```

输出里要有这一行：

```
Is 2FA set up? true
```

如果是 `false`，说明最后一步没完成，Steam 那边还没启用这个令牌。

## 第三步：确认电脑能出码

```bash
steamguard list
steamguard -u <account> code
```

`list` 列出所有已导入的账号，`code` 打印当前的 5 位码，比如 `ABCDE`。用这个码登录一次 Steam 网页或客户端，能登进去就说明令牌已经在电脑上了。

## 第四步：导入 2FA 软件

这一步我踩了最大的坑。

maFile 里有一个 `shared_secret` 字段，长这样：

```
"shared_secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxx="
```

它是 **Base64** 编码，末尾的 `=` 是填充字符。2FAS 这类软件要的是 **Base32** 编码的密钥。直接把 Base64 贴进去，2FAS 不会报错，也会正常显示 5 位码，但算出来的码是错的，登录会失败。

### 推荐方法：steamguard qr

steamguard-cli 自带生成二维码的命令，密钥已经转换好，不用自己处理编码：

```bash
steamguard -u <account> qr
```

终端会打印一个二维码。它的内容是：

```
otpauth://totp/Steam:<account>?secret=<BASE32>&issuer=Steam
```

也就是 maFile 里 `uri` 字段的值，密钥部分已经是 Base32。

这个格式不带位数和算法参数，普通 2FA 软件扫进去会默认成 6 位数字的 TOTP。2FAS 扫码后如果显示 6 位数字，进入这条记录的设置把 Type 改成 STEAM。改不了就删掉这条，用下面的手动方法添加。2FAS 官方文档也只写了手动添加这一种方式。

Bitwarden 和 KeePassXC 需要专用格式：

```bash
steamguard -u <account> qr --format bitwarden
steamguard -u <account> qr --format keepassxc
```

`bitwarden` 格式输出 `steam://<BASE32>`，贴进 Bitwarden 登录项的 Authenticator Key 字段。`keepassxc` 格式在 URI 里带上 `digits=5`、`period=30` 和 `encoder=steam`。

终端字体显示不了方块时，加 `--ascii`：

```bash
steamguard -u <account> qr --ascii
```

### 备用方法：手动转成 Base32

扫码不方便或者软件扫不出 Steam 类型，就手动输入。先把 Base64 转成 Base32：

```bash
printf '<shared_secret>' | base64 -d | base32
```

`<shared_secret>` 整段贴进去，包括末尾的 `=`。输出的 Base32 字符串就是要填进 2FA 软件的密钥。

也可以直接从 maFile 的 `uri` 字段里取 `secret=` 和 `&issuer` 之间的部分，那段已经是 Base32。

在 2FAS 里手动添加：

1. 点 `+`，选「Enter secret key manually」
2. Service name 填 `Steam`，或者直接填账号名方便区分
3. Secret key 粘贴 Base32 密钥
4. 点 Other settings，Type 选 **STEAM**
5. 点 Add service

2FAS 官方的步骤见 [How to add a STEAM Guard token](https://2fas.com/support/2fas-auth-mobile-app/how-to-add-a-steam-guard-token/)。

### 不能用的软件

steamguard-cli 的 README 明确写了，Google Authenticator 和 Authy 算不出正确的 Steam 码。这两个不要用。

### 核对

每导入一个账号，在同一时间对比两边：

```bash
steamguard -u <account> code
```

终端和 2FA 软件显示的码必须完全一样。不一样就检查两件事：密钥是不是 Base32，类型是不是 STEAM。

## 第五步：备份

令牌现在只存在两个地方：电脑上的 maFiles 和 2FA 软件。两处都丢了，只能靠撤销码重建，还要吃 15 天交易限制。撤销码也丢了，只能找 Steam 客服。

需要保存的东西：

- 每个账号的撤销码，存进密码管理器
- maFiles 目录，加密后另外存一份

steamguard-cli 可以直接加密 maFiles：

```bash
steamguard encrypt
```

它会让你设一个密码。之后每次用 `steamguard` 都要输入这个密码，也可以通过 `--passkey` 参数或 `STEAMGUARD_CLI_PASSKEY` 环境变量传入。

maFiles 也可以整份存进密码管理器，或者 Bitwarden Secrets Manager 这类密钥管理服务，换电脑时再取回来放到上面的目录。

二维码和密钥等于完整的令牌。不要截图存进相册，不要贴进聊天软件或 AI 对话框。

## 第六步：清理

导入完成后，删掉过程中产生的明文文件：

- 自己导出的密钥文本
- 手机的加密备份和解密出来的文件，尤其是钥匙串导出，那是整台手机的明文密码
- 带密码的 shell 历史或日志

```bash
rm -rf ~/path/to/iphone-backup ~/path/to/keychain-export.plist
```

路径换成你实际的位置。

## 坑

### 转移时收不到短信

Transfer 的短信发到 Steam 账号绑定的手机号，不是当前批准登录的那部手机。多个账号绑了不同号码时，先确认这个账号绑的是哪个号。

如果已经把手机号从账号里移除了，Transfer 走不通。要么重新绑手机号，要么用撤销码走 Revoke。

### 登录时既没有码也没有批准请求

账号在 Steam App 里没有令牌时，App 不会出码，也不会弹批准请求，steamguard-cli 这边卡在登录验证。

我的做法是先在手机 Steam App 里给这个账号重新添加令牌，然后用 App 出的新码登录 steamguard-cli，再走 Transfer。

### 用 2FAS 出的码登录失败

几乎都是这两个原因：

- 贴的是 Base64 的 `shared_secret`，不是 Base32
- 类型是默认的 TOTP，显示 6 位数字，不是 STEAM 的 5 位字母数字

用 `steamguard qr` 或上面的 Base32 转换命令重新添加。

### 新绑定时用错了邮件码

新绑定要收两封邮件，一封用于登录，一封用于最后确认。两封的码不能混用。输完最后一个码后用 `status` 检查 `Is 2FA set up? true`，没看到就重新跑 `steamguard setup`。

重新跑之前，如果 `steamguard list` 里已经有这个账号的半成品，`setup` 会报账号已存在。这时手动删掉本地记录：删除 maFiles 目录里的 `<account>.maFile`，再从 `manifest.json` 的 `entries` 里删掉这个账号对应的那一项。

不要用 `steamguard remove`。它会把令牌从 Steam 账号上移除，不只是删本地文件。

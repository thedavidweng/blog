---
title: "白嫖 Cursor 4.6-opus-high-thinking 怒省 600 刀"
locale: zh
slug: "exploit-cursor-cloud-agent"
description: "上个月我发现一个漏洞，可以无限免费使用 Cursor 的 4.6-opus-high-thinking 模型。漏洞已修复，但这背后的原理值得深思。"
publishedDate: 2026-05-02
tags:
  - Tools
  - Thoughts
draft: false
---

上个月我发现一个漏洞。

Cursor 的 Cloud Agent 模式，可以连上 GitHub 账户拉取账号下的 Repo。在 setup 环境的时候不要点击 **Save environment**，然后你就可以跟那个跑 4.6-opus-high-thinking 的 setup agent 一直聊下去。

缺点有两个：不支持图片以外的附件，想用 skills 得手动把内容粘贴到对话框。

连续跑了几个小时，setup agent 的会话始终不计费。

![Cursor Cloud Agent 连续运行数小时，Usage 页面显示 claude-4.6-opus-high-thinking 的 cost 为 Included](/posts/exploit-cursor-cloud-agent/exploit-cursor-cloud-agent-usage.avif)

没几天这个洞就被补上了。现在尝试在 setup environment 的时候做 prompt injection，agent 会直接拒绝响应。

---

## 漏洞利用的完整步骤

1. 打开 Cursor，进入 Cloud Agent 模式
2. 连接你的 GitHub 账户，授权访问仓库
3. 在 setup 环境阶段，选择一个基础环境配置
4. **关键步骤**：在 agent 开始初始化时，**不要点击 Save environment**
5. 直接开始对话，此时你用的是 setup agent 的会话，而不是普通 Agent
6. setup agent 默认使用 4.6-opus-high-thinking，且不产生账单

---

## 为什么没有计费？

![Cursor Cloud Agent 账单页面，setup agent 的会话不计费，Billing 记录为空](/posts/exploit-cursor-cloud-agent/exploit-cursor-cloud-agent-billing.avif)

Cursor 的 setup agent 设计初衷是在用户首次配置开发环境时使用，模型成本由 Cursor 承担。用户通过不保存环境的方式，让这个临时会话持续运行，本质上是把 Cursor 的"客服"当成了自己的免费助手。

这和当年有人通过不断新建 Google Colab 笔记本绕过重置时间限制的思路类似，利用产品设计边界与实际使用场景的错位。

---

## 漏洞被修复了

几天内，Cursor 做了热修复。现在如果在 setup 阶段尝试任何 prompt injection，agent 会直接拒绝响应，不再处理后续指令。

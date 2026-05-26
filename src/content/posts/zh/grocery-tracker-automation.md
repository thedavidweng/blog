---
title: "Agent + Notion API 构建自动化杂货管理"
locale: zh
description: "我记忆力不好，会重复买东西，会忘记食物的保质期。我的解决方案是 Notion 数据库加自动化流水线"
publishedDate: 2026-05-08
tags:
  - Tools
  - Automation
draft: true
---

我记忆力不好。

具体表现：超市买完东西回来发现上周已经买过了，而且还没开封。或者收进柜子后直到过期都不再打开。

## 方案：Notion 杂货追踪器

一开始构想的方案是 Spreadsheet 或者 Obsidian Bases。最后还是回到 Notion Database，表格数据库该有的它都有，界面友好，Agent 友好，可以 0 成本免费简单的共享在网上。能简单[创建 API 密钥](https://www.notion.so/my-integrations)让 Agent 来调用。

我的分类大致是：

- 食品中文名 / 英文名
- 类别（乳制品 / 肉类 / 蔬菜类 / 水果类 / 冷冻类 / 主食类 / 零食类 / 饮料类 / 调味品 / 其他）
- 状态（未开封 / 已开封 / 已吃完）
- 购买地点（超市名）
- 购买日期 / 过期日期
- 价格 / 数量

![Notion 杂货追踪器数据库，按主食类筛选的视图](/posts/grocery-tracker-automation/notion-database.avif)

Notion AI 每个月都有免费的额度。你可以直接让 Notion AI 根据你的需求帮你创建一个模板，然后再接入 Agent。因为你用的 Agent 对 Notion 的了解可能没 Notion AI 那么好。

## 自动化一：Walmart 收据

我住在一家华超（大统华 T&T）旁边，但是买肉蛋奶还是会用 Walmart，便宜而且订阅会员后免费配送，价格同店内一样。网上购买的订单明细很清晰，想要自动化也很简单。

![Walmart 网上订单明细，包含商品图片、SKU、数量和价格](/posts/grocery-tracker-automation/walmart-order.avif)

我主用的 Agent 是 [Hermes Agent](https://github.com/nousresearch/hermes-agent)，但是随便一个用什么都可以，思路就是给收件箱里 Walmart 的设置邮件转发规则，发给专门为 Agent 配置的邮箱来处理。可以手动注册邮箱或者用专门的 Agent 邮箱服务，比如 [AgentMail](https://www.agentmail.to/) 或 [网易ClawEmail](https://claw.163.com/)，Agent 收到邮件就按规则处理。

## 自动化二：交易记录 CSV

Walmart 能覆盖大部分杂货，剩下的一些来自各个地方杂七杂八的杂货，收据是以实体形式存在的。

我管理收据用的是一个财务管理软件 [Monarch](https://monarch.com/referral/w4n85kvije?r_source=copy)，它的主要功能是管理银行卡和银行账户，会通过 [Plaid](https://plaid.com/) 一类的 API 自动从银行拉取我的交易记录。它有一个上传收据功能，可以是图片或 PDF，会识别并提取消费条目，与数据库中从银行导入的交易记录进行匹配。我平时所有的纸质收据都会拍照并上传到 Monarch 进行管理。

![Monarch 交易列表，显示 Walmart 和 T&T 超市的杂货消费记录](/posts/grocery-tracker-automation/monarch-transaction.avif)

这部分我目前只是半自动化，需要我定期手动登陆 Monarch，打开交易记录，在过滤器里选择正确的 Tag，然后快速导出 .csv 文件，然后交给 agent 执行。我知道有人做了 [Monarch 的非官方 API 项目](https://github.com/hammem/monarchmoney)，但我目前还没去实现。

![Monarch 过滤器界面，选择 Groceries 类别和 Receipt Import 标签](/posts/grocery-tracker-automation/monarch-filter.avif)

如果你不用财务管理软件，把收据拍下来直接发给 agent 用视觉模型识别处理效果也是完全一样的。

---
title: "Getting Cursor 4.6-opus-high-thinking for Free (A $600 Bug)"
locale: en
slug: "exploit-cursor-cloud-agent"
description: "Last month I found a bug that let you use Cursor's 4.6-opus-high-thinking model for free, indefinitely. It got patched within a week — but the implications are worth thinking about."
publishedDate: 2026-05-02
tags:
  - Tools
  - Thoughts
draft: false
---

Last month I found a bug.

Cursor's Cloud Agent mode lets you connect your GitHub account and pull repos. If you skip clicking **"Save environment"** during the setup phase, you can keep chatting with the setup agent — which runs on 4.6-opus-high-thinking — indefinitely.

Two caveats: no file attachments (images aside), and skills need to be manually pasted into the chat.

I ran it for hours. The setup agent session never generated any billing.

![Cursor Cloud Agent running for several hours — Usage page showing claude-4.6-opus-high-thinking cost as Included](/posts/exploit-cursor-cloud-agent/exploit-cursor-cloud-agent-usage.avif)

The hole got patched about a week later. Prompt injection attempts in the setup phase now get an immediate refusal.

---

## The Full Exploit (For Reference)

1. Open Cursor, enter Cloud Agent mode
2. Connect your GitHub account, authorize repo access
3. During the setup environment phase, pick a base environment config
4. **Critical step**: when the agent starts initializing, **do NOT click "Save environment"**
5. Start chatting directly — you're now in a setup agent session, not a regular Agent session
6. The setup agent uses 4.6-opus-high-thinking by default, and generates no billing

---

## Why Was There No Billing?

![Cursor Cloud Agent Billing page — setup agent session not billed, no billing records](/posts/exploit-cursor-cloud-agent/exploit-cursor-cloud-agent-billing.avif)

Cursor's setup agent is designed for first-time environment configuration — the model cost is covered by Cursor as part of the onboarding experience. By not saving the environment, you keep that temporary session alive indefinitely. You're essentially using Cursor's "customer support" as your own free assistant.

This is similar to the old trick of repeatedly creating new Google Colab notebooks to bypass the reset timer — exploiting the gap between a product's intended design and its actual behavior.

---

## It Got Patched

About a week later, Cursor pushed a hotfix. Now any prompt injection attempt during setup gets an immediate refusal — the agent stops processing.

The security team's response time was solid.

---

## Some Thoughts

The exploit was technically unsophisticated — no zero-days, no reverse engineering, just careful observation of product logic and boundary testing.

It raises a few questions:

- **Should AI products absorb setup/onboarding model costs?** Many users probably first experience a high-parameter model's power during onboarding, then convert to paid. If you charge from day one, that conversion funnel disappears.
- **Where exactly is the line between a "bug" and a "feature"?** From a UX perspective, this operation was fully within what the GUI allowed. From a business perspective, it was clearly revenue loss.
- **How robust are prompt injection defenses really?** Cursor patched setup-phase injection — but what about slow-burn sessions where a user gradually coaxes the model into "forgetting" billing logic? Is existing RLHF and system prompt filtering enough?

---

> The bug is fixed. If you're using Cursor, just subscribe — $20/month for a model that actually helps you work is genuinely good value.

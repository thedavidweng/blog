---
title: "Building an Automated Grocery Tracker with Agent + Notion API"
locale: en
slug: "grocery-tracker-automation"
description: "I have a bad memory. I buy the same things twice and forget expiration dates. My solution: a Notion database with an automation pipeline."
publishedDate: 2026-05-08
tags:
  - Tools
  - Automation
draft: true
---

I have a bad memory.

Specifically: I go to the supermarket, come home, and discover I already bought the same thing last week — still unopened. Or I put something away and don't open it again until it's expired.

## The Setup: Notion Grocery Tracker

My initial idea was a Spreadsheet or Obsidian Bases. I ultimately went back to Notion Database — it has everything a tabular database needs, a friendly UI, Agent-friendly, and can be shared online for free with zero cost. You can easily [create an API key](https://www.notion.so/my-integrations) for an Agent to call.

My categories roughly look like:

- Chinese Name / English Name
- Category (Dairy / Meat / Vegetables / Fruit / Frozen / Staples / Snacks / Beverages / Condiments / Other)
- Status (Unopened / Opened / Finished)
- Purchase Location (store name)
- Purchase Date / Expiration Date
- Price / Quantity

![Notion grocery tracker database, filtered by Staples category](/posts/grocery-tracker-automation/notion-database.avif)

Notion AI has a free monthly quota. You can have Notion AI build a template for you based on your needs, then wire it up to an Agent — because the Agent you're using might not know Notion as well as Notion AI does.

## Automation One: Walmart Receipts

I live next to a Chinese supermarket (T&T), but I still buy meat, eggs, and dairy from Walmart — it's cheaper, and delivery is free with a membership, at the same price as in-store. Online order receipts are very clear, so automation is straightforward.

![Walmart online order detail, showing product images, SKUs, quantities, and prices](/posts/grocery-tracker-automation/walmart-order.avif)

My primary Agent is [Hermes Agent](https://github.com/nousresearch/hermes-agent), but any Agent works — the idea is to set up an email forwarding rule in your inbox for Walmart shipping emails, routing them to a dedicated email address configured for the Agent to process. You can register an email manually or use a dedicated Agent email service like [AgentMail](https://www.agentmail.to/) or [NetEase ClawEmail](https://claw.163.com/). When the Agent receives an email, it processes it according to the rules.

## Automation Two: Transaction Records via CSV

Walmart covers most groceries, but the rest come from various places in small quantities, and those receipts are physical.

I manage receipts with a personal finance tool called [Monarch](https://monarch.com/referral/w4n85kvije?r_source=copy). Its main function is managing bank cards and accounts — it automatically pulls transaction records from my bank via APIs like [Plaid](https://plaid.com/). It has a receipt upload feature that accepts images or PDFs, recognizes and extracts line items, and matches them against transactions imported from the bank. I photograph all physical receipts and upload them to Monarch for management.

![Monarch transactions list, showing Walmart and T&T Supermarket grocery purchases](/posts/grocery-tracker-automation/monarch-transaction.avif)

This part is only semi-automated for now — I manually log into Monarch regularly, open the transactions, select the correct Tag in the filter, quickly export a .csv file, and then hand it off to an Agent to process. I know there's an [unofficial Monarch API project](https://github.com/hammem/monarchmoney), but I haven't implemented it yet.

![Monarch filter panel, selecting Groceries category and Receipt Import tag](/posts/grocery-tracker-automation/monarch-filter.avif)

If you don't use a personal finance tool, just taking a photo of your receipts and sending them to an Agent for visual model recognition and processing works just as well.

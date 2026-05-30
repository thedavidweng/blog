---
title: "US Financial Services: Canadian Number & VOIP Support"
locale: en
description: "A summary of which US financial services accept Canadian phone numbers or US VOIP numbers for verification."
publishedDate: 2026-05-27
tags:
  - Finance
draft: false
---

Most US financial services require a US phone number for verification. If you have a Canadian number or a US VOIP number like Google Voice, your mileage varies significantly.

Google Voice is a reliable proxy for US VOIP feasibility. If Google Voice works, other US VOIP services likely work too.

## Support Table

| Service | Canadian Number | Google Voice (US VOIP) | Notes |
|---|---|---|---|
| HSBC US | No | Yes | OTP delivered successfully |
| PayPal US | Yes | No | Canadian number addable via Live Chat; primary number requires agent intervention |
| Capital One | No | Yes | OTP delivered successfully |
| Chase | No | Yes | Standard verification works |
| BofA | No (SMS fails) | Yes | Canadian number can be added but SMS verification fails |

## Key Findings

**PayPal US** is the only service in this list that explicitly accommodates Canadian numbers. The catch: you cannot add a Canadian number through the standard UI. You must contact Live Chat and request an agent to set it as your primary number. This suggests PayPal's backend supports Canadian numbers, but the frontend intentionally blocks them.

**HSBC US, Capital One, Chase, and BofA** all accept Google Voice for OTP. This is useful if you have a US VOIP number but no Canadian number.

**BofA** is a partial failure case for Canadian numbers. The number can be added to the profile, but SMS verification fails, making it effectively unusable for 2FA or transaction alerts.

If you need a US financial account and only have a Canadian number, PayPal US is your best bet. For everything else, get a US VOIP number.

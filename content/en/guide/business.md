---
title: Business API
lead: For bulk messaging and notifications to past users, Bale has a separate API with a higher quota. baleropy supports it with one line.
---

## Why the Business API?

Regular bots are rate-limited: the sending allowance depends on **user interaction in private chats**. If you want to notify thousands of people or message outside an active conversation, the normal quota is not enough. The Business API has a separate, higher quota, but it is **paid**.

::: note Charge your account
First charge your business account in Bale's business panel. The cost of each message is deducted automatically from the credit.
:::

## Usage

```python
from baleropy import Bot

bot = Bot.business("YOUR_BOT_TOKEN")        # address: tapi.bale.ai/business/bot<TOKEN>/...

await bot.send_message(user_chat_id, "Hi! Tonight's special discount 🎁")
```

Everything else is like a regular bot: authentication, request format and response structure.

## Supported methods

| Method | What it does |
|---|---|
| `get_me` | bot info |
| `send_message` | text |
| `forward_message` | forward |
| `send_photo` | photo |
| `send_video` | video |
| `send_audio` | audio |
| `send_document` | file |

::: warn Limits
- `chat_id` works only for **private chats** (not groups).
- File-sending methods accept only a **`file_id`**; URLs and uploads are not supported. Upload the file with a regular bot first and take the `file_id`.
- Other methods (editing, groups, payments, ...) do not exist in the Business API.
:::

## A suggested pattern: broadcasting

```python
import asyncio
from baleropy import Bot
from baleropy.exceptions import BaleForbidden, BaleAPIError

async def broadcast(token: str, user_ids: list[int], text: str):
    ok = blocked = failed = 0
    async with Bot.business(token) as bot:
        for uid in user_ids:
            try:
                await bot.send_message(uid, text)
                ok += 1
            except BaleForbidden:
                blocked += 1                 # the user blocked the bot; remove them from the list
            except BaleAPIError:
                failed += 1
            await asyncio.sleep(0.05)        # no pressure; baleropy also handles 429
    return ok, blocked, failed
```

::: tip 429 is handled automatically
If you still hit a limit, baleropy [waits automatically](/guide/errors) and resends.
:::

## Combining a regular bot and Business

```python
chat_bot = Bot("TOKEN")                  # for conversations (polling)
news_bot = Bot.business("TOKEN")         # the same token, only for bulk notifications
```

You can use one token for both; only the `server` differs.

## Summary

- `Bot.business(token)` = the same API with a separate, paid quota.
- Seven methods; private chats only; files by `file_id` only.
- Next: [Helper utilities](/guide/utils).

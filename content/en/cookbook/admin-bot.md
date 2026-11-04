---
title: Group admin bot
lead: Welcome messages, ban and unban, pinning, deleting promotional links and warnings; all for admins only.
---

## What are we building?

| Command / event | What it does |
|---|---|
| a new member joins | a welcome message |
| `/ban` (reply) | remove and ban |
| `/unban` (reply) | unban |
| `/pin` (reply) | pin the message |
| `/warn` (reply) | a warning; 3 warnings = automatic ban |
| a message with a link from a regular member | deleted automatically |

::: warn Prerequisite
Add the bot to the group and make it an **admin** (delete-messages and ban rights). Without admin rights `ban` and `delete` fail.
:::

Concepts: [routers and Router-level filters](/guide/routers), `IsChatAdmin` ([filters reference](/reference/filters-ref)), [chat methods](/reference/methods-chats).

## The full code

```python title="admin_bot.py"
import asyncio
from collections import defaultdict

from baleropy import Bot, Dispatcher, F, Router
from baleropy.exceptions import BaleAPIError
from baleropy.filters import ChatTypeFilter, Command, IsChatAdmin
from baleropy.types import Message

TOKEN = "YOUR_BOT_TOKEN"
MAX_WARNS = 3

router = Router(name="admin")
router.message.filter(ChatTypeFilter("group", "supergroup"))        # groups only
warns: dict[tuple[int, int], int] = defaultdict(int)                # (chat, user) -> warning count


def target_of(message: Message):
    """The user of the replied-to message; otherwise None."""
    reply = message.reply_to_message
    return reply.from_user if reply and reply.from_user else None


# ── welcome ────────────────────────────────────────────────────────────────────
@router.message(F.new_chat_members)
async def welcome(message: Message):
    names = ", ".join(u.full_name for u in message.new_chat_members if not u.is_bot)
    if names:
        await message.answer(f"🌹 Welcome to the group, {names}!\nRead the rules in the pinned message.")


# ── admin commands (cheap filter first, IsChatAdmin last) ──────────────────────
@router.message(Command("ban"), IsChatAdmin())
async def ban(message: Message, bot: Bot):
    user = target_of(message)
    if user is None:
        return await message.reply("Reply to the user's message.")
    await bot.ban_chat_member(message.chat.id, user.id)
    await message.reply(f"🔨 {user.full_name} was banned.")


@router.message(Command("unban"), IsChatAdmin())
async def unban(message: Message, bot: Bot):
    user = target_of(message)
    if user is None:
        return await message.reply("Reply to the user's message.")
    await bot.unban_chat_member(message.chat.id, user.id, only_if_banned=True)
    await message.reply(f"🕊 {user.full_name} was unbanned.")


@router.message(Command("pin"), IsChatAdmin())
async def pin(message: Message):
    if message.reply_to_message is None:
        return await message.reply("Reply to the message you want to pin.")
    await message.reply_to_message.pin()
    await message.reply("📌 Pinned.")


@router.message(Command("warn"), IsChatAdmin())
async def warn(message: Message, bot: Bot):
    user = target_of(message)
    if user is None:
        return await message.reply("Reply to the user's message.")
    key = (message.chat.id, user.id)
    warns[key] += 1
    if warns[key] >= MAX_WARNS:
        await bot.ban_chat_member(message.chat.id, user.id)
        warns.pop(key)
        await message.answer(f"⛔ {user.full_name} was banned for {MAX_WARNS} warnings.")
    else:
        await message.answer(f"⚠️ Warning {warns[key]} of {MAX_WARNS} for {user.full_name}")


# ── auto-delete links from regular members ─────────────────────────────────────
@router.message(F.text.regexp(r"(https?://|t\.me/|ble\.ir/|www\.)"), ~IsChatAdmin())
async def delete_links(message: Message):
    try:
        await message.delete()
    except BaleAPIError:
        return                                   # the bot may not delete; ignore
    await message.answer(f"🚫 {message.from_user.full_name}, links are not allowed.")


dp = Dispatcher()
dp.include_router(router)

if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## Explaining the key parts

::: steps
1. **Router-level filter**: `router.message.filter(ChatTypeFilter(...))` means none of these handlers run in private chats.
2. **Filter order**: `Command("ban")` is cheap and comes first; `IsChatAdmin()` makes an API call and comes last.
3. **`~IsChatAdmin()`** in link deletion: regular members only; admins are free.
4. **`target_of`**: the target user comes from the replied-to message, so you do not type ids.
:::

::: tip Avoid extra calls
`IsChatAdmin` makes a `getChatMember` call for every message with a link. In busy groups cache the result for a few minutes (a dict with an expiry time).
:::

## Ideas to extend it

- Store warnings in a database.
- A banned-words filter.
- `/rules` that reads the rules from `get_chat(...).description`.
- Log admin actions to a channel.

Next: [Shop bot](/cookbook/shop-bot).

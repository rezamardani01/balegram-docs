---
title: Mandatory membership
lead: Make using the bot conditional on joining a channel or group, with a "I joined, check" button.
---

## What are we building?

Until the user joins your channel(s) they see only an "join first" message. Pressing **"I joined"** checks again.

::: warn Prerequisite
Make the bot an **admin** of the channel/group; otherwise `getChatMember` does not answer for users and `IsMember` is always false.
:::

Concepts: the [`IsMember`](/reference/filters-ref) filter, [middlewares](/guide/middlewares), [buttons](/guide/keyboards).

## Approach 1: the IsMember filter (simple)

```python title="members_only.py"
import asyncio

from baleropy import Bot, Dispatcher, F, Router
from baleropy.filters import CommandStart, IsMember
from baleropy.types import CallbackQuery, Message
from baleropy.utils import InlineKeyboardBuilder

TOKEN = "YOUR_BOT_TOKEN"
CHANNELS = ["@my_channel"]                      # or a numeric id

gate = Router(name="gate")                      # entrance: members only
public = Router(name="public")                  # the rest: "join first"


def join_markup():
    kb = InlineKeyboardBuilder()
    kb.button(text="📢 Join the channel", url="https://ble.ir/my_channel", style="primary")
    kb.button(text="✅ I joined, check", callback_data="check", style="success")
    return kb.adjust(1).as_markup()


# ── members: the bot works ─────────────────────────────────────────────────────
@gate.message(CommandStart(), IsMember(*CHANNELS))
async def start_member(message: Message):
    await message.answer("🎉 Welcome! Your membership is confirmed.\nUse the menu.")


@gate.message(F.text, IsMember(*CHANNELS))
async def main_feature(message: Message):
    await message.answer(f"You said: {message.text}")


# ── non-members: invite to join ────────────────────────────────────────────────
@public.message()
async def ask_to_join(message: Message):
    await message.answer("Join our channel first to use the bot 👇", reply_markup=join_markup())


@public.callback_query(F.data == "check", IsMember(*CHANNELS))
async def joined(query: CallbackQuery):
    await query.answer("Membership confirmed ✅")
    await query.message.edit_text("🎉 Great! You can use the bot now. /start")


@public.callback_query(F.data == "check")
async def not_joined(query: CallbackQuery):
    await query.answer("You have not joined yet ❌", show_alert=True)


dp = Dispatcher()
dp.include_routers(gate, public)                # gate first: members are handled before "public"

if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

### Why does it work?

- `gate` is registered first: if `IsMember` passes, its handler runs.
- Otherwise the message reaches `public` and shows "join first".
- `IsMember(*CHANNELS)` requires the sender to be a member of **all** the listed channels.

## Approach 2: a middleware (lock all handlers at once)

If you do not want a filter on every handler, write an inner middleware:

```python
from baleropy.dispatcher import BaseMiddleware
from baleropy.exceptions import BaleAPIError


class MembershipMiddleware(BaseMiddleware):
    def __init__(self, channels):
        self.channels = channels

    async def __call__(self, handler, event, data):
        user, bot = data.get("event_from_user"), data["bot"]
        if user is None:
            return await handler(event, data)

        for channel in self.channels:
            try:
                member = await bot.get_chat_member(channel, user.id)
            except BaleAPIError:
                continue                         # the channel/permissions have a problem; do not lock
            if not member.is_joined:
                if hasattr(event, "answer") and not hasattr(event, "data"):
                    await event.answer("Join the channel first 👇", reply_markup=join_markup())
                return None                      # the handler does not run
        return await handler(event, data)


dp.message.middleware(MembershipMiddleware(CHANNELS))
```

::: tip Cache it
Each message makes one `getChatMember` call. For busy bots keep the "is a member" result for 5 minutes in a dict.
:::

## Notes

::: note How is membership detected?
`member.is_joined` is true for `creator`, `administrator` and `member`, and for `restricted` it looks at `is_member`; a user who left or was banned is "not a member".
:::

::: warn Private channels
For a channel without a username use the numeric id and build the invite link with `export_chat_invite_link`.
:::

Next: [Deploying](/cookbook/deploy).

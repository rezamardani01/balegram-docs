---
title: Poll bot
lead: A live poll with inline buttons where the vote counters change instantly. Each person has one vote and can change their mind.
---

## What are we building?

`/poll question | option 1 | option 2 | option 3` creates a poll. With every vote only the message's **keyboard** is edited (`edit_reply_markup`).

Concepts: [keyboards](/guide/keyboards), [CallbackData](/guide/callback-data), [`edit_message_reply_markup`](/reference/methods-editing).

## The full code

```python title="poll_bot.py"
import asyncio
from collections import Counter
from dataclasses import dataclass, field

from baleropy import Bot, Dispatcher
from baleropy.filters import CallbackData, Command, CommandObject
from baleropy.types import CallbackQuery, Message
from baleropy.utils import InlineKeyboardBuilder

TOKEN = "YOUR_BOT_TOKEN"
dp = Dispatcher()


@dataclass
class Poll:
    title: str
    options: list[str]
    votes: dict[int, int] = field(default_factory=dict)      # user id -> option number


POLLS: dict[tuple[int, int], Poll] = {}                      # (chat, message) -> poll (use a database in practice)


class VoteCb(CallbackData, prefix="vote"):
    option: int


def keyboard(poll: Poll):
    counts = Counter(poll.votes.values())
    total = len(poll.votes) or 1
    kb = InlineKeyboardBuilder()
    for i, option in enumerate(poll.options):
        percent = round(counts[i] * 100 / total)
        kb.button(text=f"{option} — {counts[i]} ({percent}%)", callback_data=VoteCb(option=i), style="primary")
    kb.adjust(1)
    return kb.as_markup()


@dp.message(Command("poll"))
async def create(message: Message, command: CommandObject):
    parts = [p.strip() for p in (command.args or "").split("|") if p.strip()]
    if len(parts) < 3:
        await message.reply("Example:\n/poll Best season? | Spring | Summer | Autumn")
        return
    poll = Poll(title=parts[0], options=parts[1:9])           # at most 8 options
    sent = await message.answer(f"📊 {poll.title}", reply_markup=keyboard(poll))
    POLLS[(message.chat.id, sent.message_id)] = poll


@dp.callback_query(VoteCb.filter())
async def vote(query: CallbackQuery, callback_data: VoteCb):
    key = (query.message.chat.id, query.message.message_id)
    poll = POLLS.get(key)
    if poll is None:
        await query.answer("This poll is no longer active.", show_alert=True)
        return

    previous = poll.votes.get(query.from_user.id)
    if previous == callback_data.option:
        await query.answer("You already chose this 🙂")
        return

    poll.votes[query.from_user.id] = callback_data.option
    await query.message.edit_reply_markup(keyboard(poll))     # only the buttons change
    await query.answer("Vote saved ✅" if previous is None else "Vote changed 🔄")


if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## Notes

::: tip Why only the keyboard?
`edit_reply_markup` is lighter than `edit_text` and leaves the message text (and the poll title) alone. If you also want a results summary in the text, use `edit_text(new_text, reply_markup=...)`.
:::

::: warn The "not modified" error
If the new keyboard is exactly the same as the old one, Bale returns `400 message is not modified`. Here we avoid it by checking `previous == option`. In general catch it with `try/except BaleBadRequest`.
:::

::: danger Temporary memory
`POLLS` lives in memory and is wiped when the bot stops. For real polls use SQLite or Redis.
:::

## Ideas to extend it

- Anonymous voting or showing voter names.
- A "close poll" button only for the creator (`F.from_user.id == poll.creator`).
- A deadline with `asyncio.sleep` and automatic closing.
- Show results with bars: `"█" * count`.

Next: [Group admin bot](/cookbook/admin-bot).

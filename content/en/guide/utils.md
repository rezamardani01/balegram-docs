---
title: Helper utilities
lead: Deep links, Bale's Markdown formatting, splitting long text, the "typing…" indicator and building albums.
---

All of these live in `balegram.utils`:

```python
from balegram.utils import (
    bold, italic, link, split_text,
    bot_link, create_start_link, encode_payload, decode_payload,
    ChatActionSender, MediaGroupBuilder,
    InlineKeyboardBuilder, ReplyKeyboardBuilder,
)
```

## Text formatting (Bale Markdown)

Bale reads the text of all messages as **Markdown**:

| You want | Write | Result |
|---|---|---|
| **bold** | `**text**` | bold |
| *italic* | `__text__` | italic |
| link | `[label](https://...)` | a link |

::: warn Required spacing
Per the Bale docs, a **space** is needed before the opening and after the closing bold/italic marker, and in a link there must be no space between `]` and `(`.
:::

```python
from balegram.utils import bold, italic, link

text = f"Price: {bold('100k')} toman, {italic('free shipping')}. Details: {link('site', 'https://example.com')}"
await message.answer(text)
```

## Splitting long text: split_text

Bale accepts up to **4096 characters** per message. For longer text:

```python
from balegram.utils import split_text

for part in split_text(very_long_report):            # default 4096
    await message.answer(part)

split_text(text, limit=1000)                         # a custom ceiling
```

It cuts by priority: first at a newline, then a space, and only as a last resort in the middle of a word. Leading/trailing spaces of each chunk are removed.

## Deep links

A bot link in Bale: `https://ble.ir/<bot_username>?start=<parameter>`. When a user taps it the bot gets `/start <parameter>`; good for invite codes, campaigns and special flows.

```python
from balegram.utils import create_start_link, bot_link

link = await create_start_link(bot, "ref42")            # gets the bot name from getMe
# https://ble.ir/mybot?start=ref42

bot_link("mybot", "campaign 1")                          # no network call: ...?start=campaign%201
```

### An encoded parameter

For values with special or Persian characters, pass `encode=True` (URL-safe base64):

```python
link = await create_start_link(bot, "user=5&from=site", encode=True)
```

```python
@dp.message(CommandStart(deep_link=True, encoded=True))
async def start(message: Message, command: CommandObject):
    print(command.args)          # "user=5&from=site" (decoded)
```

| Function | What it does |
|---|---|
| `bot_link(username, payload=None, encode=False)` | build the link (sync) |
| `create_start_link(bot, payload=None, encode=False)` | the same via `getMe` (async) |
| `encode_payload(text)` / `decode_payload(text)` | URL-safe base64 |

## ChatActionSender: "typing…"

A long task? Keep the indicator alive until it finishes:

```python
from balegram.utils import ChatActionSender

@dp.message(Command("report"))
async def report(message: Message, bot: Bot):
    async with ChatActionSender.typing(bot, message.chat.id):
        result = await generate_big_report()          # 10 seconds
    await message.answer(result)
```

`sendChatAction` repeats every ~4 seconds and stops automatically when the block ends. Other modes:

| Constructor | Action |
|---|---|
| `ChatActionSender.typing` | typing |
| `.upload_photo` | sending a photo |
| `.upload_video` | sending a video |
| `.record_voice` | recording a voice |
| `.upload_voice` | sending a voice |

For one-shot: `await message.answer_chat_action(ChatAction.TYPING)`.

## MediaGroupBuilder

```python
from balegram.utils import MediaGroupBuilder

album = MediaGroupBuilder(caption="Holiday")
album.add_photo(FSInputFile("1.jpg")).add_photo("file_id").add_video("video_id")
await bot.send_media_group(chat_id, album.build())
```

Methods: `add_photo`, `add_video`, `add_animation`, `add_audio`, `add_document`. At least 2 and at most 10 items.

## Keyboard builders

Fully explained in the lesson [Keyboards & colored buttons](/guide/keyboards): `InlineKeyboardBuilder`, `ReplyKeyboardBuilder`.

## Full example: an invite link with a reward

```python
@dp.message(Command("invite"))
async def invite(message: Message, bot: Bot):
    url = await create_start_link(bot, f"ref{message.from_user.id}")
    await message.answer(f"Invite your friends:\n{url}")


@dp.message(CommandStart(deep_link=True))
async def start_with_ref(message: Message, command: CommandObject):
    inviter = command.args.removeprefix("ref")
    await give_bonus(int(inviter))
    await message.answer("Welcome! Your inviter earned points 🎁")
```

## Summary

- Bale Markdown: `**bold**`, `__italic__`, `[link](url)`.
- `split_text` for long text; `ChatActionSender` for slow work.
- `create_start_link` for deep links.
- Next: [Testing your bot](/guide/testing).

---
title: Keyboards & colored buttons
lead: Create inline and reply buttons with explicit nested rows and a simple Telethon-style API.
---

## Two kinds of keyboards

| Kind | Where is it shown? | What happens on tap? |
|---|---|---|
| **Inline** (`InlineKeyboardMarkup`) | **under the message** | a `callback_query` arrives (or a link opens) |
| **Reply** (`ReplyKeyboardMarkup`) | **in place of the phone keyboard** | the button text is sent as an ordinary message |

## An inline button

```python
from baleropy import Button, F
from baleropy.filters import Command
from baleropy.types import CallbackQuery, Message


@dp.message(Command("menu"))
async def menu(message: Message):
    buttons = [
        [Button.inline("👍 Like", "like"), Button.url("🌐 Website", "https://ble.ir")],
    ]
    await message.answer("What do you think?", buttons=buttons)


@dp.callback_query(F.data == "like")
async def like(query: CallbackQuery):
    await query.answer("Thanks ❤️")
```

Use `Button.inline` for callback buttons and `Button.url` for links. Each inline button has one action:
send `callback_data`, open a `url` or `web_app`, or copy `copy_text`.

| Factory | Use |
|---|---|
| `Button.inline(text, data)` | callback button; `data` can be a string or [CallbackData](/guide/callback-data) object |
| `Button.url(text, url)` | link button |
| `Button.web_app(text, url)` | mini-app button |
| `Button.copy_text(text, value)` | copy text |
| `Button.text(text, ...)` | reply-keyboard button |
| `style=` | button color; see the colored-buttons section |

## Arrange rows

Pass nested lists to define rows; each inner list is one row. A flat list creates a single row:

```python
buttons = [
    [Button.inline("Yes", "yes"), Button.inline("No", "no")],  # row 1: 2 buttons
    [Button.inline("Later", "later")],                        # row 2: 1 button
]
await message.answer("Choose:", buttons=buttons)
```

For dynamically generated buttons, `InlineKeyboardBuilder` and `ReplyKeyboardBuilder` remain available; use `adjust(1)` to put one button on each row. Builders continue to work with `reply_markup=builder.as_markup()`.
Both approaches work with `message.answer()`, `message.reply()`, and `bot.send_message()`; do not pass `buttons` and `reply_markup` together.

::: note Limits
At most 8 buttons per row and 100 in total. More raises `ValueError`.
:::

## 🎨 Colored buttons

Bale added colored buttons in its beta. You set the color with the `style` parameter:

| `style` | Color |
|---|---|
| `"success"` or `ButtonStyle.SUCCESS` | 🟢 green |
| `"danger"` or `ButtonStyle.DANGER` | 🔴 red |
| `"primary"` or `ButtonStyle.PRIMARY` | 🔵 blue |
| *(no style)* | the normal look |

```python
from baleropy.utils import InlineKeyboardBuilder
from baleropy.types import ButtonStyle

kb = InlineKeyboardBuilder()
kb.button(text="Accept ✅", callback_data="ok",   style=ButtonStyle.SUCCESS)
kb.button(text="Delete 🗑", callback_data="del",  style=ButtonStyle.DANGER)
kb.button(text="Next",     callback_data="next", style="primary")      # a string works too
kb.button(text="Plain",    callback_data="plain")
kb.adjust(2, 2)
await message.answer("Choose:", reply_markup=kb.as_markup())
```

Click the buttons below to get the feel (a simulator demo):

::: widget buttons
:::

::: warn Old clients
Only new Bale versions show the color. Older versions ignore `style` and show a plain button, so **do not rely on color alone** to convey meaning (add text or an emoji). Color on reply keyboards is not confirmed yet.
:::

::: tip Which color where?
Green for confirmation and positive actions, red for deletion and dangerous actions, blue for continue and the main option.
:::

## Reply keyboards

```python
from baleropy import Button
from baleropy.types import ReplyKeyboardRemove


@dp.message(Command("share"))
async def share(message: Message):
    buttons = [
        [Button.text("📞 Send my number", request_contact=True)],
        [Button.text("📍 Send my location", request_location=True)],
        [Button.text("❌ Close")],
    ]
    await message.answer("Choose one:", buttons=buttons)


@dp.message(F.text == "❌ Close")
async def close(message: Message):
    await message.answer("Closed", reply_markup=ReplyKeyboardRemove())    # remove the keyboard


@dp.message(F.contact)
async def got_contact(message: Message):
    await message.answer(f"Your number: {message.contact.phone_number}")


@dp.message(F.location)
async def got_location(message: Message):
    await message.answer(f"📍 {message.location.latitude}, {message.location.longitude}")
```

| `Button.text()` option | What it does |
|---|---|
| `text` | the label (sent as the message when tapped) |
| `request_contact=True` | ask for the user's contact |
| `request_location=True` | ask for the location |
| `web_app` | open a mini app |
| `style` | color (unconfirmed for reply) |

## Editing buttons after sending

Use `edit_reply_markup` to change only the keyboard (for example a poll counter):

```python
@dp.callback_query(F.data == "vote")
async def vote(query: CallbackQuery):
    counts["yes"] += 1
    kb = InlineKeyboardBuilder().button(text=f"👍 ({counts['yes']})", callback_data="vote")
    await query.message.edit_reply_markup(kb.as_markup())
    await query.answer("Vote saved")
```

Or text and keyboard together: `await query.message.edit_text("New text", reply_markup=kb.as_markup())`.

::: tip The "message not modified" error
If the new text and keyboard are exactly the same as before, Bale answers `400 Bad Request`. Ignore it with `try/except BaleBadRequest`.
:::

## Copy text with one tap

```python
kb.button(text="Copy discount code", copy_text="OFF2025")
```

## Full example: a colored counter

```python
def counter_kb(n: int):
    kb = InlineKeyboardBuilder()
    kb.button(text="➖", callback_data=f"c:{n - 1}", style="danger")
    kb.button(text=str(n), callback_data="noop")
    kb.button(text="➕", callback_data=f"c:{n + 1}", style="success")
    return kb.as_markup()


@dp.message(Command("counter"))
async def counter(message: Message):
    await message.answer("Counter", reply_markup=counter_kb(0))


@dp.callback_query(F.data.startswith("c:"))
async def change(query: CallbackQuery):
    n = int(query.data.split(":")[1])
    await query.message.edit_reply_markup(counter_kb(n))
    await query.answer()


@dp.callback_query(F.data == "noop")
async def noop(query: CallbackQuery):
    await query.answer()
```

## Summary

- Inline under the message (callback), reply in place of the keyboard (text).
- Use `Button.inline(...)` for inline buttons and `Button.text(...)` for reply keyboards.
- Each inner list in `buttons=[...]` is one row.
- `InlineKeyboardBuilder().button(...).adjust(...).as_markup()`.
- `style="success" | "danger" | "primary"` for color.
- Next: [CallbackData](/guide/callback-data).

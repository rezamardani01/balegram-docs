---
title: Keyboards & colored buttons
lead: Inline buttons under a message, reply keyboards and green, red and blue colored buttons; with simple builders.
---

## Two kinds of keyboards

| Kind | Where is it shown? | What happens on tap? |
|---|---|---|
| **Inline** (`InlineKeyboardMarkup`) | **under the message** | a `callback_query` arrives (or a link opens) |
| **Reply** (`ReplyKeyboardMarkup`) | **in place of the phone keyboard** | the button text is sent as an ordinary message |

## An inline button

```python
from balegram import F
from balegram.filters import Command
from balegram.types import CallbackQuery, Message
from balegram.utils import InlineKeyboardBuilder


@dp.message(Command("menu"))
async def menu(message: Message):
    kb = InlineKeyboardBuilder()
    kb.button(text="👍 Like", callback_data="like")
    kb.button(text="🌐 Website", url="https://ble.ir")
    await message.answer("What do you think?", reply_markup=kb.as_markup())


@dp.callback_query(F.data == "like")
async def like(query: CallbackQuery):
    await query.answer("Thanks ❤️")
```

Each button has **only one** of: `callback_data`, `url`, `web_app` or `copy_text`.

| `button()` parameter | What it does |
|---|---|
| `text` | the label on the button |
| `callback_data` | a 1 to 64 byte string (or a [CallbackData](/guide/callback-data) object) |
| `url` | open a link |
| `web_app` | open a mini app (HTTPS address) |
| `copy_text` | copy text to the user's clipboard (1 to 256 characters) |
| `style` | the button color; see below |

## Layout: adjust, row, add

`button()` appends buttons one after another; `adjust` sets the layout:

```python
kb = InlineKeyboardBuilder()
for i in range(1, 8):
    kb.button(text=str(i), callback_data=f"n:{i}")

kb.adjust(3, 2)                  # first row 3 buttons, second 2, the rest 2 each
kb.adjust(3, 2, repeat=True)     # repeat the pattern: 3,2,3,2,...
```

```text
adjust(3, 2):          [1][2][3]
                       [4][5]
                       [6][7]
```

| Method | What it does |
|---|---|
| `adjust(*sizes, repeat=False)` | re-flow all buttons |
| `row(*buttons, width=8)` | a new row from ready-made buttons |
| `add(*buttons)` | append to the last row |
| `attach(other_builder)` | append the rows of another builder |
| `copy()` | an independent copy |
| `from_markup(markup)` | start from an existing keyboard (e.g. `message.reply_markup`) |
| `as_markup()` | build the final keyboard for `reply_markup` |

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
from balegram.types import ButtonStyle

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
from balegram.types import ReplyKeyboardRemove
from balegram.utils import ReplyKeyboardBuilder


@dp.message(Command("share"))
async def share(message: Message):
    kb = ReplyKeyboardBuilder()
    kb.button(text="📞 Send my number", request_contact=True)
    kb.button(text="📍 Send my location", request_location=True)
    kb.button(text="❌ Close")
    kb.adjust(2, 1)
    await message.answer("Choose one:", reply_markup=kb.as_markup())


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

| `ReplyKeyboardBuilder.button()` parameter | What it does |
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
- `InlineKeyboardBuilder().button(...).adjust(...).as_markup()`.
- `style="success" | "danger" | "primary"` for color.
- Next: [CallbackData](/guide/callback-data).

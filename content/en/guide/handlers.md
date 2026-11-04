---
title: Handlers & events
lead: A handler is a function that answers an event. Learn how to register it, which arguments it receives and what it returns.
---

## Registering a handler

There are three equivalent ways:

```python
from balegram import Dispatcher
from balegram.types import Message

dp = Dispatcher()

# 1) decorator (most common)
@dp.message()
async def a(message: Message):
    ...

# 2) register: when the function is defined elsewhere
async def b(message: Message): ...
dp.message.register(b)

# 3) with a filter
dp.message.register(b, F.text == "hello")
```

All observers (`message`, `edited_message`, `callback_query`, `pre_checkout_query`, `error`) work the same way.

## Message handlers

```python title="handlers.py"
from balegram import F
from balegram.filters import Command
from balegram.types import Message


@dp.message(Command("ping"))
async def ping(message: Message):
    await message.answer("pong 🏓")


@dp.message(F.photo)
async def photo(message: Message):
    await message.reply("Nice picture!")


@dp.message(F.text.lower() == "hello")
async def hello(message: Message):
    await message.reply("Hello to you too 🌹")
```

## Edited-message handlers

When a user edits a message, an `edited_message` event arrives:

```python
@dp.edited_message(F.text)
async def edited(message: Message):
    await message.reply(f"You edited it: {message.text}")
```

## Button (callback) handlers

When a user presses an inline button, a `callback_query` arrives. Always call `answer()` on it, otherwise the button stays in a "waiting" state:

```python
from balegram.types import CallbackQuery

@dp.callback_query(F.data == "like")
async def like(query: CallbackQuery):
    await query.answer("Thanks ❤️")                    # ends the waiting state + a short toast
    await query.message.edit_text("Liked!")          # edit the message that holds the button
```

::: note Old Bale clients
Very old Bale clients do not support `answerCallbackQuery` (their callback id starts with `1`). The library's `query.answer()` detects this and silently skips.
:::

## Error handlers

```python
from balegram.dispatcher import ErrorEvent

@dp.error()
async def on_error(event: ErrorEvent, exception: Exception):
    print("error:", exception)
    return True            # the error is handled (not raised again)
```

Details in the lesson [Errors & rate limits](/guide/errors).

## Handler arguments

A handler receives **only the arguments you declare**. The event (for example `message`) is the first one and the rest are injected by name:

```python
@dp.message(Command("me"))
async def me(message: Message, bot: Bot, event_from_user, state: FSMContext):
    ...
```

The full list is in [Dependency injection](/guide/dependency-injection).

## Return value

A handler usually returns nothing. But `feed_update` returns the handler's return value, which is handy for [testing](/guide/testing).

## Can handlers be sync?

Yes; a plain function (without `async`) runs in a separate thread so the bot does not freeze. Still, sending messages needs `await`, so in practice handlers are `async`.

## Skipping a handler: SkipHandler

If halfway through you realize this handler is not the right one, raise `SkipHandler` and the next matching handler runs:

```python
from balegram.exceptions import SkipHandler

@dp.message(F.text)
async def maybe(message: Message):
    if not await is_vip(message.from_user.id):
        raise SkipHandler          # go to the next handler
    await message.answer("Welcome, VIP 👑")
```

## Summary

- Register with `@router.message(...)`, `@router.callback_query(...)`, ...
- The first matching handler runs.
- Arguments are injected by name.
- Next: [Routers](/guide/routers).

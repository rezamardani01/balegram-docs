---
title: Custom filters
lead: When F and the built-in filters are not enough, write your own: with a class, or even a plain function.
---

## The simplest way: a function

Any function that returns `True`/`False` (or a `dict`) is a filter. It may be `async`:

```python
def is_long(message) -> bool:
    return len(message.text or "") > 100

@dp.message(is_long)
async def long_text(message: Message):
    await message.answer("That was a long one!")

# a lambda works too
@dp.message(lambda m: m.text and m.text.isdigit())
async def digits(message: Message): ...
```

Like a handler, a filter function receives **the arguments it declares** (the event is the first one):

```python
async def is_admin(message, bot, event_from_user) -> bool:
    member = await bot.get_chat_member(message.chat.id, event_from_user.id)
    return member.is_admin
```

## A filter as a class

For a filter with parameters or internal state, inherit from `Filter`:

```python title="filters.py"
from typing import Any
from balegram.filters import Filter


class MinLength(Filter):
    def __init__(self, n: int):
        self.n = n

    async def __call__(self, event: Any, **data: Any) -> bool:
        text = getattr(event, "text", None) or ""
        return len(text) >= self.n
```

```python
@dp.message(MinLength(50))
async def long(message: Message): ...
```

`Filter` gives you `&` `|` `~` for free:

```python
@dp.message(MinLength(10) & ~Command("start"))
```

## A filter that provides data

If you return a `dict`, its keys reach the handler as arguments, like `Command` provides `command`:

```python
class ExtractNumbers(Filter):
    async def __call__(self, event, **data):
        import re
        numbers = [int(n) for n in re.findall(r"\d+", getattr(event, "text", "") or "")]
        return {"numbers": numbers} if numbers else False     # False = reject


@dp.message(ExtractNumbers())
async def total(message: Message, numbers: list[int]):
    await message.answer(f"Total: {sum(numbers)}")
```

## A filter with database or Bot access

A filter gets the data arguments just like a handler (`bot`, `state`, values passed to `Dispatcher(...)`, ...):

```python
class IsPremium(Filter):
    async def __call__(self, event, db, event_from_user=None, **kw):
        # db exists when you create: Dispatcher(db=my_db)
        user = await db.get_user(event_from_user.id)
        return {"user": user} if user and user.premium else False


@dp.message(Command("vip"), IsPremium())
async def vip(message: Message, user):
    await message.answer(f"Hi {user.name}, welcome 👑")
```

## Notes and traps

::: warn A filter must not be slow
Filters run for **every** message that reaches the handler. Put heavy work (database queries, APIs) after the cheap filters.
:::

::: tip Guard against None
`event` may be a `Message`, `CallbackQuery` and so on. Use `getattr(event, "text", None)` or `isinstance` to make sure it is the right kind.
:::

## Register a filter for all handlers of a Router

```python
router.message.filter(MinLength(3))          # all message handlers of this Router
```

## Full example: a "working hours" filter

```python
from datetime import datetime, time as dtime

class WorkingHours(Filter):
    def __init__(self, start=dtime(9), end=dtime(17)):
        self.start, self.end = start, end

    async def __call__(self, event, **data) -> bool:
        return self.start <= datetime.now().time() <= self.end


@dp.message(Command("support"), WorkingHours())
async def support(message: Message):
    await message.answer("Support is online, send your message.")

@dp.message(Command("support"))
async def closed(message: Message):
    await message.answer("🕘 Working hours are 9 to 17.")
```

## Summary

- A plain function or a `Filter` class.
- Return a `dict` to hand data to the handler.
- Keep it fast and put cheap ones first.
- Next: [Middlewares](/guide/middlewares).

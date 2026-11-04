---
title: Middlewares
lead: A middleware is code wrapped around handlers: it runs before and after them, adds data or stops the event.
---

## What is a middleware?

Suppose you want to log the processing time of **all** messages, or load users from a database. Instead of repeating that in every handler, you write one **middleware**:

```python title="middlewares.py"
import time
from baleropy.dispatcher import BaseMiddleware


class TimingMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data):
        start = time.perf_counter()
        result = await handler(event, data)        # ← run the rest of the chain (filters/handler)
        ms = (time.perf_counter() - start) * 1000
        print(f"handled in {ms:.1f} ms")
        return result
```

Three arguments:

| Argument | Meaning |
|---|---|
| `handler` | The rest of the chain. Call `await handler(event, data)` to continue. |
| `event` | The event (`Message`, `CallbackQuery`, or for update-level middlewares: `Update`). |
| `data` | The shared dict; whatever you add reaches the handler as an argument. |

## Registering a middleware

```python
dp.message.outer_middleware(TimingMiddleware())     # for every message
dp.update.outer_middleware(TimingMiddleware())      # for every update (any event type)
router.message.middleware(MyInner())                # inner: after a handler was chosen
```

A middleware may be a **class** (inheriting `BaseMiddleware`) or a **function**:

```python
@dp.message.outer_middleware
async def log_it(handler, event, data):
    print("message from", event.from_user.id)
    return await handler(event, data)
```

## Outer vs Inner

| | Outer | Inner |
|---|---|---|
| Register | `observer.outer_middleware` | `observer.middleware` |
| When does it run? | For **every** event, **before** filters | **Only when** a handler was chosen (filters passed) |
| Use for | logging, stats, throttling, building shared `data` | opening a DB session, precise handler timing |
| Order | outside-in, in registration order | parents before children |

The full order for one message:

```text
update outer  →  router outer  →  [filters]  →  inner  →  handler
```

::: tip How to choose
If the middleware must run even for messages with no handler (stats, logging) → **outer**. If it is only needed for real handlers and is costly (database) → **inner**.
:::

## Adding data for handlers

Whatever you put in `data` the handler receives by that name:

```python
class DbMiddleware(BaseMiddleware):
    def __init__(self, pool):
        self.pool = pool

    async def __call__(self, handler, event, data):
        async with self.pool.acquire() as conn:
            data["db"] = conn
            return await handler(event, data)     # the connection closes when leaving `with`


dp.message.middleware(DbMiddleware(pool))

@dp.message(Command("me"))
async def me(message: Message, db):               # db arrives here
    row = await db.fetchrow("SELECT ...")
```

## Stopping the event

Do not call `handler`, or raise `CancelHandler`:

```python
from baleropy.exceptions import CancelHandler

class BanMiddleware(BaseMiddleware):
    def __init__(self, banned: set[int]):
        self.banned = banned

    async def __call__(self, handler, event, data):
        user = data.get("event_from_user")
        if user and user.id in self.banned:
            raise CancelHandler              # this user is banned: no handler runs
        return await handler(event, data)
```

## Built-in middlewares

| Middleware | What it does |
|---|---|
| `LoggingMiddleware(level)` | Logs every event with its processing time |
| `ThrottlingMiddleware(rate, on_throttled)` | One event per user per `rate` seconds; the rest are dropped |
| `CallbackAnswerMiddleware(text, show_alert)` | Auto-answers a `callback_query` if the handler did not |

```python
from baleropy.dispatcher.middlewares import (
    LoggingMiddleware, ThrottlingMiddleware, CallbackAnswerMiddleware,
)

async def slow_down(event, data):
    await event.answer("🐢 Slow down!")

dp.message.outer_middleware(LoggingMiddleware())
dp.message.outer_middleware(ThrottlingMiddleware(rate=0.7, on_throttled=slow_down))
dp.callback_query.outer_middleware(CallbackAnswerMiddleware())
```

::: note Throttling warns only once
`on_throttled` is called only the **first time** in each window, so the bot does not spam by itself.
:::

## flags: labels on handlers

You can put labels (flags) on a handler when registering and read them in a middleware:

```python
from baleropy.dispatcher import get_flag

@dp.message(Command("buy"), rate_limit=5)        # every extra keyword = a flag
async def buy(message: Message): ...

class RateMw(BaseMiddleware):
    async def __call__(self, handler, event, data):
        seconds = get_flag(data, "rate_limit", default=1)
        ...
        return await handler(event, data)

dp.message.middleware(RateMw())                  # must be inner: it knows the chosen handler
```

## Middlewares for outgoing requests

The **Session** has middlewares too; they wrap every request to the Bale server (for logging or counting):

```python
@bot.session.middleware
async def count_calls(make_request, bot, method):
    print("→", method.__api_method__)
    return await make_request(bot, method)
```

## Full example: usage stats

```python
from collections import Counter

class StatsMiddleware(BaseMiddleware):
    def __init__(self):
        self.commands = Counter()

    async def __call__(self, handler, event, data):
        text = getattr(event, "text", None)
        if text and text.startswith("/"):
            self.commands[text.split()[0]] += 1
        return await handler(event, data)


stats = StatsMiddleware()
dp.message.outer_middleware(stats)

@dp.message(Command("stats"))
async def show(message: Message):
    lines = [f"{c}: {n}" for c, n in stats.commands.most_common(5)]
    await message.answer("Most used commands:\n" + "\n".join(lines))
```

## Summary

- A middleware = `async def (handler, event, data)`; call `await handler(event, data)`.
- Outer runs before filtering, inner after a handler is chosen.
- Fill `data` to reach the handler; `CancelHandler` to stop.
- Next: [Dependency injection](/guide/dependency-injection).

---
title: Concepts & architecture
lead: Before the details, learn the big picture: Bot, Dispatcher, Router, handlers and the journey of an update.
---

## async in one minute

balegram is **asynchronous (async)**. While the bot waits for the network (for example, sending a message) Python can do other work, so one bot can serve thousands of users at once. You only need two rules:

1. Functions that talk to the network are `async def`.
2. Wherever you need the result of an async call, put `await` in front.

```python
async def handler(message):
    await message.answer("Hello")     # right: await
    # message.answer("Hello")         # wrong: without await nothing is sent!
```

::: warn Do not block
Code like `time.sleep(5)` or `requests.get(...)` freezes the whole bot. Use `await asyncio.sleep(5)` and async libraries (such as `aiohttp`) instead.
:::

## The main actors

| Actor | Role |
|---|---|
| **Bot** | Talks to the Bale server: all methods (`send_message`, ...) live on it. |
| **Dispatcher** | The root of the router tree. Receives updates and runs the bot (polling/webhook). |
| **Router** | A group of handlers. It can contain other routers. |
| **Handler** | Your function that answers an event. |
| **Filter** | The condition for a handler (what is the text? is it a command? which state?). |
| **Middleware** | Code wrapped around handlers (logging, stats, database, rate limiting). |
| **FSM** | The conversation's memory: which step is the user in right now? |

## The journey of a message

Play the animation or click a step:

::: widget flow
:::

## Event types

Every event has an "observer" on the Router that you use as a decorator:

| Observer | When? | Handler input |
|---|---|---|
| `router.message` | A new message | `Message` |
| `router.edited_message` | A message was edited | `Message` |
| `router.callback_query` | An inline button was pressed | `CallbackQuery` |
| `router.pre_checkout_query` | Final payment confirmation | `PreCheckoutQuery` |
| `router.error` | An error in a handler | `ErrorEvent` |

::: tip Startup and shutdown
`@dp.on_startup` and `@dp.on_shutdown` run a function when the bot starts and stops; ideal for connecting to a database.
:::

## "The first matching handler wins"

For each event balegram checks handlers in registration order. The first one whose **filters all pass** runs and the rest are ignored. Play with it (you can change the message type too):

::: widget playground
:::

::: note What if no handler matches?
The event is silently ignored (`feed_update` returns `UNHANDLED`). To see such messages, add a catch-all handler at the **end** of your bot.
:::

## Suggested project layout

```text
my_bot/
├── bot.py              # create Bot and Dispatcher, run
├── config.py           # token and settings
├── middlewares.py      # your middlewares
├── filters.py          # custom filters
├── states.py           # StatesGroup classes
└── handlers/
    ├── __init__.py
    ├── start.py        # router = Router(); /start and menu
    ├── shop.py         # router = Router(); shop
    └── admin.py        # router = Router(); admin commands
```

```python title="bot.py"
from handlers import start, shop, admin

dp = Dispatcher()
dp.include_routers(start.router, shop.router, admin.router)
```

The next lesson is exactly about handlers and events: [Handlers & events](/guide/handlers).

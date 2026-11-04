---
title: Routers
lead: Routers split your bot into small independent modules; each one has its own handlers, filters and middlewares.
---

## Why Router?

As a bot grows, keeping every handler in one file becomes painful. A `Router` lets you write each feature in its own file and plug them together at the end. In fact, the `Dispatcher` is a Router too (the root of the tree).

## Create and attach

```python title="handlers/shop.py"
from baleropy import F, Router
from baleropy.filters import Command
from baleropy.types import Message

router = Router(name="shop")


@router.message(Command("buy"))
async def buy(message: Message):
    await message.answer("What do you want to buy? 🛍️")
```

```python title="handlers/admin.py"
from baleropy import Router
from baleropy.filters import Command
from baleropy.types import Message

router = Router(name="admin")


@router.message(Command("stats"))
async def stats(message: Message):
    await message.answer("Stats: ...")
```

```python title="bot.py"
from baleropy import Bot, Dispatcher
from handlers import shop, admin

dp = Dispatcher()
dp.include_routers(shop.router, admin.router)      # or include_router for one
```

## Processing order

For an event, the **Router's own handlers** are checked first, then its **sub-routers** in `include` order. The first matching handler wins:

```text
Dispatcher
├── dp's own handlers      ← first
├── shop.router            ← then
│   └── cart.router        ← (sub-router of shop)
└── admin.router           ← last
```

::: tip Simple rule
Put **generic** handlers (like "any text") in the **last** Router so they do not shadow more specific handlers.
:::

## Nested routers

```python
cart = Router(name="cart")
shop.router.include_router(cart)       # cart inside shop
```

baleropy prevents structural mistakes: a Router cannot be attached twice and cycles (a router inside itself) are forbidden:

```python
dp.include_router(shop.router)
dp.include_router(shop.router)         # RuntimeError: already attached
shop.router.include_router(dp)         # RuntimeError: circular
```

## Router-level filters

If every handler of a Router shares a condition, add the filter once:

```python
from baleropy.filters import ChatTypeFilter

admin = Router(name="admin")
admin.message.filter(ChatTypeFilter("group", "supergroup"))   # groups only

@admin.message(Command("ban"))      # no need to repeat the filter
async def ban(message: Message): ...
```

::: warn Mind the cost
A Router-level filter runs for **every** message. Put filters that call the API (like `IsChatAdmin`) on the handler itself, not on the Router.
:::

## Router-level middlewares

```python
router.message.middleware(my_inner_mw)         # only when a handler of this Router was chosen
router.message.outer_middleware(my_outer_mw)   # for every message that reaches this Router
```

Details in the [Middlewares](/guide/middlewares) lesson.

## Startup and shutdown

```python
@router.on_startup
async def connect_db(bot: Bot):
    ...

@router.on_shutdown
async def close_db():
    ...
```

They run when the bot starts and stops. Shutdown runs in reverse order (the last Router closes first).

## Full example: a modular bot

```python title="bot.py"
import asyncio
from baleropy import Bot, Dispatcher, Router, F
from baleropy.filters import Command, CommandStart
from baleropy.types import Message

TOKEN = "YOUR_BOT_TOKEN"

main = Router(name="main")
fun = Router(name="fun")
fallback = Router(name="fallback")


@main.message(CommandStart())
async def start(message: Message):
    await message.answer("Hi! Try /joke")


@fun.message(Command("joke"))
async def joke(message: Message):
    await message.answer("Why do programmers love the dark? Light attracts bugs 🐛")


@fallback.message(F.text)
async def unknown(message: Message):
    await message.reply("I did not get that 🤔 /start")


dp = Dispatcher()
dp.include_routers(main, fun, fallback)       # fallback is last


asyncio.run(dp.start_polling(Bot(TOKEN), skip_updates=True))
```

## Summary

- Every feature = one `Router` in its own file.
- Attach it with `include_router(s)` to the `Dispatcher`.
- `include` order sets priority; generic ones last.
- Next: [Filters](/guide/filters).

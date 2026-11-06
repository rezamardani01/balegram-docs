---
title: Introducing baleropy
lead: baleropy is an asynchronous, fully typed framework for building bots in the Bale messenger.
---

## What is baleropy?

**baleropy** is a Python library that lets you build bots with the [Bale Bot API](https://docs.bale.ai). Its structure is inspired by [aiogram](https://github.com/aiogram/aiogram), so if you have used aiogram most things will feel familiar. If you have not, no problem: these docs teach you from scratch.

::: tip Why baleropy?
- Everything a serious bot needs ships with it: **routers, middlewares, filters, FSM, colored buttons**.
- Every Bot API method of Bale is covered (52 methods) and all types are validated with **pydantic**.
- Your code stays readable: instead of one 2000-line file you split the bot into small modules (routers).
:::

## A quick look

```python title="bot.py"
from baleropy import Bot, Dispatcher, F
from baleropy.filters import CommandStart
from baleropy.types import Message

TOKEN = "YOUR_BOT_TOKEN"
dp = Dispatcher()

@dp.message(CommandStart())
async def start(message: Message):
    await message.answer("Hello! 👋")

@dp.message(F.text)
async def echo(message: Message):
    await message.reply(message.text)

dp.run_polling(Bot(TOKEN), skip_updates=True)
```

That's it! Register handlers with decorators and run the bot with `run_polling`. It shuts down cleanly on Ctrl+C. We build it step by step in the next lesson.

## How these docs are organized

::: cards
- 🚀 | Getting started | Install, first bot and the basic concepts | /start/install
- 📘 | Step-by-step guide | Handlers, routers, filters, middlewares, FSM and more, with examples | /guide/handlers
- 📚 | Reference | Every method, type, filter and exception | /reference/methods-messages
- 🍳 | Cookbook | Complete, ready-made projects | /cookbook/quiz-bot
:::

::: note Prerequisites
You only need Python 3.10 or newer and a basic familiarity with `async/await`. If `async` is new to you, don't worry; the [concepts lesson](/start/concepts) has a short explanation.
:::

## Features at a glance

| Part | What it gives you |
|---|---|
| **Router** | Split a bot into nested modules |
| **Middleware** | Shared code before/after handlers (logging, stats, rate limits) |
| **Filter** | The condition for a handler; combine with `&` `\|` `~` |
| **FSM** | Multi-step conversations that remember their state |
| **Colored buttons** | `style="success"` green, `"danger"` red, `"primary"` blue |
| **Webhook / Polling** | Both, with graceful shutdown and 429 handling |
| **Business API** | Bulk messaging with a separate quota |

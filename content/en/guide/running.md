---
title: "Running: polling & webhook"
lead: Two ways to receive updates from Bale, their settings, graceful shutdown and running several bots at once.
---

## Polling or webhook?

| | Polling | Webhook |
|---|---|---|
| **How?** | The bot keeps asking Bale "anything new?" | Bale POSTs updates to your address itself |
| **Needs** | just internet | a server with an **HTTPS** domain (port 443 or 88) |
| **Good for** | development, simple servers, behind NAT | production with high traffic |
| **Setup** | one line | a bit more |

::: note Only one of the two
Bale does not accept both at once. `start_polling` calls `deleteWebhook` first. Bale keeps the last 2000 updates for 24 hours.
:::

## Polling

```python
import asyncio
from baleropy import Bot, Dispatcher

dp = Dispatcher()
bot = Bot("YOUR_BOT_TOKEN")

asyncio.run(dp.start_polling(bot))
```

### start_polling parameters

| Parameter | Default | What it does |
|---|---|---|
| `*bots` | — | one or more `Bot`s (run several bots with one Dispatcher) |
| `polling_timeout` | `30` | long-polling seconds (Bale's server waits) |
| `skip_updates` | `False` | skip old messages left in the queue |
| `handle_as_tasks` | `True` | each update in its own task (parallel) |
| `max_concurrent_updates` | `50` | max updates being processed at once |
| `delete_webhook` | `True` | delete the webhook first |
| `close_bot_session` | `True` | close the session on exit |
| `backoff` | `(1.0, 5.0, 1.5)` | (initial delay, max delay, factor) after a network error |
| `**kwargs` | — | extra data for [injection](/guide/dependency-injection) |

::: tip Set skip_updates=True
When the bot was off for hours, all accumulated messages arrive at once and the bot answers them all (sometimes users who blocked the bot). `skip_updates=True` drops that queue.
:::

### Graceful stop

```python
async def main():
    try:
        await dp.start_polling(bot, skip_updates=True)
    except KeyboardInterrupt:
        pass

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
```

Or simpler, without asyncio:

```python
dp.run_polling(bot, skip_updates=True)        # Ctrl+C without a traceback
```

On exit baleropy finishes running requests, runs the `on_shutdown` callbacks and closes the session. From inside a handler you can also call `await dp.stop_polling()`.

### If the internet drops

Network errors and Bale's 5xx are retried automatically with **backoff** (1 second, then ×1.5 ... up to 5 seconds) and the bot does not die. A wrong token (401) stops it.

## Several bots with one Dispatcher

```python
bots = [Bot(TOKEN_1), Bot(TOKEN_2)]
await dp.start_polling(*bots, skip_updates=True)

@dp.message()
async def h(message: Message, bot: Bot):          # bot = the receiving bot
    await message.answer(f"I am {bot.id}")
```

## Webhook

### Step 1: an aiohttp app

```python title="webhook_bot.py"
from aiohttp import web
from baleropy import Bot, Dispatcher
from baleropy.filters import CommandStart
from baleropy.types import Message
from baleropy.webhook import SimpleRequestHandler, setup_application

TOKEN = "YOUR_BOT_TOKEN"
BASE_URL = "https://bot.example.com"          # your public HTTPS address
PATH = "/webhook/CHANGE_ME"                   # an unguessable path! (see below)

dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message):
    await message.answer("Webhook works ✅")


@dp.on_startup
async def on_startup(bot: Bot):
    await bot.set_webhook(f"{BASE_URL}{PATH}")      # tell Bale where to send updates


def main():
    bot = Bot(TOKEN)
    app = web.Application()
    SimpleRequestHandler(dp, bot).register(app, PATH)
    setup_application(app, dp, bot=bot)             # connects startup/shutdown to aiohttp
    web.run_app(app, host="0.0.0.0", port=8080)


if __name__ == "__main__":
    main()
```

### Step 2: HTTPS

Bale accepts only HTTPS and only ports **443** and **88**. Usually a web server (nginx or Caddy) holds the certificate on 443 and proxies to your app on 8080:

```nginx
server {
    listen 443 ssl;
    server_name bot.example.com;
    # ssl_certificate ... (Let's Encrypt)

    location /webhook/ {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

### Webhook security

::: danger Bale sends no secret header
Unlike some messengers, the Bale docs have no webhook "secret token". So anyone who knows the **address** can send fake updates. Two defenses:
:::

1. An **unguessable path** with `secret_path()`:

```bash
python -c "from baleropy.webhook import secret_path; print(secret_path())"
# /webhook/Qk3d9sA7-...
```

2. A **verify function** (for example checking the IP or a proxy header):

```python
SimpleRequestHandler(dp, bot, verify=lambda request: request.remote in ALLOWED_IPS)
```

### SimpleRequestHandler

| Parameter | What it does |
|---|---|
| `dispatcher`, `bot` | required |
| `handle_in_background=True` | answer `200` quickly and process the update in the background (recommended) |
| `verify` | a `request -> bool` function; false ⇒ `403` |
| `**workflow_data` | extra data for injection |

### Going back to polling

```python
await bot.delete_webhook()         # (start_polling does this by itself too)
```

## With another web framework (FastAPI etc.)

Three lines are enough:

```python
from baleropy.types import Update

@app.post("/webhook/CHANGE_ME")
async def hook(request: Request):
    update = Update.model_validate(await request.json(), context={"bot": bot})
    await dp.feed_update(bot, update)
    return {"ok": True}
```

(or `await dp.feed_raw_update(bot, raw_dict)`). To run the `on_startup` handlers call `await dp.emit_startup(bot=bot)` and `emit_shutdown()` yourself.

## Full example: polling with start/stop hooks

```python
@dp.on_startup
async def started(bot: Bot):
    me = await bot.me()
    print(f"✅ @{me.username} is up")

@dp.on_shutdown
async def stopped():
    print("👋 stopped")

dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## Summary

- Development: `run_polling(bot, skip_updates=True)`.
- Production: webhook on HTTPS with a secret path.
- Bale allows only one of the two; 2000 updates for 24 hours.
- Next: [Errors & rate limits](/guide/errors).

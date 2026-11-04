---
title: "اجرا: Polling و Webhook"
lead: دو روش دریافت آپدیت از بله، تنظیم‌هایشان، خاموشی تمیز، و اجرای هم‌زمان چند ربات.
---

## Polling یا Webhook؟

| | Polling | Webhook |
|---|---|---|
| **چطور؟** | ربات مدام از بله می‌پرسد «چیز تازه‌ای هست؟» | بله خودش آپدیت را به آدرس شما POST می‌کند |
| **نیاز دارد** | فقط اینترنت | سرور با دامنه‌ی **HTTPS** (پورت ۴۴۳ یا ۸۸) |
| **مناسب** | توسعه، سرور ساده، پشت NAT | تولید با ترافیک بالا |
| **راه‌اندازی** | یک خط | کمی بیشتر |

::: note فقط یکی از دو
بله هم‌زمان هر دو را نمی‌پذیرد. `start_polling` خودش اول `deleteWebhook` را صدا می‌زند. بله آخرین ۲۰۰۰ آپدیت را تا ۲۴ ساعت نگه می‌دارد.
:::

## Polling

```python
import asyncio
from balegram import Bot, Dispatcher

dp = Dispatcher()
bot = Bot("YOUR_BOT_TOKEN")

asyncio.run(dp.start_polling(bot))
```

### پارامترهای start_polling

| پارامتر | پیش‌فرض | کار |
|---|---|---|
| `*bots` | — | یک یا چند `Bot` (اجرای هم‌زمان چند ربات با یک Dispatcher) |
| `polling_timeout` | `30` | ثانیه‌ی long polling (سمت سرور بله منتظر می‌ماند) |
| `skip_updates` | `False` | پیام‌های قدیمیِ مانده در صف را رد کن |
| `handle_as_tasks` | `True` | هر آپدیت در یک task جدا (موازی) |
| `max_concurrent_updates` | `50` | حداکثر آپدیتِ هم‌زمان در حال پردازش |
| `delete_webhook` | `True` | اول webhook را حذف کن |
| `close_bot_session` | `True` | موقع خروج سشن را ببند |
| `backoff` | `(1.0, 5.0, 1.5)` | (تاخیر اولیه، حداکثر تاخیر، ضریب) بعد از خطای شبکه |
| `**kwargs` | — | داده‌ی اضافه برای [تزریق](/guide/dependency-injection) |

::: tip skip_updates=True را بگذارید
وقتی ربات چند ساعت خاموش بوده، همه‌ی پیام‌های جمع‌شده یک‌جا می‌آید و ربات به همه جواب می‌دهد (گاهی به کاربرانی که ربات را بلاک کرده‌اند). `skip_updates=True` این صف را رد می‌کند.
:::

### توقف تمیز

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

یا ساده‌تر، بدون asyncio:

```python
dp.run_polling(bot, skip_updates=True)        # Ctrl+C بدون Traceback
```

موقع خروج balegram: درخواست‌های در حال اجرا را تمام می‌کند، `on_shutdown`ها را اجرا می‌کند و سشن را می‌بندد. از داخل یک هندلر هم می‌توانید `await dp.stop_polling()` را صدا بزنید.

### اگر اینترنت قطع شد

خطاهای شبکه و ۵۰۰ بله خودکار با **backoff** (۱ ثانیه، بعد ۱.۵ برابر ... تا ۵ ثانیه) دوباره امتحان می‌شوند و ربات از کار نمی‌افتد. توکن اشتباه (۴۰۱) کار را متوقف می‌کند.

## چند ربات با یک Dispatcher

```python
bots = [Bot(TOKEN_1), Bot(TOKEN_2)]
await dp.start_polling(*bots, skip_updates=True)

@dp.message()
async def h(message: Message, bot: Bot):          # bot = ربات دریافت‌کننده
    await message.answer(f"من {bot.id} هستم")
```

## Webhook

### گام ۱: برنامه‌ی aiohttp

```python title="webhook_bot.py"
from aiohttp import web
from balegram import Bot, Dispatcher
from balegram.filters import CommandStart
from balegram.types import Message
from balegram.webhook import SimpleRequestHandler, setup_application

TOKEN = "YOUR_BOT_TOKEN"
BASE_URL = "https://bot.example.com"          # آدرس عمومی HTTPS شما
PATH = "/webhook/CHANGE_ME"                   # مسیر غیرقابل حدس! (پایین را ببینید)

dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message):
    await message.answer("وب‌هوک کار می‌کند ✅")


@dp.on_startup
async def on_startup(bot: Bot):
    await bot.set_webhook(f"{BASE_URL}{PATH}")      # به بله بگو آپدیت‌ها را کجا بفرستد


def main():
    bot = Bot(TOKEN)
    app = web.Application()
    SimpleRequestHandler(dp, bot).register(app, PATH)
    setup_application(app, dp, bot=bot)             # startup/shutdown را به aiohttp وصل می‌کند
    web.run_app(app, host="0.0.0.0", port=8080)


if __name__ == "__main__":
    main()
```

### گام ۲: HTTPS

بله فقط HTTPS و فقط پورت‌های **۴۴۳** و **۸۸** را می‌پذیرد. معمولاً یک وب‌سرور (nginx یا Caddy) روی ۴۴۳ گواهی دارد و به برنامه‌ی شما روی ۸۰۸۰ پراکسی می‌کند:

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

### امنیت وب‌هوک

::: danger بله هدر مخفی نمی‌فرستد
برخلاف بعضی پیام‌رسان‌ها، در مستندات بله «secret token» برای وب‌هوک وجود ندارد. پس هر کسی که **آدرس** را بداند می‌تواند آپدیت جعلی بفرستد. دو راه:
:::

1. **مسیر غیرقابل حدس** با `secret_path()`:

```bash
python -c "from balegram.webhook import secret_path; print(secret_path())"
# /webhook/Qk3d9sA7-...
```

2. **تابع verify** (مثلاً بررسی IP یا هدر پراکسی):

```python
SimpleRequestHandler(dp, bot, verify=lambda request: request.remote in ALLOWED_IPS)
```

### SimpleRequestHandler

| پارامتر | کار |
|---|---|
| `dispatcher`، `bot` | الزامی |
| `handle_in_background=True` | سریع `200` بده و آپدیت را در پس‌زمینه پردازش کن (پیشنهادی) |
| `verify` | تابع `request -> bool`؛ نادرست ⇒ `403` |
| `**workflow_data` | داده‌ی اضافه برای تزریق |

### برگشت به polling

```python
await bot.delete_webhook()         # (start_polling خودش هم این را انجام می‌دهد)
```

## با وب‌فریم‌ورک دیگر (FastAPI و ...)

سه خط کافی است:

```python
from balegram.types import Update

@app.post("/webhook/CHANGE_ME")
async def hook(request: Request):
    update = Update.model_validate(await request.json(), context={"bot": bot})
    await dp.feed_update(bot, update)
    return {"ok": True}
```

(یا `await dp.feed_raw_update(bot, raw_dict)`). برای خاموش/روشن‌کردن هندلرهای `on_startup`، `await dp.emit_startup(bot=bot)` و `emit_shutdown()` را خودتان صدا بزنید.

## مثال کامل: polling با hookهای شروع/پایان

```python
@dp.on_startup
async def started(bot: Bot):
    me = await bot.me()
    print(f"✅ @{me.username} روشن شد")

@dp.on_shutdown
async def stopped():
    print("👋 خاموش شد")

dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## خلاصه

- توسعه: `run_polling(bot, skip_updates=True)`.
- تولید: Webhook روی HTTPS با مسیر مخفی.
- بله فقط یکی از دو؛ ۲۰۰۰ آپدیت تا ۲۴ ساعت.
- بعدی: [خطاها و محدودیت نرخ](/guide/errors).

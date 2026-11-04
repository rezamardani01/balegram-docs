---
title: میدلورها
lead: میدلور کدی است که دور هندلر می‌پیچد: قبل و بعد از آن اجرا می‌شود، داده اضافه می‌کند یا رویداد را متوقف می‌کند.
---

## میدلور چیست؟

فرض کنید می‌خواهید برای **همه‌ی** پیام‌ها زمان پردازش را لاگ کنید، یا کاربران را از دیتابیس بخوانید. به‌جای تکرار در همه‌ی هندلرها، یک **میدلور** می‌نویسید:

```python title="middlewares.py"
import time
from baleropy.dispatcher import BaseMiddleware


class TimingMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data):
        start = time.perf_counter()
        result = await handler(event, data)        # ← اجرای ادامه‌ی زنجیره (فیلتر/هندلر)
        ms = (time.perf_counter() - start) * 1000
        print(f"پردازش شد در {ms:.1f} میلی‌ثانیه")
        return result
```

سه آرگومان:

| آرگومان | معنی |
|---|---|
| `handler` | ادامه‌ی زنجیره. `await handler(event, data)` را صدا بزنید تا ادامه یابد. |
| `event` | رویداد (`Message`، `CallbackQuery` یا برای میدلور سطح update: `Update`). |
| `data` | دیکشنری مشترک؛ هر چه اضافه کنید به‌عنوان آرگومان به هندلر می‌رسد. |

## ثبت میدلور

```python
dp.message.outer_middleware(TimingMiddleware())     # برای هر پیام
dp.update.outer_middleware(TimingMiddleware())      # برای هر update (هر نوع رویداد)
router.message.middleware(MyInner())                # inner: بعد از انتخاب هندلر
```

میدلور می‌تواند **کلاس** (ارث از `BaseMiddleware`) یا **تابع** باشد:

```python
@dp.message.outer_middleware
async def log_it(handler, event, data):
    print("پیام از", event.from_user.id)
    return await handler(event, data)
```

## Outer در برابر Inner

| | Outer (بیرونی) | Inner (داخلی) |
|---|---|---|
| ثبت | `observer.outer_middleware` | `observer.middleware` |
| چه زمانی اجرا می‌شود؟ | برای **هر** رویداد، **قبل** از فیلترها | **فقط وقتی** هندلری انتخاب شد (فیلترها گذشتند) |
| کاربرد | لاگ، آمار، throttling، ساخت `data` مشترک | باز کردن session دیتابیس، اندازه‌گیری دقیق هندلر |
| ترتیب | از بیرون به داخل، با ترتیب ثبت | والدین پیش از فرزندان |

ترتیب کامل اجرا برای یک پیام:

```text
update outer  →  router outer  →  [فیلترها]  →  inner  →  هندلر
```

::: tip قانون انتخاب
اگر میدلور باید حتی برای پیام‌هایی که هیچ هندلری ندارند اجرا شود (آمار، لاگ) → **outer**. اگر فقط برای هندلرهای واقعی لازم است و هزینه دارد (دیتابیس) → **inner**.
:::

## افزودن داده برای هندلرها

هر چه در `data` بگذارید، هندلر با همان نام می‌گیرد:

```python
class DbMiddleware(BaseMiddleware):
    def __init__(self, pool):
        self.pool = pool

    async def __call__(self, handler, event, data):
        async with self.pool.acquire() as conn:
            data["db"] = conn
            return await handler(event, data)     # بعد از بیرون رفتن از with، اتصال بسته می‌شود


dp.message.middleware(DbMiddleware(pool))

@dp.message(Command("me"))
async def me(message: Message, db):               # db همین‌جا می‌رسد
    row = await db.fetchrow("SELECT ...")
```

## متوقف کردن رویداد

`handler` را صدا نزنید یا `CancelHandler` پرتاب کنید:

```python
from baleropy.exceptions import CancelHandler

class BanMiddleware(BaseMiddleware):
    def __init__(self, banned: set[int]):
        self.banned = banned

    async def __call__(self, handler, event, data):
        user = data.get("event_from_user")
        if user and user.id in self.banned:
            raise CancelHandler              # این کاربر ممنوع است: هیچ هندلری اجرا نشود
        return await handler(event, data)
```

## میدلورهای آماده

| میدلور | کار |
|---|---|
| `LoggingMiddleware(level)` | لاگ هر رویداد با زمان پردازش |
| `ThrottlingMiddleware(rate, on_throttled)` | هر کاربر هر `rate` ثانیه یک رویداد؛ بقیه حذف می‌شوند |
| `CallbackAnswerMiddleware(text, show_alert)` | پاسخ خودکار به `callback_query` اگر هندلر پاسخ نداده باشد |

```python
from baleropy.dispatcher.middlewares import (
    LoggingMiddleware, ThrottlingMiddleware, CallbackAnswerMiddleware,
)

async def slow_down(event, data):
    await event.answer("🐢 یواش‌تر!")

dp.message.outer_middleware(LoggingMiddleware())
dp.message.outer_middleware(ThrottlingMiddleware(rate=0.7, on_throttled=slow_down))
dp.callback_query.outer_middleware(CallbackAnswerMiddleware())
```

::: note throttling فقط یک بار هشدار می‌دهد
`on_throttled` فقط **اولین بار** در هر بازه صدا زده می‌شود، تا ربات خودش اسپم نکند.
:::

## flags: برچسب روی هندلر

می‌توانید هنگام ثبت هندلر برچسب (flag) بگذارید و در میدلور بخوانید:

```python
from baleropy.dispatcher import get_flag

@dp.message(Command("buy"), rate_limit=5)        # هر کلمه‌ی کلیدی اضافه = یک flag
async def buy(message: Message): ...

class RateMw(BaseMiddleware):
    async def __call__(self, handler, event, data):
        seconds = get_flag(data, "rate_limit", default=1)
        ...
        return await handler(event, data)

dp.message.middleware(RateMw())                  # باید inner باشد: handler انتخاب‌شده را می‌شناسد
```

## میدلور برای درخواست‌های خروجی

میدلور روی **Session** هم هست و دور هر درخواست به سرور بله می‌پیچد (مثلاً لاگ یا شمارش):

```python
@bot.session.middleware
async def count_calls(make_request, bot, method):
    print("→", method.__api_method__)
    return await make_request(bot, method)
```

## مثال کامل: آمار استفاده

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
    await message.answer("پرکاربردترین دستورها:\n" + "\n".join(lines))
```

## خلاصه

- میدلور = `async def (handler, event, data)`؛ `await handler(event, data)` را صدا بزنید.
- Outer قبل از فیلتر، Inner بعد از انتخاب هندلر.
- `data` را پر کنید تا به هندلر برسد؛ `CancelHandler` برای توقف.
- بعدی: [تزریق وابستگی](/guide/dependency-injection).

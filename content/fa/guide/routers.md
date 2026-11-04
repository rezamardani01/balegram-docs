---
title: روترها
lead: با Router ربات را به ماژول‌های کوچک و مستقل تقسیم می‌کنیم؛ هر ماژول هندلرها، فیلترها و میدلورهای خودش را دارد.
---

## چرا Router؟

وقتی ربات بزرگ شود، قرار دادن همه‌ی هندلرها در یک فایل دردسرساز است. `Router` به شما اجازه می‌دهد هر قابلیت را در فایل جدا بنویسید و در آخر کنار هم بگذارید. در واقع `Dispatcher` هم یک Router است (ریشه‌ی درخت).

## ساخت و اتصال

```python title="handlers/shop.py"
from baleropy import F, Router
from baleropy.filters import Command
from baleropy.types import Message

router = Router(name="shop")


@router.message(Command("buy"))
async def buy(message: Message):
    await message.answer("چی می‌خوای بخری؟ 🛍️")
```

```python title="handlers/admin.py"
from baleropy import Router
from baleropy.filters import Command
from baleropy.types import Message

router = Router(name="admin")


@router.message(Command("stats"))
async def stats(message: Message):
    await message.answer("آمار: ...")
```

```python title="bot.py"
from baleropy import Bot, Dispatcher
from handlers import shop, admin

dp = Dispatcher()
dp.include_routers(shop.router, admin.router)      # یا include_router برای یکی
```

## ترتیب پردازش

برای یک رویداد، ابتدا هندلرهای **خود Router** بررسی می‌شوند، بعد **زیرروترها** به ترتیب `include`. اولین هندلرِ مطابق برنده است:

```text
Dispatcher
├── هندلرهای dp            ← اول
├── shop.router            ← بعد
│   └── cart.router        ← (زیرروتر shop)
└── admin.router           ← آخر
```

::: tip قانون ساده
هندلرهای **عمومی** (مثل «هر متنی») را در **آخرین** Router بگذارید تا جلوی هندلرهای دقیق‌تر را نگیرند.
:::

## روتر تو در تو

```python
cart = Router(name="cart")
shop.router.include_router(cart)       # cart داخل shop
```

baleropy جلوی خطاهای ساختاری را می‌گیرد: یک Router را نمی‌توان دوبار به جایی وصل کرد و حلقه (روتر داخل خودش) ممنوع است:

```python
dp.include_router(shop.router)
dp.include_router(shop.router)         # RuntimeError: already attached
shop.router.include_router(dp)         # RuntimeError: circular
```

## فیلتر در سطح Router

اگر همه‌ی هندلرهای یک Router یک شرط مشترک دارند، یک بار فیلتر بگذارید:

```python
from baleropy.filters import ChatTypeFilter

admin = Router(name="admin")
admin.message.filter(ChatTypeFilter("group", "supergroup"))   # فقط در گروه‌ها

@admin.message(Command("ban"))      # بدون تکرار فیلتر
async def ban(message: Message): ...
```

::: warn مراقب هزینه باشید
فیلتر سطح Router برای **هر** پیام اجرا می‌شود. فیلترهایی که API صدا می‌زنند (مثل `IsChatAdmin`) را روی خود هندلر بگذارید، نه روی Router.
:::

## میدلور در سطح Router

```python
router.message.middleware(my_inner_mw)         # فقط وقتی هندلر این Router انتخاب شد
router.message.outer_middleware(my_outer_mw)   # برای هر پیامی که به این Router می‌رسد
```

جزئیات در درس [میدلورها](/guide/middlewares).

## شروع و پایان

```python
@router.on_startup
async def connect_db(bot: Bot):
    ...

@router.on_shutdown
async def close_db():
    ...
```

این توابع موقع روشن و خاموش‌شدن ربات اجرا می‌شوند. خاموشی به ترتیب معکوس انجام می‌شود (آخرین Router اول بسته می‌شود).

## مثال کامل: ربات ماژولار

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
    await message.answer("سلام! /joke را امتحان کن")


@fun.message(Command("joke"))
async def joke(message: Message):
    await message.answer("برنامه‌نویس‌ها چرا تاریکی را دوست دارند؟ چون نور باگ جذب می‌کند 🐛")


@fallback.message(F.text)
async def unknown(message: Message):
    await message.reply("نفهمیدم 🤔 /start")


dp = Dispatcher()
dp.include_routers(main, fun, fallback)       # fallback آخر است


asyncio.run(dp.start_polling(Bot(TOKEN), skip_updates=True))
```

## خلاصه

- هر قابلیت = یک `Router` در فایل خودش.
- با `include_router(s)` به `Dispatcher` وصل می‌شود.
- ترتیب `include` اولویت را تعیین می‌کند؛ عمومی‌ها آخر.
- بعدی: [فیلترها](/guide/filters).

---
title: معرفی baleropy
lead: baleropy یک فریم‌ورک ناهمگام (async) و کاملاً تایپ‌دار برای ساخت ربات در پیام‌رسان بله است.
---

## baleropy چیست؟

**baleropy** کتابخانه‌ای برای ساخت ربات‌های بله با پایتون است که از [Bale Bot API](https://docs.bale.ai) استفاده می‌کند. ساختار آن از [aiogram](https://github.com/aiogram/aiogram) الهام گرفته؛ اگر با aiogram کار کرده باشید، بخش زیادی از مفاهیم برایتان آشناست. اگر هم تازه شروع می‌کنید، این راهنما قدم‌به‌قدم همراهتان است.

::: tip چرا baleropy؟
- هر چیزی که برای یک ربات جدی لازم است همراهش است: **روتر، میدلور، فیلتر، FSM، دکمه رنگی**.
- همه‌ی متدهای Bot API بله پوشش داده شده‌اند (۵۲ متد) و همه‌ی تایپ‌ها با **pydantic** اعتبارسنجی می‌شوند.
- کدتان خوانا می‌ماند: به‌جای یک فایل ۲۰۰۰ خطی، ربات را به ماژول‌های کوچک (روتر) تقسیم می‌کنید.
:::

## یک نگاه سریع

```python title="bot.py"
from baleropy import Bot, Dispatcher, F
from baleropy.filters import CommandStart
from baleropy.types import Message

TOKEN = "YOUR_BOT_TOKEN"
dp = Dispatcher()

@dp.message(CommandStart())
async def start(message: Message):
    await message.answer("سلام! 👋")

@dp.message(F.text)
async def echo(message: Message):
    await message.reply(message.text)

dp.run_polling(Bot(TOKEN), skip_updates=True)
```

هندلرها را با دکوراتور ثبت کنید و با `run_polling` ربات را اجرا کنید. این روش با `Ctrl+C` ربات را تمیز می‌بندد. در درس بعد، همین نمونه را مرحله‌به‌مرحله می‌سازیم.

## این مستندات چطور مرتب شده؟

::: cards
- 🚀 | شروع کنید | نصب، اولین ربات و مفاهیم پایه | /start/install
- 📘 | آموزش درس‌به‌درس | هندلر، روتر، فیلتر، میدلور، FSM و ... با مثال | /guide/handlers
- 📚 | مرجع | همه‌ی متدها، تایپ‌ها، فیلترها و استثناها | /reference/methods-messages
- 🍳 | دستور پخت | پروژه‌های کامل و آماده | /cookbook/quiz-bot
:::

::: note پیش‌نیاز
برای شروع به پایتون ۳.۱۰ یا بالاتر و آشنایی پایه‌ای با `async/await` نیاز دارید. اگر با `async` آشنا نیستید، در [درس مفاهیم](/start/concepts) توضیح کوتاهی درباره‌اش آورده‌ایم.
:::

## ویژگی‌ها یک‌جا

| بخش | چه می‌دهد |
|---|---|
| **Router** | تقسیم ربات به ماژول‌های تو در تو |
| **Middleware** | کد مشترک قبل/بعد از هندلر (لاگ، آمار، محدودیت نرخ) |
| **Filter** | شرط اجرای هندلر؛ قابل ترکیب با `&` `\|` `~` |
| **FSM** | گفتگوی چندمرحله‌ای با ذخیره‌ی حالت |
| **دکمه رنگی** | `style="success"` برای سبز، `"danger"` قرمز، `"primary"` آبی |
| **Webhook / Polling** | هر دو، با خاموشی تمیز و کنترل خطای ۴۲۹ |
| **Business API** | ارسال انبوه با سهمیه‌ی جدا |

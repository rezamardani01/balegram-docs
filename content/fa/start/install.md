---
title: نصب و اولین ربات
lead: در این درس baleropy را نصب می‌کنیم، توکن می‌گیریم و در کمتر از ۵ دقیقه اولین ربات را اجرا می‌کنیم.
---

## پیش‌نیازها

- **پایتون ۳.۱۰ یا بالاتر** (با `python --version` چک کنید).
- یک حساب کاربری در پیام‌رسان **بله**.

## ۱. نصب

پیشنهاد می‌شود برای هر پروژه یک محیط مجازی (virtual environment) بسازید:

```bash
python -m venv .venv

# ویندوز (PowerShell)
.venv\Scripts\Activate.ps1
# لینوکس / مک
source .venv/bin/activate
```

سپس baleropy را نصب کنید:

```bash
pip install baleropy
```

::: note نام پکیج و نام ایمپورت فرق دارند
نام پکیج در PyPI برابر **`baleropy`** است، ولی داخل کد می‌نویسید `import baleropy` (و `from baleropy import Bot`).
:::

::: tip نصب با Redis
اگر می‌خواهید حالت FSM را در Redis ذخیره کنید، افزونه‌ی redis را هم نصب کنید:

```bash
pip install "baleropy[redis]"
```
:::

نصب را بررسی کنید:

```python
import baleropy
print(baleropy.__version__)
```

## ۲. گرفتن توکن ربات

::: steps
1. در بله با **@botfather** ([ble.ir/botfather](https://ble.ir/botfather)) گفتگو را شروع کنید.
2. دستور ساخت ربات جدید را بفرستید و نام و آیدی (username) ربات را انتخاب کنید.
3. BotFather یک **توکن** به شکل `123456789:AbCdEf...` به شما می‌دهد. آن را کپی کنید.
:::

::: danger توکن را مخفی نگه دارید
هر کسی که توکن را داشته باشد می‌تواند ربات شما را کنترل کند. آن را در گیت‌هاب یا گروه‌های عمومی **منتشر نکنید**. اگر لو رفت، در BotFather توکن جدید بگیرید.
:::

## ۳. اولین ربات

یک فایل به نام `bot.py` بسازید:

```python title="bot.py"
import asyncio

from baleropy import Bot, Dispatcher, F
from baleropy.filters import CommandStart
from baleropy.types import Message

# توکن را از @botfather بگیرید و اینجا بگذارید
TOKEN = "YOUR_BOT_TOKEN"

dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message):
    name = message.from_user.full_name if message.from_user else "دوست من"
    await message.answer(f"سلام {name}! 👋")


@dp.message(F.text)
async def echo(message: Message):
    await message.reply(message.text)


async def main():
    bot = Bot(TOKEN)
    await dp.start_polling(bot, skip_updates=True)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass  # با Ctrl+C ربات بدون خطا متوقف می‌شود
```

اجرا کنید:

```bash
python bot.py
```

حالا در بله به رباتتان `/start` بفرستید؛ سلام می‌گیرید. هر متن دیگری بفرستید، همان را برمی‌گرداند.

## کد را خط‌به‌خط بفهمیم

| بخش | توضیح |
|---|---|
| `Dispatcher()` | مرکز فرمان ربات؛ پیام‌ها را می‌گیرد و به هندلر درست می‌رساند. |
| `@dp.message(...)` | یک **هندلر** برای پیام‌ها ثبت می‌کند. آرگومان‌ها **فیلتر** هستند. |
| `CommandStart()` | فقط وقتی پیام `/start` باشد درست است. |
| `F.text` | فقط وقتی پیام متن داشته باشد (فیلتر جادویی). |
| `message.answer(...)` | یک پیام تازه در همان چت می‌فرستد. |
| `message.reply(...)` | مثل answer، ولی روی پیام کاربر ریپلای می‌کند. |
| `start_polling(bot)` | به‌طور مداوم از بله آپدیت می‌گیرد و پردازش می‌کند. |
| `skip_updates=True` | پیام‌های قدیمی که وقتی ربات خاموش بود آمده‌اند را رد می‌کند. |

::: note ترتیب هندلرها مهم است
هندلرها به ترتیب ثبت چک می‌شوند و **اولین هندلری که فیلترهایش درست باشد** اجرا می‌شود. چون `/start` متن هم هست، هندلر `start` باید *قبل از* `echo` باشد؛ وگرنه `echo` آن را می‌خورد.
:::

## اگر کار نکرد

- `ModuleNotFoundError: baleropy` ← نصب را روی همان پایتونی که اجرا می‌کنید انجام دهید (`python -m pip install ...`).
- `Token has an invalid format` ← توکن باید به شکل `عدد:متن` باشد، بدون فاصله و کوتیشن اضافه.
- `401 Unauthorized` ← توکن اشتباه است یا باطل شده.
- ربات جواب نمی‌دهد ← اول به ربات `/start` بفرستید و مطمئن شوید برنامه هنوز در حال اجراست.

مشکلات بیشتر در [پرسش‌های پرتکرار](/more/faq).

## قدم بعد

حالا که ربات اجرا می‌شود، بهتر است بفهمیم **چطور کار می‌کند**: [مفاهیم و معماری](/start/concepts).

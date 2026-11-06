---
title: نصب و اولین ربات
lead: در این درس baleropy را نصب می‌کنیم، توکن می‌گیریم و در کمتر از ۵ دقیقه اولین ربات را اجرا می‌کنیم.
---

## پیش‌نیازها

- **پایتون ۳.۱۰ یا بالاتر** (با `python --version` چک کنید).
- یک حساب کاربری در پیام‌رسان **بله**.

## ۱. نصب

برای هر پروژه یک محیط مجازی (virtual environment) بسازید تا وابستگی‌هایش از پروژه‌های دیگر جدا بماند:

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

::: note نام پکیج و ایمپورت یکی است
نام پکیج در PyPI و نام ماژول پایتون هر دو **`baleropy`** هستند؛ برای نصب `pip install baleropy` و برای استفاده `import baleropy` یا `from baleropy import Bot` را بنویسید.
:::

::: tip نصب با Redis
اگر می‌خواهید حالت FSM را در Redis ذخیره کنید، افزونه‌ی redis را هم نصب کنید:

```bash
pip install "baleropy[redis]"
```
:::

برای اطمینان از نصب، نسخه‌ی کتابخانه را بررسی کنید:

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


if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

اجرا کنید:

```bash
python bot.py
```

با `Ctrl+C` ربات به‌صورت تمیز متوقف می‌شود؛ لازم نیست `KeyboardInterrupt` را در کد بگیرید.

حالا در بله دستور `/start` را برای ربات بفرستید تا پیام خوش‌آمد را ببینید. ربات هم هر متن دیگری را برایتان برمی‌گرداند.

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
هندلرها به ترتیب ثبت بررسی می‌شوند و **اولین هندلری که فیلترهایش درست باشد** اجرا می‌شود. چون `/start` یک پیام متنی هم هست، هندلر `start` را *قبل از* `echo` بنویسید؛ در غیر این صورت، هندلر `echo` آن را می‌گیرد.
:::

## اگر کار نکرد

- `ModuleNotFoundError: baleropy` ← کتابخانه را روی همان نسخه‌ی پایتونی نصب کنید که برنامه را با آن اجرا می‌کنید (`python -m pip install ...`).
- `Token has an invalid format` ← توکن باید به شکل `عدد:متن` باشد، بدون فاصله و کوتیشن اضافه.
- `401 Unauthorized` ← توکن اشتباه است یا باطل شده.
- ربات پاسخ نمی‌دهد ← ابتدا `/start` را برای ربات بفرستید و بررسی کنید برنامه هنوز در حال اجرا باشد.

مشکلات بیشتر در [پرسش‌های پرتکرار](/more/faq).

## قدم بعد

حالا که ربات اجرا می‌شود، بهتر است بفهمیم **چطور کار می‌کند**: [مفاهیم و معماری](/start/concepts).

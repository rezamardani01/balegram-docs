---
title: هندلرها و رویدادها
lead: هندلر تابعی است که به یک رویداد پاسخ می‌دهد. یاد می‌گیریم چطور ثبتش کنیم، چه آرگومان‌هایی می‌گیرد و چه چیزی برمی‌گرداند.
---

## ثبت هندلر

سه راه برابر برای ثبت هندلر وجود دارد:

```python
from baleropy import Dispatcher
from baleropy.types import Message

dp = Dispatcher()

# ۱) دکوراتور (رایج‌ترین)
@dp.message()
async def a(message: Message):
    ...

# ۲) register: وقتی تابع جای دیگری تعریف شده
async def b(message: Message): ...
dp.message.register(b)

# ۳) با فیلتر
dp.message.register(b, F.text == "سلام")
```

همه‌ی ناظرها (`message`، `edited_message`، `callback_query`، `pre_checkout_query`، `error`) همین روش را دارند.

## هندلر پیام

```python title="handlers.py"
from baleropy import F
from baleropy.filters import Command
from baleropy.types import Message


@dp.message(Command("ping"))
async def ping(message: Message):
    await message.answer("pong 🏓")


@dp.message(F.photo)
async def photo(message: Message):
    await message.reply("عکس قشنگی بود!")


@dp.message(F.text.lower() == "سلام")
async def hello(message: Message):
    await message.reply("سلام به روی ماهت 🌹")
```

## هندلر ویرایش پیام

وقتی کاربر پیامی را ویرایش کند، رویداد `edited_message` می‌آید:

```python
@dp.edited_message(F.text)
async def edited(message: Message):
    await message.reply(f"ویرایش کردی: {message.text}")
```

## هندلر دکمه (callback)

وقتی کاربر دکمه‌ی inline را بزند، `callback_query` می‌آید. حتماً با `answer()` به آن پاسخ دهید، وگرنه دکمه در حالت «در انتظار» می‌ماند:

```python
from baleropy.types import CallbackQuery

@dp.callback_query(F.data == "like")
async def like(query: CallbackQuery):
    await query.answer("ممنون ❤️")                     # بستن حالت انتظار + اعلان کوتاه
    await query.message.edit_text("لایک شد!")        # ویرایش پیامِ دارای دکمه
```

::: note کلاینت‌های قدیمی بله
در کلاینت‌های خیلی قدیمی `answerCallbackQuery` پشتیبانی نمی‌شود (شناسه‌ی callback با `1` شروع می‌شود). متد `query.answer()` در کتابخانه خودش این حالت را تشخیص می‌دهد و بی‌خطا رد می‌شود.
:::

## هندلر خطا

```python
from baleropy.dispatcher import ErrorEvent

@dp.error()
async def on_error(event: ErrorEvent, exception: Exception):
    print("خطا:", exception)
    return True            # یعنی خطا مدیریت شد (دوباره پرتاب نمی‌شود)
```

جزئیات در درس [خطاها و محدودیت نرخ](/guide/errors).

## آرگومان‌های هندلر

هندلر **فقط آرگومان‌هایی را که اعلام کرده‌اید** می‌گیرد. رویداد (مثلاً `message`) اولین آرگومان است و بقیه با نام تزریق می‌شوند:

```python
@dp.message(Command("me"))
async def me(message: Message, bot: Bot, event_from_user, state: FSMContext):
    ...
```

فهرست کامل در درس [تزریق وابستگی](/guide/dependency-injection).

## مقدار بازگشتی

هندلر معمولاً چیزی برنمی‌گرداند. ولی `feed_update` مقدار بازگشتی هندلر را برمی‌گرداند، که برای [تست کردن](/guide/testing) مفید است.

## هندلر sync هم می‌شود؟

بله؛ تابع معمولی (بدون `async`) در یک thread جدا اجرا می‌شود تا ربات قفل نکند. با این حال برای ارسال پیام به `await` نیاز دارید، پس عملاً هندلرها `async` هستند.

## رد کردن هندلر: SkipHandler

اگر وسط هندلر فهمیدید این هندلر مناسب نیست، `SkipHandler` را پرتاب کنید تا هندلر بعدیِ مطابق اجرا شود:

```python
from baleropy.exceptions import SkipHandler

@dp.message(F.text)
async def maybe(message: Message):
    if not await is_vip(message.from_user.id):
        raise SkipHandler          # برو سراغ هندلر بعدی
    await message.answer("خوش آمدی VIP 👑")
```

## خلاصه

- ثبت: `@router.message(...)`، `@router.callback_query(...)` و ...
- اولین هندلر مطابق اجرا می‌شود.
- آرگومان‌ها با نامشان تزریق می‌شوند.
- بعدی: [روترها](/guide/routers).

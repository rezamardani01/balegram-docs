---
title: کیبورد و دکمه رنگی
lead: ساخت دکمه‌های inline و reply با ردیف‌های تو‌در‌تو و API ساده‌ی شبیه Telethon.
---

## دو نوع کیبورد

| نوع | کجا نمایش داده می‌شود؟ | وقتی بزنی چه می‌شود؟ |
|---|---|---|
| **Inline** (`InlineKeyboardMarkup`) | **زیر پیام** | رویداد `callback_query` می‌آید (یا لینک باز می‌شود) |
| **Reply** (`ReplyKeyboardMarkup`) | **جای کیبورد گوشی** | متن دکمه به‌صورت یک پیام معمولی فرستاده می‌شود |

## دکمه‌ی inline

```python
from baleropy import Button, F
from baleropy.filters import Command
from baleropy.types import CallbackQuery, Message


@dp.message(Command("menu"))
async def menu(message: Message):
    buttons = [
        [Button.inline("👍 پسندیدم", "like"), Button.url("🌐 سایت", "https://ble.ir")],
    ]
    await message.answer("نظرت چیه؟", buttons=buttons)


@dp.callback_query(F.data == "like")
async def like(query: CallbackQuery):
    await query.answer("ممنون ❤️")
```

`Button.inline` برای callback و `Button.url` برای باز کردن لینک است. هر دکمه‌ی inline یک کار انجام می‌دهد:
ارسال `callback_data`، باز کردن `url` یا `web_app`، یا کپی `copy_text`.

| سازنده | کاربرد |
|---|---|
| `Button.inline(text, data)` | دکمه‌ی callback؛ `data` می‌تواند رشته یا شیء [CallbackData](/guide/callback-data) باشد |
| `Button.url(text, url)` | دکمه‌ی لینک |
| `Button.web_app(text, url)` | دکمه‌ی مینی‌اپ |
| `Button.copy_text(text, value)` | کپی متن |
| `Button.text(text, ...)` | دکمه‌ی کیبورد reply |
| `style=` | رنگ دکمه؛ برای نمونه بخش دکمه‌های رنگی را ببینید |

## چیدمان ردیف‌ها

چیدمان را با فهرست‌های تو‌در‌تو مشخص کنید؛ هر فهرست داخلی یک ردیف است. فهرست ساده هم یک ردیف می‌سازد:

```python
buttons = [
    [Button.inline("بله", "yes"), Button.inline("نه", "no")],  # ردیف اول: ۲ دکمه
    [Button.inline("بعداً", "later")],                        # ردیف دوم: ۱ دکمه
]
await message.answer("انتخاب کن:", buttons=buttons)
```

برای تولید پویای دکمه‌ها، `InlineKeyboardBuilder` و `ReplyKeyboardBuilder` هم در دسترس‌اند؛ با `adjust(1)` می‌توانید هر دکمه را در یک ردیف بگذارید. این سازنده‌ها همچنان با `reply_markup=builder.as_markup()` استفاده می‌شوند.
هر دو روش در `message.answer()`، `message.reply()` و `bot.send_message()` قابل استفاده‌اند؛ `buttons` و `reply_markup` را هم‌زمان ندهید.

::: note محدودیت‌ها
حداکثر ۸ دکمه در هر ردیف و ۱۰۰ دکمه در کل. بیشتر از آن `ValueError` می‌دهد.
:::

## 🎨 دکمه‌های رنگی

بله در نسخه‌ی آزمایشی (بتا) دکمه‌های رنگی را اضافه کرده است. با پارامتر `style` رنگ را تعیین می‌کنید:

| `style` | رنگ |
|---|---|
| `"success"` یا `ButtonStyle.SUCCESS` | 🟢 سبز |
| `"danger"` یا `ButtonStyle.DANGER` | 🔴 قرمز |
| `"primary"` یا `ButtonStyle.PRIMARY` | 🔵 آبی |
| *(بدون style)* | ظاهر معمولی |

```python
from baleropy.utils import InlineKeyboardBuilder
from baleropy.types import ButtonStyle

kb = InlineKeyboardBuilder()
kb.button(text="تایید ✅", callback_data="ok",   style=ButtonStyle.SUCCESS)
kb.button(text="حذف 🗑",  callback_data="del",  style=ButtonStyle.DANGER)
kb.button(text="ادامه",   callback_data="next", style="primary")      # رشته هم می‌شود
kb.button(text="معمولی",  callback_data="plain")
kb.adjust(2, 2)
await message.answer("انتخاب کن:", reply_markup=kb.as_markup())
```

روی دکمه‌های زیر بزنید تا حس کنید (دموی شبیه‌ساز):

::: widget buttons
:::

::: warn کلاینت‌های قدیمی
فقط نسخه‌های جدید بله رنگ را نشان می‌دهند. در نسخه‌های قدیمی `style` نادیده گرفته می‌شود و دکمه‌ی معمولی دیده می‌شود؛ پس **معنی دکمه را فقط به رنگ نسپارید** (متن یا ایموجی هم بگذارید). رنگ روی کیبورد reply هنوز تأیید نشده است.
:::

::: tip کجا چه رنگی؟
سبز برای تایید و عملیات مثبت، قرمز برای حذف و عملیات خطرناک، آبی برای ادامه و گزینه‌ی اصلی.
:::

## کیبورد reply

```python
from baleropy import Button
from baleropy.types import ReplyKeyboardRemove


@dp.message(Command("share"))
async def share(message: Message):
    buttons = [
        [Button.text("📞 ارسال شماره‌ام", request_contact=True)],
        [Button.text("📍 ارسال موقعیتم", request_location=True)],
        [Button.text("❌ بستن")],
    ]
    await message.answer("یکی را انتخاب کن:", buttons=buttons)


@dp.message(F.text == "❌ بستن")
async def close(message: Message):
    await message.answer("بسته شد", reply_markup=ReplyKeyboardRemove())    # حذف کیبورد


@dp.message(F.contact)
async def got_contact(message: Message):
    await message.answer(f"شماره‌ات: {message.contact.phone_number}")


@dp.message(F.location)
async def got_location(message: Message):
    await message.answer(f"📍 {message.location.latitude}, {message.location.longitude}")
```

| گزینه‌ی `Button.text()` | کار |
|---|---|
| `text` | متن دکمه (وقتی بزنی، همین متن فرستاده می‌شود) |
| `request_contact=True` | درخواست شماره‌ی تماس کاربر |
| `request_location=True` | درخواست موقعیت مکانی |
| `web_app` | باز کردن مینی‌اپ |
| `style` | رنگ (تأییدنشده برای reply) |

## ویرایش دکمه‌ها بعد از ارسال

با `edit_reply_markup` فقط کیبورد را عوض کنید (مثلاً شمارنده‌ی نظرسنجی):

```python
@dp.callback_query(F.data == "vote")
async def vote(query: CallbackQuery):
    counts["yes"] += 1
    kb = InlineKeyboardBuilder().button(text=f"👍 ({counts['yes']})", callback_data="vote")
    await query.message.edit_reply_markup(kb.as_markup())
    await query.answer("رأی ثبت شد")
```

یا متن و کیبورد را هم‌زمان: `await query.message.edit_text("متن جدید", reply_markup=kb.as_markup())`.

::: tip خطای «پیام تغییری نکرده»
اگر متن و کیبورد جدید دقیقاً با قبلی یکسان باشد، بله `400 Bad Request` می‌دهد. با `try/except BaleBadRequest` نادیده‌اش بگیرید.
:::

## کپی متن با یک ضربه

```python
kb.button(text="کپی کد تخفیف", copy_text="OFF2025")
```

## مثال کامل: شمارنده‌ی رنگی

```python
def counter_kb(n: int):
    kb = InlineKeyboardBuilder()
    kb.button(text="➖", callback_data=f"c:{n - 1}", style="danger")
    kb.button(text=str(n), callback_data="noop")
    kb.button(text="➕", callback_data=f"c:{n + 1}", style="success")
    return kb.as_markup()


@dp.message(Command("counter"))
async def counter(message: Message):
    await message.answer("شمارنده", reply_markup=counter_kb(0))


@dp.callback_query(F.data.startswith("c:"))
async def change(query: CallbackQuery):
    n = int(query.data.split(":")[1])
    await query.message.edit_reply_markup(counter_kb(n))
    await query.answer()


@dp.callback_query(F.data == "noop")
async def noop(query: CallbackQuery):
    await query.answer()
```

## خلاصه

- inline زیر پیام (callback)، reply جای کیبورد (متن).
- `Button.inline(...)` برای دکمه inline و `Button.text(...)` برای کیبورد reply.
- هر فهرست داخلی در `buttons=[...]` یک ردیف است.
- `InlineKeyboardBuilder().button(...).adjust(...).as_markup()`.
- `style="success" | "danger" | "primary"` برای رنگ.
- بعدی: [CallbackData](/guide/callback-data).

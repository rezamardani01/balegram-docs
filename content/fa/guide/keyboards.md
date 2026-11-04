---
title: کیبورد و دکمه رنگی
lead: دکمه‌های inline زیر پیام، کیبورد پاسخ (reply) و دکمه‌های رنگی سبز، قرمز و آبی؛ با سازنده‌های ساده.
---

## دو نوع کیبورد

| نوع | کجا نمایش داده می‌شود؟ | وقتی بزنی چه می‌شود؟ |
|---|---|---|
| **Inline** (`InlineKeyboardMarkup`) | **زیر پیام** | رویداد `callback_query` می‌آید (یا لینک باز می‌شود) |
| **Reply** (`ReplyKeyboardMarkup`) | **جای کیبورد گوشی** | متن دکمه به‌صورت یک پیام معمولی فرستاده می‌شود |

## دکمه‌ی inline

```python
from baleropy import F
from baleropy.filters import Command
from baleropy.types import CallbackQuery, Message
from baleropy.utils import InlineKeyboardBuilder


@dp.message(Command("menu"))
async def menu(message: Message):
    kb = InlineKeyboardBuilder()
    kb.button(text="👍 پسندیدم", callback_data="like")
    kb.button(text="🌐 سایت", url="https://ble.ir")
    await message.answer("نظرت چیه؟", reply_markup=kb.as_markup())


@dp.callback_query(F.data == "like")
async def like(query: CallbackQuery):
    await query.answer("ممنون ❤️")
```

هر دکمه **فقط یکی** از این‌ها را دارد: `callback_data`، `url`، `web_app` یا `copy_text`.

| پارامتر `button()` | کار |
|---|---|
| `text` | متن روی دکمه |
| `callback_data` | رشته‌ی ۱ تا ۶۴ بایت (یا شیء [CallbackData](/guide/callback-data)) |
| `url` | باز کردن لینک |
| `web_app` | باز کردن مینی‌اپ (آدرس HTTPS) |
| `copy_text` | کپی متن داخل کلیپ‌بورد کاربر (۱ تا ۲۵۶ نویسه) |
| `style` | رنگ دکمه؛ پایین‌تر |

## چیدمان: adjust، row، add

`button()` دکمه‌ها را پشت‌سرهم اضافه می‌کند؛ با `adjust` چیدمان را می‌دهید:

```python
kb = InlineKeyboardBuilder()
for i in range(1, 8):
    kb.button(text=str(i), callback_data=f"n:{i}")

kb.adjust(3, 2)                  # ردیف اول ۳ دکمه، دوم ۲ دکمه، بقیه ۲تایی
kb.adjust(3, 2, repeat=True)     # الگو را تکرار کن: ۳،۲،۳،۲،...
```

```text
adjust(3, 2):          [1][2][3]
                       [4][5]
                       [6][7]
```

| متد | کار |
|---|---|
| `adjust(*sizes, repeat=False)` | چیدمان مجدد همه‌ی دکمه‌ها |
| `row(*buttons, width=8)` | یک ردیف جدید از دکمه‌های آماده |
| `add(*buttons)` | افزودن به ردیف آخر |
| `attach(other_builder)` | چسباندن ردیف‌های یک سازنده‌ی دیگر |
| `copy()` | یک کپی مستقل |
| `from_markup(markup)` | شروع از کیبورد موجود (مثلاً `message.reply_markup`) |
| `as_markup()` | ساخت کیبورد نهایی برای `reply_markup` |

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
from baleropy.types import ReplyKeyboardRemove
from baleropy.utils import ReplyKeyboardBuilder


@dp.message(Command("share"))
async def share(message: Message):
    kb = ReplyKeyboardBuilder()
    kb.button(text="📞 ارسال شماره‌ام", request_contact=True)
    kb.button(text="📍 ارسال موقعیتم", request_location=True)
    kb.button(text="❌ بستن")
    kb.adjust(2, 1)
    await message.answer("یکی را انتخاب کن:", reply_markup=kb.as_markup())


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

| پارامتر `ReplyKeyboardBuilder.button()` | کار |
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
- `InlineKeyboardBuilder().button(...).adjust(...).as_markup()`.
- `style="success" | "danger" | "primary"` برای رنگ.
- بعدی: [CallbackData](/guide/callback-data).

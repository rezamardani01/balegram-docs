---
title: فیلتر جادویی F
lead: با F هر شرطی روی پیام را مثل یک عبارت معمولی پایتون می‌نویسید. بدون تعریف تابع، بدون کلاس.
---

## ایده

`F` یعنی «فیلد». به‌جای نوشتن `lambda m: m.text == "سلام"` می‌نویسید `F.text == "سلام"`. هر نقطه به یک ویژگی پیام می‌رود و هر عملگر یک شرط می‌سازد:

```python
from balegram import F

@dp.message(F.text == "سلام")                        # متن دقیقاً «سلام»
@dp.message(F.text.startswith("/"))                  # با / شروع شود
@dp.message(F.from_user.id == 12345)                 # فرستنده‌ی مشخص
@dp.message(F.chat.type == "private")                # چت خصوصی
@dp.message(F.photo)                                 # عکس دارد
@dp.message(F.reply_to_message)                      # ریپلای است
```

::: tip اگر ویژگی وجود نداشت؟
مهم نیست. اگر هر مرحله‌ی زنجیره وجود نداشته باشد (مثلاً `from_user` برابر `None`)، نتیجه به‌جای خطا فقط **نادرست** می‌شود. پس `F.from_user.id == 5` روی پیام کانال خطا نمی‌دهد.
:::

## همه‌ی عملگرها

### مقایسه

| عبارت | معنی |
|---|---|
| `F.text == "a"` | مساوی |
| `F.text != "a"` | نامساوی |
| `F.date > 1700000000` | بزرگتر (`<` `>=` `<=` هم هست) |
| `F.a == F.b` | مقایسه‌ی دو فیلد با هم |

### رشته و مجموعه

| عبارت | معنی |
|---|---|
| `F.text.in_({"a", "b"})` | مقدار داخل مجموعه باشد |
| `F.text.not_in({"x"})` | داخل مجموعه نباشد |
| `F.text.contains("سلام")` | شامل زیررشته |
| `F.text.startswith("hi")` | شروع با (`ignore_case=True` هم دارد) |
| `F.text.endswith("?")` | پایان با |
| `F.text.lower()` | کوچک‌کردن حروف، برای مقایسه |
| `F.text.len() > 10` | طول بیشتر از ۱۰ |
| `F.text.regexp(r"\d+")` | الگوی regex |

### کنترل و ابزار

| عبارت | معنی |
|---|---|
| `F.photo` | وجود و غیرخالی بودن |
| `F.x.is_(None)` / `F.x.is_not(None)` | مقایسه‌ی هویتی |
| `F.text.func(my_function)` | تابع دلخواه شما |
| `F.text.as_("t")` | اگر مقدار داشت، به‌عنوان آرگومان `t` به هندلر بده |

## ترکیب

```python
@dp.message(F.text & (F.chat.type == "private"))                # AND
@dp.message((F.text == "a") | (F.text == "b"))                  # OR
@dp.message(~F.text.startswith("/"), F.text)                    # NOT
@dp.message(F.photo | F.video | F.document | F.audio)           # هر نوع رسانه
```

::: warn پرانتز را فراموش نکنید
اولویت عملگرهای پایتون باعث می‌شود `F.a == 1 | F.b == 2` غلط تفسیر شود. همیشه هر شرط را در پرانتز بگذارید: `(F.a == 1) | (F.b == 2)`.
:::

::: danger از `and` / `or` / `not` استفاده نکنید
اینها در پایتون روی مقدار بولی کار می‌کنند و `F` را نمی‌توان بولی کرد. اگر استفاده کنید خطای `TypeError: MagicFilter cannot be used as a boolean` می‌گیرید. به‌جایشان `&` `|` `~` بنویسید.
:::

## Regex و گرفتن نتیجه

وقتی نتیجه‌ی یک شرط «درست ولی غیر از True» باشد (مثل Match در regex)، در آرگومان `magic_result` به هندلر می‌رسد:

```python
import re

@dp.message(F.text.regexp(r"^order[- ](\d+)$"))
async def order(message: Message, magic_result: re.Match):
    order_id = magic_result.group(1)
    await message.answer(f"سفارش {order_id} را پیدا کردم")
```

یا با `as_` اسم دلخواه بدهید:

```python
@dp.message(F.text.regexp(r"\d+").as_("number"))
async def n(message: Message, number: re.Match): ...
```

## F روی دکمه‌ها

```python
@dp.callback_query(F.data == "yes")
async def yes(query: CallbackQuery): ...

@dp.callback_query(F.data.startswith("page:"))
async def page(query: CallbackQuery):
    n = int(query.data.split(":")[1])
```

برای دکمه‌های پیچیده‌تر [CallbackData](/guide/callback-data) تمیزتر است.

## MagicData: فیلتر روی داده‌ی میدلور

اگر یک میدلور مقداری در `data` گذاشته باشد (مثلاً `is_admin`)، با `MagicData` روی آن شرط بگذارید:

```python
from balegram.filters import MagicData

@dp.message(MagicData(F.is_admin))
async def only_admins(message: Message): ...

@dp.message(MagicData(F.event_from_user.id == F.config.owner_id))
async def owner_only(message: Message): ...
```

## مثال‌های رایج

```python
# فقط متن‌های غیر دستور
@dp.message(F.text, ~F.text.startswith("/"))

# فقط در گروه، فقط ریپلای
@dp.message((F.chat.type == "group") & F.reply_to_message)

# شماره‌ی موبایل ایران
@dp.message(F.text.regexp(r"^09\d{9}$"))

# پیام کوتاه
@dp.message(F.text.len() < 20)

# فقط وقتی کاربر دقیقاً یکی از این‌هاست
ADMINS = {111, 222}
@dp.message(F.from_user.id.in_(ADMINS))
```

## خلاصه

- `F.<فیلد>` + عملگر = فیلتر.
- ویژگی ناموجود ⇒ نادرست، نه خطا.
- ترکیب فقط با `&` `|` `~` و پرانتز.
- بعدی: [فیلتر کاستوم](/guide/custom-filters).

---
title: فیلتر کاستوم
lead: وقتی شرط شما با F یا فیلترهای آماده نمی‌شود، فیلتر خودتان را بنویسید: با یک کلاس، یا حتی یک تابع ساده.
---

## ساده‌ترین راه: یک تابع

هر تابعی که `True`/`False` (یا `dict`) برگرداند فیلتر است. تابع می‌تواند `async` باشد:

```python
def is_long(message) -> bool:
    return len(message.text or "") > 100

@dp.message(is_long)
async def long_text(message: Message):
    await message.answer("پیام بلندی بود!")

# lambda هم می‌شود
@dp.message(lambda m: m.text and m.text.isdigit())
async def digits(message: Message): ...
```

تابع فیلتر هم مثل هندلر **آرگومان‌های مورد نیازش را** می‌گیرد (رویداد اولین آرگومان است):

```python
async def is_admin(message, bot, event_from_user) -> bool:
    member = await bot.get_chat_member(message.chat.id, event_from_user.id)
    return member.is_admin
```

## فیلتر به‌صورت کلاس

برای فیلتر با پارامتر یا حالت داخلی، از `Filter` ارث ببرید:

```python title="filters.py"
from typing import Any
from balegram.filters import Filter


class MinLength(Filter):
    def __init__(self, n: int):
        self.n = n

    async def __call__(self, event: Any, **data: Any) -> bool:
        text = getattr(event, "text", None) or ""
        return len(text) >= self.n
```

```python
@dp.message(MinLength(50))
async def long(message: Message): ...
```

`Filter` سه عملگر `&` `|` `~` را خودکار دارد:

```python
@dp.message(MinLength(10) & ~Command("start"))
```

## فیلتری که داده می‌دهد

اگر `dict` برگردانید، کلیدهایش به‌عنوان آرگومان به هندلر می‌رسند. مثل `Command` که `command` را می‌دهد:

```python
class ExtractNumbers(Filter):
    async def __call__(self, event, **data):
        import re
        numbers = [int(n) for n in re.findall(r"\d+", getattr(event, "text", "") or "")]
        return {"numbers": numbers} if numbers else False     # False = رد


@dp.message(ExtractNumbers())
async def total(message: Message, numbers: list[int]):
    await message.answer(f"مجموع: {sum(numbers)}")
```

## فیلتر با دسترسی به دیتابیس یا Bot

فیلتر مثل هندلر آرگومان‌های داده را (`bot`، `state`، مقدارهای `Dispatcher(...)` و ...) می‌گیرد:

```python
class IsPremium(Filter):
    async def __call__(self, event, db, event_from_user=None, **kw):
        # db را وقتی ساختید: Dispatcher(db=my_db)
        user = await db.get_user(event_from_user.id)
        return {"user": user} if user and user.premium else False


@dp.message(Command("vip"), IsPremium())
async def vip(message: Message, user):
    await message.answer(f"سلام {user.name}، خوش آمدی 👑")
```

## نکات و تله‌ها

::: warn فیلتر نباید کند باشد
فیلترها برای **هر** پیامی که به هندلر می‌رسد اجرا می‌شوند. کارهای سنگین (کوئری دیتابیس، API) را بعد از فیلترهای ارزان بگذارید.
:::

::: tip از None محافظت کنید
`event` ممکن است `Message`، `CallbackQuery` و ... باشد. با `getattr(event, "text", None)` یا `isinstance` مطمئن شوید نوع رویداد درست است.
:::

## ثبت فیلتر برای همه‌ی هندلرهای یک Router

```python
router.message.filter(MinLength(3))          # همه‌ی هندلرهای message این Router
```

## مثال کامل: فیلتر «ساعت کاری»

```python
from datetime import datetime, time as dtime

class WorkingHours(Filter):
    def __init__(self, start=dtime(9), end=dtime(17)):
        self.start, self.end = start, end

    async def __call__(self, event, **data) -> bool:
        return self.start <= datetime.now().time() <= self.end


@dp.message(Command("support"), WorkingHours())
async def support(message: Message):
    await message.answer("پشتیبان‌ها آنلاین هستند، پیامتان را بفرستید.")

@dp.message(Command("support"))
async def closed(message: Message):
    await message.answer("🕘 ساعت کاری ۹ تا ۱۷ است.")
```

## خلاصه

- تابع ساده یا کلاس `Filter`.
- `dict` برگردانید تا داده به هندلر برسد.
- سریع بنویسید و ارزان‌ها را اول بگذارید.
- بعدی: [میدلورها](/guide/middlewares).

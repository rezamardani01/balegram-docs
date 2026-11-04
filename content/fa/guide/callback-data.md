---
title: CallbackData
lead: به‌جای ساختن و تجزیه‌ی دستی رشته‌هایی مثل "item:5:buy"، یک کلاس تایپ‌دار بنویسید و pack/unpack خودکار انجام شود.
---

## مشکل رشته‌ی دستی

`callback_data` یک رشته‌ی حداکثر ۶۴ بایتی است. اگر دستی بسازید:

```python
kb.button(text="خرید", callback_data=f"item:{item.id}:buy")       # ساختن
...
_, item_id, action = query.data.split(":")                         # تجزیه
item_id = int(item_id)                                             # تبدیل نوع... و اگر خراب بود؟
```

خطاخیز و تکراری است. `CallbackData` همه را حل می‌کند.

## تعریف

```python title="callbacks.py"
from balegram.filters import CallbackData


class ItemCb(CallbackData, prefix="item"):
    id: int
    action: str
```

- `prefix` ابتدای رشته است و باید یکتا باشد (و بدون `:`).
- فیلدها نوع دارند؛ تبدیل (مثلاً `str → int`) و اعتبارسنجی را pydantic انجام می‌دهد.

## استفاده

### ساخت دکمه

```python
from balegram.utils import InlineKeyboardBuilder

kb = InlineKeyboardBuilder()
kb.button(text="🛒 خرید", callback_data=ItemCb(id=5, action="buy"))     # شیء مستقیم
kb.button(text="ℹ️ جزئیات", callback_data=ItemCb(id=5, action="info"))
kb.adjust(2)
```

رشته‌ی نهایی: `item:5:buy`.

### گرفتن در هندلر

```python
@router.callback_query(ItemCb.filter())
async def any_item(query: CallbackQuery, callback_data: ItemCb):
    await query.answer(f"آیتم {callback_data.id}: {callback_data.action}")


@router.callback_query(ItemCb.filter(F.action == "buy"))               # با شرط F
async def buy(query: CallbackQuery, callback_data: ItemCb):
    ...
```

شیء بازشده با نام `callback_data` به هندلر تزریق می‌شود. اگر رشته مال `ItemCb` نباشد یا نوع فیلدها خراب باشد، فیلتر به‌سادگی رد می‌کند (خطایی نمی‌دهد).

## انواع پشتیبانی‌شده

| نوع | ذخیره در رشته |
|---|---|
| `int`، `float`، `str` | همان مقدار |
| `bool` | `1` / `0` |
| `Enum` | مقدار enum |
| `Optional[...]` یا `X \| None` | مقدار خالی (`item:5:`) برای `None` |
| `UUID` و ... | هر چه pydantic از رشته بسازد |

```python
from enum import Enum

class Action(str, Enum):
    BUY = "buy"
    INFO = "info"

class ItemCb(CallbackData, prefix="item"):
    id: int
    action: Action
    gift: bool = False
    note: str | None = None

ItemCb(id=5, action=Action.BUY, gift=True).pack()    # "item:5:buy:1:"
ItemCb.unpack("item:5:buy:1:")                       # شیء کامل
```

## محدودیت‌ها

::: warn سقف ۶۴ بایت
بله `callback_data` را حداکثر ۶۴ بایت (UTF-8) می‌پذیرد. `pack()` اگر بیشتر شود `ValueError` می‌دهد. فارسی هر حرف ۲ بایت است؛ پس مقدارهای متنی بلند را در دیکشنری/دیتابیس نگه دارید و فقط شناسه‌ی عددی را بفرستید.
:::

- مقدار فیلد رشته‌ای **نباید** شامل جداکننده (`:`) باشد؛ وگرنه `ValueError`.
- جداکننده را می‌توانید عوض کنید: `class X(CallbackData, prefix="x", sep="|")`.

## مثال کامل: صفحه‌بندی

```python
from balegram import Router
from balegram.filters import CallbackData, Command
from balegram.types import CallbackQuery, Message
from balegram.utils import InlineKeyboardBuilder

router = Router()
ITEMS = [f"محصول {i}" for i in range(1, 24)]
PER_PAGE = 5


class PageCb(CallbackData, prefix="page"):
    n: int


def page_view(n: int):
    chunk = ITEMS[n * PER_PAGE:(n + 1) * PER_PAGE]
    text = f"📦 صفحه {n + 1}\n\n" + "\n".join(f"• {x}" for x in chunk)
    kb = InlineKeyboardBuilder()
    if n > 0:
        kb.button(text="◀️ قبلی", callback_data=PageCb(n=n - 1), style="primary")
    if (n + 1) * PER_PAGE < len(ITEMS):
        kb.button(text="بعدی ▶️", callback_data=PageCb(n=n + 1), style="primary")
    return text, kb.as_markup()


@router.message(Command("list"))
async def list_items(message: Message):
    text, markup = page_view(0)
    await message.answer(text, reply_markup=markup)


@router.callback_query(PageCb.filter())
async def turn(query: CallbackQuery, callback_data: PageCb):
    text, markup = page_view(callback_data.n)
    await query.message.edit_text(text, reply_markup=markup)
    await query.answer()
```

## خلاصه

- کلاس با `prefix` + فیلدهای تایپ‌دار.
- ساخت: `callback_data=ItemCb(...)`؛ گرفتن: `ItemCb.filter()` و آرگومان `callback_data`.
- سقف ۶۴ بایت و بدون `:` در مقدارها.
- بعدی: [ارسال و دریافت فایل](/guide/files).

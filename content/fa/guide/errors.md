---
title: خطاها و محدودیت نرخ
lead: چه خطاهایی ممکن است پیش بیاید، چطور بگیریمشان، و چطور baleropy خودش محدودیت نرخ (۴۲۹) را مدیریت می‌کند.
---

## سلسله‌مراتب استثناها

همه‌ی خطاهای baleropy از `BaleropyError` ارث می‌برند:

```text
BaleropyError
├── DetailedError
│   ├── BaleAPIError            ← بله جواب "ok: false" داد
│   │   ├── BaleBadRequest      (400)
│   │   ├── BaleUnauthorized    (401: توکن غلط)
│   │   ├── BaleForbidden       (403: دسترسی ندارم)
│   │   ├── BaleNotFound        (404)
│   │   ├── BaleRetryAfter      (429: خیلی سریع!)
│   │   └── BaleServerError     (5xx)
│   ├── BaleNetworkError        ← قطعی شبکه / timeout
│   └── ClientDecodeError       ← پاسخ بله قابل فهم نبود
├── SkipHandler                 ← خودتان پرتاب می‌کنید
└── CancelHandler               ← در میدلور
```

`BaleAPIError` این فیلدها را دارد: `method` (نام متد)، `message`، `error_code`، `parameters`.

## گرفتن خطا در همان هندلر

```python
from baleropy.exceptions import BaleForbidden, BaleBadRequest, BaleAPIError

@dp.message(Command("hi"))
async def hi(message: Message):
    try:
        await bot.send_message(OTHER_USER_ID, "سلام!")
    except BaleForbidden:
        await message.answer("این کاربر ربات را بلاک کرده یا هنوز /start نزده 🤷")
    except BaleBadRequest as e:
        await message.answer(f"درخواست نامعتبر: {e.message}")
    except BaleAPIError as e:
        await message.answer(f"بله خطا داد [{e.error_code}]: {e.message}")
```

## هندلر خطای سراسری

هر خطای مدیریت‌نشده‌ی یک هندلر به ناظر `error` می‌رسد:

```python
from baleropy.dispatcher import ErrorEvent
from baleropy.filters import ExceptionTypeFilter, ExceptionMessageFilter
from baleropy.exceptions import BaleForbidden, BaleAPIError


@dp.error(ExceptionTypeFilter(BaleForbidden))
async def forbidden(event: ErrorEvent):
    print("دسترسی ندارم، نادیده می‌گیرم")
    return True


@dp.error(ExceptionMessageFilter(r"message is not modified"))
async def not_modified(event: ErrorEvent):
    return True                            # بی‌خطر


@dp.error()                                # همه‌ی خطاهای دیگر
async def other(event: ErrorEvent, exception: Exception):
    msg = event.update.message
    if msg:
        await msg.answer("😵 مشکلی پیش آمد، دوباره امتحان کن.")
    raise exception                        # یا return True برای بلعیدن
```

| آرگومان | معنی |
|---|---|
| `event` (`ErrorEvent`) | `event.update` آپدیت اصلی، `event.exception` خود خطا |
| `exception` | خود استثنا (تزریق‌شده) |

::: warn اگر هندلر خطا چیزی برنگرداند
وقتی یک هندلر خطا اجرا می‌شود، نتیجه‌اش «مدیریت شد» حساب می‌شود (حتی بدون `return`). اگر می‌خواهید خطا دوباره پرتاب شود، خودتان `raise exception` کنید. اگر **هیچ** هندلر خطایی مطابق نبود، خطا به لایه‌ی بالا می‌رود و در polling به‌صورت لاگ ثبت می‌شود.
:::

## محدودیت نرخ (۴۲۹)

بله برای ارسال پیام محدودیت نرخ دارد. وقتی از حد بگذرید `429 Too Many Requests` با `retry_after` (ثانیه) می‌دهد. baleropy **خودکار** این را مدیریت می‌کند:

1. با اولین ۴۲۹، **همه‌ی درخواست‌های آن ربات** تا پایان `retry_after` متوقف می‌شوند (نه فقط همان یکی؛ وگرنه همه با هم دوباره می‌زدند).
2. بعد درخواست دوباره ارسال می‌شود.
3. حداکثر ۵ بار تلاش و فقط اگر `retry_after` از ۶۰ ثانیه بیشتر نباشد؛ وگرنه `BaleRetryAfter` پرتاب می‌شود.

```python
from baleropy import Bot
from baleropy.client import AiohttpSession

session = AiohttpSession(
    retry_on_flood=60,        # تا چند ثانیه صبر کن (۰ = خاموش)
    max_flood_retries=5,      # حداکثر تعداد تلاش
    timeout=60,               # timeout هر درخواست (ثانیه)
)
bot = Bot("TOKEN", session=session)
```

اگر خودتان کنترل می‌خواهید:

```python
from baleropy.exceptions import BaleRetryAfter

session = AiohttpSession(retry_on_flood=0)            # خودکار نباشد
try:
    await bot.send_message(chat_id, text)
except BaleRetryAfter as e:
    await asyncio.sleep(e.retry_after)
```

::: tip ارسال انبوه؟
برای اعلان‌ها به هزاران کاربر از [Business API](/guide/business) استفاده کنید؛ سهمیه‌ی جدا و بالاتری دارد.
:::

## خطاهای رایج و علتشان

| خطا | معمولاً یعنی |
|---|---|
| `401 Unauthorized` | توکن اشتباه یا باطل‌شده |
| `403 permission_denied` | کاربر ربات را بلاک کرده / ربات در گروه اجازه‌ی نوشتن ندارد / کاربر هنوز `/start` نزده |
| `400 chat not found` | شناسه‌ی چت اشتباه است |
| `400 message is not modified` | متن و کیبورد جدید با قبلی یکی است |
| `400 unsupported peer type` | متد مخصوص گروه را روی چت خصوصی صدا زده‌اید (مثل `getChatMember`) |
| `429` | خیلی سریع؛ خودکار مدیریت می‌شود |
| `ClientDecodeError` | پاسخ غیرمنتظره؛ جزئیات در `.data` و `.original` |
| `BaleNetworkError` | قطع اینترنت یا timeout |

## اعتبارسنجی پیش از ارسال

محدودیت‌هایی که بله مستند کرده (متن ۴۰۹۶ نویسه، پاسخ callback ۲۰۰ نویسه و ...) **قبل از ارسال** چک می‌شود و `pydantic.ValidationError` می‌دهد:

```python
from pydantic import ValidationError

try:
    await message.answer("x" * 5000)
except ValidationError:
    for chunk in split_text("x" * 5000):          # از ابزار کمکی
        await message.answer(chunk)
```

## لاگ

baleropy از `logging` استاندارد استفاده می‌کند (نام لاگرها: `baleropy.dispatcher`، `baleropy.middleware`، `baleropy.webhook`):

```python
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
```

خطاهای API هنگام polling به‌صورت **یک خط هشدار** لاگ می‌شوند (بدون Traceback طولانی)؛ خطاهای ناخواسته با Traceback کامل.

## خلاصه

- `BaleAPIError` و زیرکلاس‌ها را بگیرید؛ `@dp.error()` برای سراسری.
- ۴۲۹ خودکار با مکث مشترک مدیریت می‌شود.
- حدود بله پیش از ارسال اعتبارسنجی می‌شوند.
- بعدی: [پرداخت](/guide/payments).

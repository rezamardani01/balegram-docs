---
title: استثناها
lead: همه‌ی استثناهای baleropy، ویژگی‌هایشان و کدهای HTTP متناظر.
---

همه از `baleropy.exceptions` import می‌شوند. آموزش: [خطاها و محدودیت نرخ](/guide/errors).

```python
from baleropy.exceptions import BaleAPIError, BaleForbidden, BaleRetryAfter
```

## جدول

| استثنا | پایه | کد | چه زمانی؟ |
|---|---|---|---|
| `BaleropyError` | `Exception` | — | پایه‌ی همه‌ی خطاهای کتابخانه |
| `DetailedError` | `BaleropyError` | — | خطای دارای `message` |
| `BaleAPIError` | `DetailedError` | هر کد | بله `ok: false` داد |
| `BaleBadRequest` | `BaleAPIError` | 400 | درخواست نامعتبر |
| `BaleUnauthorized` | `BaleAPIError` | 401 | توکن اشتباه/باطل |
| `BaleForbidden` | `BaleAPIError` | 403 | دسترسی ندارد (کاربر بلاک کرده، ربات اجازه‌ی نوشتن ندارد) |
| `BaleNotFound` | `BaleAPIError` | 404 | یافت نشد |
| `BaleRetryAfter` | `BaleAPIError` | 429 | محدودیت نرخ؛ `.retry_after` ثانیه |
| `BaleServerError` | `BaleAPIError` | 5xx | خطای سرور بله |
| `BaleNetworkError` | `DetailedError` | — | قطعی شبکه یا timeout |
| `ClientDecodeError` | `DetailedError` | — | پاسخ قابل فهم/اعتبارسنجی نبود |
| `SkipHandler` | `BaleropyError` | — | (شما) هندلر را رد کن |
| `CancelHandler` | `BaleropyError` | — | (میدلور) رویداد را حذف کن |

## ویژگی‌ها

### BaleAPIError

| ویژگی | معنی |
|---|---|
| `.method` | نام متد Bot API، مثلاً `"sendMessage"` |
| `.message` | توضیح بله (`description`) |
| `.error_code` | کد خطا (عدد) |
| `.parameters` | `dict` اضافه (مثلاً `retry_after`) |

```python
try:
    await bot.send_message(chat_id, "سلام")
except BaleAPIError as e:
    print(e.method, e.error_code, e.message)
```

### BaleRetryAfter

```python
except BaleRetryAfter as e:
    await asyncio.sleep(e.retry_after)
```

### ClientDecodeError

| ویژگی | معنی |
|---|---|
| `.original` | استثنای اصلی (معمولاً خطای اعتبارسنجی pydantic) |
| `.data` | داده‌ی خامی که رمزگشایی نشد |

## خطاهایی که از pydantic می‌آیند

اگر آرگومان‌های یک متد با محدودیت‌های مستند بله نخواند (مثلاً متن بیش از ۴۰۹۶ نویسه)، پیش از ارسال `pydantic.ValidationError` می‌دهد؛ این `BaleropyError` نیست.

## مدیریت پیشنهادی

```python
from baleropy.exceptions import BaleForbidden, BaleAPIError, BaleNetworkError

try:
    await bot.send_message(user_id, text)
except BaleForbidden:
    mark_user_blocked(user_id)           # دوباره تلاش نکن
except BaleNetworkError:
    schedule_retry(user_id, text)        # مشکل موقت
except BaleAPIError as e:
    log.warning("API error %s: %s", e.error_code, e.message)
```

بعدی: [دستور پخت](/cookbook/quiz-bot).

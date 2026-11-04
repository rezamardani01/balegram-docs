---
title: مرجع میدلورها
lead: BaseMiddleware، سه میدلور آماده، نقاط ثبت و میدلور درخواست‌های خروجی (Session).
---

آموزش مفهومی: [میدلورها](/guide/middlewares).

## BaseMiddleware

```python
from balegram.dispatcher import BaseMiddleware

class MyMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data): ...
```

| آرگومان | نوع | معنی |
|---|---|---|
| `handler` | `async (event, data) -> Any` | ادامه‌ی زنجیره |
| `event` | `Message` / `CallbackQuery` / ... (یا `Update` برای `dp.update`) | رویداد |
| `data` | `dict` | داده‌ی مشترک؛ تغییرش به هندلر می‌رسد |

هر تابع async با همین امضا هم میدلور است.

## نقاط ثبت

| کد | چه زمانی؟ |
|---|---|
| `dp.update.outer_middleware(mw)` | دور پردازش **هر** آپدیت |
| `observer.outer_middleware(mw)` | هر رویدادِ آن نوع در آن Router، پیش از فیلتر |
| `observer.middleware(mw)` | پس از انتخاب هندلر (inner)؛ Routerهای والد پیش از فرزند |
| `session.middleware(mw)` | دور هر **درخواست خروجی** به بله |

`observer` یکی از `router.message`، `edited_message`، `callback_query`، `pre_checkout_query`، `error` است.

## LoggingMiddleware

```python
LoggingMiddleware(level=logging.INFO)
```

هر رویداد را با کاربر و زمان پردازش لاگ می‌کند (لاگر `balegram.middleware`). خطاها را با Traceback لاگ و دوباره پرتاب می‌کند.

## ThrottlingMiddleware

```python
ThrottlingMiddleware(rate=1.0, on_throttled=None, max_tracked=10_000)
```

| پارامتر | معنی |
|---|---|
| `rate` | حداقل فاصله‌ی دو رویداد یک کاربر (ثانیه) |
| `on_throttled` | `async (event, data)`؛ **فقط بار اول** هر بازه صدا زده می‌شود |
| `max_tracked` | سقف کاربران نگهداری‌شده در حافظه (قدیمی‌ها پاک می‌شوند) |

رویدادهای اضافه با `CancelHandler` حذف می‌شوند. رویدادهای بدون `event_from_user` عبور می‌کنند.

## CallbackAnswerMiddleware

```python
CallbackAnswerMiddleware(text=None, show_alert=None)
```

پس از اجرای هندلر، اگر `query.is_answered` نادرست باشد، خودش `answer(text, show_alert)` را صدا می‌زند. مناسب برای اینکه دکمه‌ها هیچ‌وقت در حالت «در انتظار» نمانند.

```python
dp.callback_query.outer_middleware(CallbackAnswerMiddleware())
```

## ترتیب اجرا

```text
dp.update outer           (UserContext، FSM و میدلورهای شما)
  └ router outer          (والد → فرزند)
      └ فیلترهای هندلر
          └ inner         (والد → فرزند)
              └ هندلر
```

`dp.update` همیشه دو میدلور درونی دارد که خودکار ثبت می‌شوند: `UserContextMiddleware` (`event_from_user`، `event_chat`) و `FSMContextMiddleware` (`state`، `raw_state`).

## استثناهای کنترلی

| استثنا | اثر |
|---|---|
| `CancelHandler` | رویداد بی‌صدا حذف می‌شود (`UNHANDLED`) |
| `SkipHandler` | (در هندلر) به هندلر بعدی برو |

## get_flag

```python
from balegram.dispatcher import get_flag
get_flag(data, "rate_limit", default=1)
```

مقدار flag هندلر انتخاب‌شده؛ فقط در میدلور **inner** (`data["handler"]` لازم است).

بعدی: [استثناها](/reference/exceptions).

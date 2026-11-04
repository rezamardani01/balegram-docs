---
title: متدها: آپدیت و ربات
lead: دریافت آپدیت، وب‌هوک، اطلاعات ربات و درخواست نظر.
---

برای ساخت ربات معمولاً لازم نیست این متدها را مستقیم صدا بزنید: `start_polling` و `SimpleRequestHandler` آن‌ها را مدیریت می‌کنند. ([اجرا: Polling و Webhook](/guide/running))

## فهرست متدها

| متد | نام در Bot API | کار |
|---|---|---|
| [`get_updates`](/reference/methods-updates?s=get_updates) | `getUpdates` | آپدیت‌ها را با long polling می‌گیرد. |
| [`set_webhook`](/reference/methods-updates?s=set_webhook) | `setWebhook` | آدرس وب‌هوک را تنظیم می‌کند. |
| [`delete_webhook`](/reference/methods-updates?s=delete_webhook) | `deleteWebhook` | وب‌هوک را حذف می‌کند (لازم برای برگشت به polling). |
| [`get_webhook_info`](/reference/methods-updates?s=get_webhook_info) | `getWebhookInfo` | وضعیت وب‌هوک فعلی را می‌دهد (`url` خالی یعنی تنظیم نشده). |
| [`get_me`](/reference/methods-updates?s=get_me) | `getMe` | اطلاعات خود ربات (شناسه، نام، username). |
| [`ask_review`](/reference/methods-updates?s=ask_review) | `askReview` | پس از چند ثانیه، از کاربر درخواست امتیاز و نظر درباره‌ی ربات می‌کند. |

::: method
## get_updates {#get_updates}
::: head getUpdates | list[Update]
:::
::: sig
await bot.get_updates(offset=None, limit=None, timeout=None)
:::

آپدیت‌ها را با long polling می‌گیرد. معمولاً لازم نیست خودتان صدا بزنید؛ `start_polling` این کار را می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `offset` | `int` | {opt} | شناسه‌ی اولین آپدیت؛ آخرین `update_id` + ۱ بدهید تا قبلی‌ها تایید شوند |
| `limit` | `int` | {opt} | ۱ تا ۱۰۰ (پیش‌فرض ۱۰۰) |
| `timeout` | `int` | {opt} | ثانیه‌ی long polling |

**خروجی:** `list[Update]`

#### مثال

```python
updates = await bot.get_updates(timeout=0)
for update in updates:
    print(update.update_id, update.event_type)
```

::: note
بله آخرین ۲۰۰۰ آپدیت را تا ۲۴ ساعت نگه می‌دارد. هم‌زمان با webhook نمی‌شود.
:::

:::

::: method
## set_webhook {#set_webhook}
::: head setWebhook | bool
:::
::: sig
await bot.set_webhook(url)
:::

آدرس وب‌هوک را تنظیم می‌کند. فقط HTTPS و پورت ۴۴۳ یا ۸۸.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `url` | `str` | {req} | آدرس HTTPS؛ رشته‌ی خالی = غیرفعال |

**خروجی:** `bool`

#### مثال

```python
await bot.set_webhook("https://bot.example.com/webhook/secret-path")
```

::: danger
بله هدر مخفی نمی‌فرستد؛ مسیر را غیرقابل حدس بگیرید (`secret_path()`).
:::

:::

::: method
## delete_webhook {#delete_webhook}
::: head deleteWebhook | bool
:::
::: sig
await bot.delete_webhook()
:::

وب‌هوک را حذف می‌کند (لازم برای برگشت به polling).

#### پارامترها

این متد پارامتری ندارد.

**خروجی:** `bool`

#### مثال

```python
await bot.delete_webhook()
```

:::

::: method
## get_webhook_info {#get_webhook_info}
::: head getWebhookInfo | WebhookInfo
:::
::: sig
await bot.get_webhook_info()
:::

وضعیت وب‌هوک فعلی را می‌دهد (`url` خالی یعنی تنظیم نشده).

#### پارامترها

این متد پارامتری ندارد.

**خروجی:** `WebhookInfo`

#### مثال

```python
info = await bot.get_webhook_info()
print(info.url or "وب‌هوک ندارد")
```

:::

::: method
## get_me {#get_me}
::: head getMe | User
:::
::: sig
await bot.get_me()      # یا  await bot.me()   # با کش
:::

اطلاعات خود ربات (شناسه، نام، username).

#### پارامترها

این متد پارامتری ندارد.

**خروجی:** `User`

#### مثال

```python
me = await bot.me()
print(f"@{me.username} ({me.id})")
```

::: tip
`bot.me()` نتیجه را کش می‌کند و فقط یک‌بار درخواست می‌فرستد.
:::

:::

::: method
## ask_review {#ask_review}
::: head askReview | bool
:::
::: sig
await bot.ask_review(user_id, delay_seconds)
:::

پس از چند ثانیه، از کاربر درخواست امتیاز و نظر درباره‌ی ربات می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `user_id` | `int` | {req} | شناسه‌ی عددی کاربر |
| `delay_seconds` | `int` | {req} | چند ثانیه بعد درخواست نمایش داده شود |

**خروجی:** `bool`

#### مثال

```python
await bot.ask_review(12345, delay_seconds=30)
```

::: note
این قابلیت از آبان ۱۴۰۴ در نسخه‌های جدید بله در دسترس است.
:::

:::

---
title: Business API
lead: برای ارسال انبوه پیام و اعلان به کاربران قبلی، بله یک API جدا با سهمیه‌ی بالاتر دارد. balegram با یک خط از آن پشتیبانی می‌کند.
---

## چرا Business API؟

ربات‌های معمولی از نظر نرخ ارسال محدودند: میزان ارسال به **تعامل کاربران در چت خصوصی** بستگی دارد. اگر بخواهید به هزاران نفر اعلان بدهید یا خارج از یک گفتگوی فعال پیام بفرستید، سهمیه‌ی عادی کافی نیست. Business API سهمیه‌ی جدا و بالاتر دارد، ولی **هزینه‌دار** است.

::: note شارژ حساب
ابتدا از پنل کسب‌وکار بله، حساب کسب‌وکار را شارژ کنید. هزینه‌ی هر پیام به‌صورت خودکار از اعتبار کم می‌شود.
:::

## استفاده

```python
from balegram import Bot

bot = Bot.business("YOUR_BOT_TOKEN")        # آدرس: tapi.bale.ai/business/bot<TOKEN>/...

await bot.send_message(user_chat_id, "سلام! تخفیف ویژه‌ی امشب 🎁")
```

همه‌چیز دیگر مثل ربات عادی است: احراز هویت، قالب درخواست و ساختار پاسخ.

## متدهای پشتیبانی‌شده

| متد | کار |
|---|---|
| `get_me` | اطلاعات ربات |
| `send_message` | متن |
| `forward_message` | فوروارد |
| `send_photo` | عکس |
| `send_video` | ویدیو |
| `send_audio` | صدا |
| `send_document` | فایل |

::: warn محدودیت‌ها
- `chat_id` فقط برای **چت خصوصی** کار می‌کند (نه گروه).
- متدهای ارسال فایل فقط **`file_id`** می‌پذیرند؛ لینک و آپلود پشتیبانی نمی‌شود. اول فایل را با ربات عادی آپلود کنید و `file_id` را بگیرید.
- متدهای دیگر (ویرایش، گروه، پرداخت و ...) در Business API وجود ندارند.
:::

## الگوی پیشنهادی: ارسال انبوه

```python
import asyncio
from balegram import Bot
from balegram.exceptions import BaleForbidden, BaleAPIError

async def broadcast(token: str, user_ids: list[int], text: str):
    ok = blocked = failed = 0
    async with Bot.business(token) as bot:
        for uid in user_ids:
            try:
                await bot.send_message(uid, text)
                ok += 1
            except BaleForbidden:
                blocked += 1                 # کاربر ربات را بلاک کرده؛ از لیست حذفش کنید
            except BaleAPIError:
                failed += 1
            await asyncio.sleep(0.05)        # فشار نیاور؛ ۴۲۹ را هم balegram مدیریت می‌کند
    return ok, blocked, failed
```

::: tip ۴۲۹ را خودکار مدیریت می‌کند
اگر باز هم به سقف رسیدید، balegram [خودکار صبر می‌کند](/guide/errors) و دوباره می‌فرستد.
:::

## ترکیب ربات عادی و Business

```python
chat_bot = Bot("TOKEN")                  # برای گفتگو (polling)
news_bot = Bot.business("TOKEN")         # همان توکن، فقط برای اعلان‌های انبوه
```

یک توکن را می‌توانید برای هر دو استفاده کنید؛ فقط `server` تفاوت دارد.

## خلاصه

- `Bot.business(token)` = همان API با سهمیه‌ی جدا و پولی.
- هفت متد؛ فقط چت خصوصی؛ فایل فقط با `file_id`.
- بعدی: [ابزارهای کمکی](/guide/utils).

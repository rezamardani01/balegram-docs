---
title: تغییرات نسخه‌ها
lead: فهرست تغییرات هر نسخه‌ی baleropy.
---

منبع اصلی: [CHANGELOG.md](https://github.com/rezamardani01/Baleropy/blob/main/CHANGELOG.md) در مخزن.

## 0.3.3

- انتشار نسخه از طریق GitHub Actions و PyPI Trusted Publishing برای ثبت منشأ قابل‌تأیید.

## 0.3.2

- چیدمان نمونه‌ی دکمه‌های رنگی inline مستقیماً با ردیف‌های تو‌در‌تو مشخص می‌شود و به `adjust()` نیاز ندارد.

## 0.2.0

**جدید**
- 🎨 **دکمه‌های رنگی**: `style` روی دکمه‌ها (`ButtonStyle`: primary آبی، success سبز، danger قرمز) و آرگومان `style=` در سازنده‌ی کیبورد.
- 🔗 لینک عمیق: `create_start_link`، `bot_link`، `encode_payload` / `decode_payload`.
- ✍️ ابزارهای متن: `bold`، `italic`، `link`، `split_text`.
- ⌨️ `ChatActionSender`، `MediaGroupBuilder`، `InlineKeyboardBuilder.from_markup` و `copy`.
- 🏢 `Bot.business()` برای Business API.
- 🔎 فیلترهای تازه: `MagicData`، `ExceptionTypeFilter`، `ExceptionMessageFilter`؛ مقایسه‌ی `F.a == F.b`؛ `get_flag`.
- 🧩 آرگومانی به نام `event` همیشه خود رویداد را می‌گیرد.

**اصلاح**
- `chat_id` همیشه رشته فرستاده می‌شود (بله روی `sendChatAction` با عدد خطای `chat id is empty` می‌داد).
- ۴۲۹: تلاش مجدد پیش‌فرض، یک مکث مشترک برای همه‌ی درخواست‌های ربات و تعداد تلاش محدود.
- `Dispatcher.start_polling(max_concurrent_updates=...)`؛ خطاهای API هنگام polling به‌صورت یک خط لاگ می‌شوند.
- محدودیت‌های مستند بله پیش از ارسال اعتبارسنجی می‌شوند.
- `Message.reply_markup` با شکل غیرمنتظره، آپدیت را از بین نمی‌برد.

**تغییر رفتار**
- `retry_on_flood` پیش‌فرض حالا ۶۰ ثانیه است (قبلاً خاموش).

## 0.1.0

اولین انتشار: کلاینت Bot API، روتر، میدلور، فیلتر، FSM، Polling و Webhook، مدل‌های pydantic و پوشش کامل متدها.

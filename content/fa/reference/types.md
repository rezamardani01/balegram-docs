---
title: تایپ‌ها
lead: همه‌ی شیءهای بله به‌صورت مدل‌های pydantic: فیلدها، نوع‌ها و میانبرها.
---

همه‌ی تایپ‌ها از `baleropy.types` import می‌شوند. فیلدهای اختیاری با `?` مشخص شده‌اند و می‌توانند `None` باشند. فیلدهای ناشناخته‌ی بله نادیده گرفته نمی‌شوند و حفظ می‌شوند؛ پس اضافه‌شدن فیلد جدید در API چیزی را خراب نمی‌کند.

```python
from baleropy.types import Message, User, Chat, Update, CallbackQuery
```

## Update

یک رویداد دریافتی از بله. فقط یکی از فیلدهای اختیاری پر است.

| فیلد | نوع | توضیح |
|---|---|---|
| `update_id` | `int` | شناسه‌ی ترتیبی آپدیت |
| `message` | `Message?` | پیام جدید |
| `edited_message` | `Message?` | پیام ویرایش‌شده |
| `callback_query` | `CallbackQuery?` | زدن دکمه‌ی inline |
| `pre_checkout_query` | `PreCheckoutQuery?` | تایید پیش از پرداخت |
| `event_type` | `str (property)` | نوع رویداد: `message`، `edited_message`، `callback_query`، `pre_checkout_query` یا `unknown` |
| `event` | `(property)` | خود رویداد (هر کدام پر بود) |

## User

یک کاربر یا ربات.

| فیلد | نوع | توضیح |
|---|---|---|
| `id` | `int` | شناسه‌ی عددی |
| `is_bot` | `bool` | آیا ربات است؟ |
| `first_name` | `str` | نام |
| `last_name` | `str?` | نام خانوادگی |
| `username` | `str?` | نام کاربری (بدون @) |
| `language_code` | `str?` | کد زبان |
| `full_name` | `str (property)` | نام کامل |
| `mention` | `str (property)` | `@username` یا نام کامل |

## Chat

یک چت (خصوصی، گروه یا کانال).

| فیلد | نوع | توضیح |
|---|---|---|
| `id` | `int` | شناسه‌ی چت |
| `type` | `str` | `private` \| `group` \| `channel` |
| `title` | `str?` | عنوان گروه/کانال |
| `username` | `str?` | نام کاربری |
| `first_name` | `str?` | نام (چت خصوصی) |
| `last_name` | `str?` | نام خانوادگی (چت خصوصی) |

## ChatFullInfo

نتیجه‌ی `get_chat`؛ همه‌ی فیلدهای `Chat` به‌علاوه‌ی:

| فیلد | نوع | توضیح |
|---|---|---|
| `photo` | `ChatPhoto?` | عکس چت |
| `bio` | `str?` | بیو |
| `description` | `str?` | توضیحات |
| `invite_link` | `str?` | لینک دعوت |
| `linked_chat_id` | `str?` | شناسه‌ی چت مرتبط |

## Message

یک پیام. فیلدهای رسانه‌ای فقط وقتی پر می‌شوند که پیام آن رسانه را داشته باشد.

| فیلد | نوع | توضیح |
|---|---|---|
| `message_id` | `int` | شناسه‌ی پیام در چت |
| `from_user` | `User?` | فرستنده (در JSON نامش `from` است) |
| `date` | `int` | زمان ارسال (Unix) |
| `chat` | `Chat` | چتی که پیام در آن است |
| `sender_chat` | `Chat?` | چت فرستنده (کانال) |
| `forward_from` | `User?` | فرستنده‌ی اصلی پیام فوروارد |
| `forward_from_chat` | `Chat?` | چت اصلی پیام فوروارد |
| `forward_from_message_id` | `int?` | شناسه‌ی پیام اصلی |
| `forward_date` | `int?` | زمان پیام اصلی |
| `reply_to_message` | `Message?` | پیامی که این پیام به آن ریپلای است |
| `edit_date` | `int?` | زمان آخرین ویرایش |
| `media_group_id` | `str?` | شناسه‌ی آلبوم |
| `text` | `str?` | متن |
| `entities` | `list[MessageEntity]?` | موجودیت‌های متن (`mention`، `bot_command`) |
| `animation / audio / document / video / voice / sticker` | `…?` | رسانه‌ی متناظر |
| `photo` | `list[PhotoSize]?` | عکس در چند اندازه؛ آخرین بزرگ‌ترین است |
| `caption` | `str?` | کپشن رسانه |
| `caption_entities` | `list[MessageEntity]?` | موجودیت‌های کپشن |
| `contact` | `Contact?` | مخاطب |
| `location` | `Location?` | موقعیت |
| `new_chat_members` | `list[User]?` | اعضای تازه‌واردشده |
| `left_chat_member` | `User?` | عضو خارج‌شده |
| `invoice` | `Invoice?` | فاکتور |
| `successful_payment` | `SuccessfulPayment?` | پرداخت موفق |
| `web_app_data` | `WebAppData?` | داده‌ی مینی‌اپ |
| `reply_markup` | `InlineKeyboardMarkup \| dict?` | کیبورد inline پیام |
| `content_type` | `str (property)` | نوع محتوا: `text`، `photo`، `video` ... |
| `content_text` | `str? (property)` | `text` یا `caption` |
| `file_id` | `str? (property)` | شناسه‌ی فایل رسانه (بزرگ‌ترین عکس) |

## MessageEntity

بخشی از متن (فعلاً mention و دستور).

| فیلد | نوع | توضیح |
|---|---|---|
| `type` | `str` | `mention` \| `bot_command` |
| `offset` | `int` | شروع (واحد UTF-16) |
| `length` | `int` | طول (واحد UTF-16) |

## CallbackQuery

زدن یک دکمه‌ی inline.

| فیلد | نوع | توضیح |
|---|---|---|
| `id` | `str` | شناسه‌ی callback |
| `from_user` | `User` | کاربری که دکمه را زد |
| `message` | `Message?` | پیامِ دارای دکمه (برای پیام‌های خیلی قدیمی ممکن است نباشد) |
| `data` | `str?` | `callback_data` دکمه |
| `answer()` | `method` | پاسخ به callback (رد می‌شود برای کلاینت قدیمی) |
| `is_answered` | `bool (property)` | آیا پاسخ داده شده؟ |
| `is_old_client` | `bool (property)` | شناسه با `1` شروع می‌شود؟ |

## PhotoSize

یک اندازه از عکس.

| فیلد | نوع | توضیح |
|---|---|---|
| `file_id` | `str` | شناسه‌ی فایل |
| `file_unique_id` | `str` | شناسه‌ی یکتا |
| `width` | `int` | عرض |
| `height` | `int` | ارتفاع |
| `file_size` | `int?` | حجم (بایت) |

## Animation

گیف/انیمیشن.

| فیلد | نوع | توضیح |
|---|---|---|
| `file_id, file_unique_id` | `str` | شناسه‌ها |
| `width, height, duration` | `int` | ابعاد و مدت |
| `thumbnail` | `PhotoSize?` | پیش‌نمایش |
| `file_name, mime_type` | `str?` | نام و نوع |
| `file_size` | `int?` | حجم |

## Audio

فایل صوتی.

| فیلد | نوع | توضیح |
|---|---|---|
| `file_id, file_unique_id` | `str` | شناسه‌ها |
| `duration` | `int` | مدت (ثانیه) |
| `title, file_name, mime_type` | `str?` | عنوان، نام و نوع |
| `file_size` | `int?` | حجم |

## Document

فایل عمومی.

| فیلد | نوع | توضیح |
|---|---|---|
| `file_id, file_unique_id` | `str` | شناسه‌ها |
| `thumbnail` | `PhotoSize?` | پیش‌نمایش |
| `file_name, mime_type` | `str?` | نام و نوع |
| `file_size` | `int?` | حجم |

## Video

ویدیو.

| فیلد | نوع | توضیح |
|---|---|---|
| `file_id, file_unique_id` | `str` | شناسه‌ها |
| `width, height, duration` | `int` | ابعاد و مدت |
| `file_name, mime_type` | `str?` | نام و نوع |
| `file_size` | `int?` | حجم |

## Voice

پیام صوتی.

| فیلد | نوع | توضیح |
|---|---|---|
| `file_id, file_unique_id` | `str` | شناسه‌ها |
| `duration, mime_type, file_size` | `?` | اختیاری |

## Sticker

یک استیکر.

| فیلد | نوع | توضیح |
|---|---|---|
| `file_id, file_unique_id` | `str` | شناسه‌ها |
| `type` | `str?` | `regular` \| `mask` |
| `width, height` | `int?` | ابعاد |
| `file_size` | `int?` | حجم |

## StickerSet

یک ست استیکر.

| فیلد | نوع | توضیح |
|---|---|---|
| `name` | `str` | نام |
| `title` | `str` | عنوان |
| `stickers` | `list[Sticker]` | استیکرها |
| `thumbnail` | `PhotoSize?` | پیش‌نمایش |

## File

نتیجه‌ی `get_file`.

| فیلد | نوع | توضیح |
|---|---|---|
| `file_id, file_unique_id` | `str` | شناسه‌ها |
| `file_size` | `int?` | حجم |
| `file_path` | `str?` | مسیر برای دانلود |

## Contact

یک مخاطب.

| فیلد | نوع | توضیح |
|---|---|---|
| `phone_number` | `str` | شماره |
| `first_name` | `str` | نام |
| `last_name` | `str?` | نام خانوادگی |
| `user_id` | `int?` | شناسه‌ی کاربر |

## Location

یک موقعیت.

| فیلد | نوع | توضیح |
|---|---|---|
| `longitude` | `float` | طول جغرافیایی |
| `latitude` | `float` | عرض جغرافیایی |

## ChatMember

عضو یک چت. چهار حالت دارد که با `status` فرق می‌کنند.

| فیلد | نوع | توضیح |
|---|---|---|
| `status` | `str` | `creator` \| `administrator` \| `member` \| `restricted` |
| `user` | `User` | کاربر |
| `can_* (ادمین/محدود)` | `bool?` | دسترسی‌ها: `can_delete_messages`، `can_restrict_members`، `can_change_info`، `can_invite_users`، `can_pin_messages` ... |
| `is_member` | `bool?` | برای `restricted` |
| `is_admin` | `bool (property)` | owner یا administrator است؟ |
| `is_joined` | `bool (property)` | هنوز عضو است؟ (بن/ترک نکرده) |

## ChatPhoto

شناسه‌های عکس چت.

| فیلد | نوع | توضیح |
|---|---|---|
| `small_file_id, small_file_unique_id` | `str` | کوچک |
| `big_file_id, big_file_unique_id` | `str` | بزرگ |

## WebhookInfo

نتیجه‌ی `get_webhook_info`.

| فیلد | نوع | توضیح |
|---|---|---|
| `url` | `str` | آدرس وب‌هوک؛ خالی یعنی تنظیم نشده |

## Invoice

فاکتور داخل پیام.

| فیلد | نوع | توضیح |
|---|---|---|
| `title` | `str` | عنوان |
| `description` | `str` | توضیح |
| `total_amount` | `int` | جمع (ریال) |

## LabeledPrice

یک قلم قیمت.

| فیلد | نوع | توضیح |
|---|---|---|
| `label` | `str` | برچسب |
| `amount` | `int` | مبلغ به ریال |

## PreCheckoutQuery

تایید پیش از پرداخت (۱۰ ثانیه فرصت پاسخ).

| فیلد | نوع | توضیح |
|---|---|---|
| `id` | `str` | شناسه |
| `from_user` | `User` | پرداخت‌کننده |
| `currency` | `str` | `IRR` |
| `total_amount` | `int` | مبلغ کل |
| `invoice_payload` | `str` | `payload` شما |
| `answer()` | `method` | پاسخ سریع |

## SuccessfulPayment

پرداخت موفق.

| فیلد | نوع | توضیح |
|---|---|---|
| `currency` | `str` | `IRR` |
| `total_amount` | `int` | مبلغ |
| `invoice_payload` | `str` | `payload` شما |
| `telegram_payment_charge_id, provider_payment_charge_id` | `str` | شناسه‌های پیگیری |

## Transaction

نتیجه‌ی `inquire_transaction`.

| فیلد | نوع | توضیح |
|---|---|---|
| `id` | `str` | شناسه |
| `status` | `str` | `pending` \| `paid` \| `failed` \| `rejected` |
| `userID` | `int?` | کاربر |
| `amount` | `int?` | مبلغ (ریال) |
| `createdAt` | `int?` | زمان ساخت |

## InlineKeyboardMarkup / InlineKeyboardButton

کیبورد inline و دکمه‌هایش (فقط یکی از `url`، `callback_data`، `web_app`، `copy_text`).

| فیلد | نوع | توضیح |
|---|---|---|
| `inline_keyboard` | `list[list[Button]]` | ردیف‌های دکمه |
| `text` | `str` | متن دکمه |
| `callback_data` | `str?` | ۱ تا ۶۴ بایت |
| `url` | `str?` | لینک |
| `web_app` | `WebAppInfo?` | مینی‌اپ (HTTPS) |
| `copy_text` | `CopyTextButton?` | متن برای کپی (۱ تا ۲۵۶) |
| `style` | `ButtonStyle \| str?` | رنگ: `primary` آبی، `success` سبز، `danger` قرمز |

## ReplyKeyboardMarkup / KeyboardButton

کیبورد reply و دکمه‌هایش.

| فیلد | نوع | توضیح |
|---|---|---|
| `keyboard` | `list[list[KeyboardButton]]` | ردیف‌ها |
| `text` | `str` | متن |
| `request_contact` | `bool?` | درخواست شماره |
| `request_location` | `bool?` | درخواست موقعیت |
| `web_app` | `WebAppInfo?` | مینی‌اپ |
| `style` | `ButtonStyle \| str?` | رنگ (تأییدنشده) |

## ReplyKeyboardRemove

حذف کیبورد reply.

| فیلد | نوع | توضیح |
|---|---|---|
| `remove_keyboard` | `bool` | همیشه `True` |

## WebAppInfo / WebAppData / CopyTextButton

مینی‌اپ و کپی متن.

| فیلد | نوع | توضیح |
|---|---|---|
| `WebAppInfo.url` | `str` | آدرس HTTPS |
| `WebAppData.data` | `str` | داده‌ی ارسالی مینی‌اپ (قابل اعتماد کامل نیست) |
| `CopyTextButton.text` | `str` | متن (۱ تا ۲۵۶ نویسه) |

## InputFile

فایلی که آپلود می‌شود.

| فیلد | نوع | توضیح |
|---|---|---|
| `FSInputFile(path, filename=None)` | `class` | فایل روی دیسک |
| `BufferedInputFile(data, filename)` | `class` | bytes در حافظه |

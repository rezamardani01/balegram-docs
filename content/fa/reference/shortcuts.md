---
title: میانبرهای Message
lead: متدهای میانبر روی Message، CallbackQuery و PreCheckoutQuery که کار با Bot را کوتاه می‌کنند.
---

شیءهای دریافتی از بله به `Bot` متصل هستند؛ پس به‌جای `bot.send_message(message.chat.id, ...)` می‌توانید بنویسید `message.answer(...)`.

## Message

### ارسال

| میانبر | معادل |
|---|---|
| `await m.answer(text, reply_markup=None, *, reply=False)` | `send_message` به همین چت |
| `await m.reply(text, reply_markup=None)` | مثل `answer(..., reply=True)` |
| `await m.answer_photo(photo, caption=None, reply_markup=None, *, reply=False)` | `send_photo` |
| `await m.answer_document(document, caption=None, reply_markup=None, *, reply=False)` | `send_document` |
| `await m.answer_video(video, ...)` | `send_video` |
| `await m.answer_audio(audio, ...)` | `send_audio` |
| `await m.answer_voice(voice, ...)` | `send_voice` |
| `await m.answer_animation(animation, ...)` | `send_animation` |
| `await m.answer_location(latitude, longitude, *, reply=False)` | `send_location` |
| `await m.answer_contact(phone_number, first_name, last_name=None, *, reply=False)` | `send_contact` |
| `await m.answer_chat_action(action=ChatAction.TYPING)` | `send_chat_action` |

### ویرایش و مدیریت

| میانبر | معادل |
|---|---|
| `await m.edit_text(text, reply_markup=None)` | `edit_message_text` |
| `await m.edit_caption(caption=None, reply_markup=None)` | `edit_message_caption` |
| `await m.edit_reply_markup(reply_markup=None)` | `edit_message_reply_markup` |
| `await m.delete()` | `delete_message` |
| `await m.forward(chat_id)` | `forward_message` |
| `await m.copy_to(chat_id)` | `copy_message` |
| `await m.pin()` / `await m.unpin()` | `pin_chat_message` / `unpin_chat_message` |
| `await m.download(destination=None)` | دانلود رسانه‌ی پیام |

### ویژگی‌ها

| ویژگی | معنی |
|---|---|
| `m.content_type` | `"text"`، `"photo"`، `"video"`، `"voice"` ... یا `"unknown"` |
| `m.content_text` | `text` و اگر نبود `caption` |
| `m.file_id` | شناسه‌ی رسانه (بزرگ‌ترین عکس) یا `None` |

```python
@dp.message(F.photo | F.document)
async def media(message: Message):
    await message.reply(f"نوع: {message.content_type}، کپشن: {message.content_text}")
    buf = await message.download()          # BytesIO
```

::: note ریپلای
در همه‌ی `answer_*` با `reply=True` پیام جدید روی پیام کاربر ریپلای می‌شود.
:::

## CallbackQuery

| میانبر | معنی |
|---|---|
| `await q.answer(text=None, show_alert=None)` | پاسخ به دکمه. برای کلاینت قدیمی بی‌خطا رد می‌شود (`False`). |
| `q.is_answered` | آیا پاسخ داده شده؟ |
| `q.is_old_client` | شناسه با `1` شروع می‌شود؟ |
| `q.from_user` / `q.data` / `q.message` | کاربر، `callback_data`، پیامِ دارای دکمه |

```python
@dp.callback_query(F.data == "ok")
async def ok(query: CallbackQuery):
    await query.answer("ثبت شد ✅")
    await query.message.edit_text("انجام شد")
```

## PreCheckoutQuery

```python
await query.answer(ok=True)
await query.answer(ok=False, error_message="موجودی کافی نیست")
```

## Bot

| میانبر | کار |
|---|---|
| `await bot.me()` | `getMe` با کش (یک‌بار درخواست) |
| `bot.id` | شناسه‌ی عددی (از روی توکن؛ بدون درخواست) |
| `await bot.download(file, destination=None)` | دانلود با `file_id` یا `File` |
| `Bot.business(token)` | ربات Business API |
| `await bot.close()` / `async with Bot(...)` | بستن سشن |

## اگر میانبر خطای «not bound» داد

```text
RuntimeError: Message is not bound to a Bot instance
```

یعنی شیء بدون `Bot` ساخته شده (مثلاً در تست). هنگام ساختن بدهید: `Update.model_validate(raw, context={"bot": bot})` ([تست کردن ربات](/guide/testing)).

بعدی: [مرجع فیلترها](/reference/filters-ref).

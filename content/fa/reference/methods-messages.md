---
title: متدها: ارسال پیام
lead: متدهای ارسال پیام متنی، فوروارد، کپی، موقعیت، مخاطب و نشانگر «در حال تایپ».
---

## فهرست متدها

| متد | نام در Bot API | کار |
|---|---|---|
| [`send_message`](/reference/methods-messages?s=send_message) | `sendMessage` | یک پیام متنی می‌فرستد. |
| [`forward_message`](/reference/methods-messages?s=forward_message) | `forwardMessage` | یک پیام را همراه نام فرستنده‌ی اصلی به چت دیگری فوروارد می‌کند. |
| [`copy_message`](/reference/methods-messages?s=copy_message) | `copyMessage` | یک پیام را بدون نام فرستنده‌ی اصلی کپی می‌کند. |
| [`send_chat_action`](/reference/methods-messages?s=send_chat_action) | `sendChatAction` | وضعیت «در حال ...» را برای چت نشان می‌دهد (مثلاً «در حال تایپ»). |
| [`send_location`](/reference/methods-messages?s=send_location) | `sendLocation` | یک موقعیت مکانی روی نقشه می‌فرستد. |
| [`send_contact`](/reference/methods-messages?s=send_contact) | `sendContact` | یک مخاطب (شماره‌ی تماس) می‌فرستد. |

::: method
## send_message {#send_message}
::: head sendMessage | Message
:::
::: sig
await bot.send_message(chat_id, text, reply_to_message_id=None, reply_markup=None)
:::

یک پیام متنی می‌فرستد. متن Markdown بله را می‌فهمد (`**پررنگ**`، `__کج__`، `[لینک](url)`).

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `text` | `str` | {req} | متن؛ ۱ تا ۴۰۹۶ نویسه |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
msg = await bot.send_message(12345, "سلام! 👋")
print(msg.message_id)

# با کیبورد و ریپلای
kb = InlineKeyboardBuilder().button(text="تایید", callback_data="ok", style="success").as_markup()
await bot.send_message(12345, "ادامه می‌دهیم؟", reply_to_message_id=77, reply_markup=kb)
```

**میانبر:**

```python
await message.answer(text)   # پیام تازه
await message.reply(text)    # ریپلای
```

::: tip
متن بیشتر از ۴۰۹۶ نویسه را با `split_text` تکه‌تکه بفرستید.
:::

:::

::: method
## forward_message {#forward_message}
::: head forwardMessage | Message
:::
::: sig
await bot.forward_message(chat_id, from_chat_id, message_id)
:::

یک پیام را همراه نام فرستنده‌ی اصلی به چت دیگری فوروارد می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | چت مقصد |
| `from_chat_id` | `int \| str` | {req} | چتی که پیام اصلی در آن است |
| `message_id` | `int` | {req} | شناسه‌ی پیام |

**خروجی:** `Message`

#### مثال

```python
await bot.forward_message(chat_id=-1001, from_chat_id=12345, message_id=42)
```

**میانبر:**

```python
await message.forward(chat_id)
```

:::

::: method
## copy_message {#copy_message}
::: head copyMessage | MessageId
:::
::: sig
await bot.copy_message(chat_id, from_chat_id, message_id)
:::

یک پیام را بدون نام فرستنده‌ی اصلی کپی می‌کند. فقط `MessageId` پیام جدید را برمی‌گرداند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | چت مقصد |
| `from_chat_id` | `int \| str` | {req} | چتی که پیام اصلی در آن است |
| `message_id` | `int` | {req} | شناسه‌ی پیام |

**خروجی:** `MessageId`

#### مثال

```python
copied = await bot.copy_message(chat_id=-1001, from_chat_id=12345, message_id=42)
print(copied.message_id)
```

**میانبر:**

```python
await message.copy_to(chat_id)
```

:::

::: method
## send_chat_action {#send_chat_action}
::: head sendChatAction | bool
:::
::: sig
await bot.send_chat_action(chat_id, action)
:::

وضعیت «در حال ...» را برای چت نشان می‌دهد (مثلاً «در حال تایپ»). حدود ۵ ثانیه می‌ماند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `action` | `ChatAction \| str` | {req} | یکی از: `typing`، `upload_photo`، `record_video`، `upload_video`، `record_voice`، `upload_voice`، `choose_sticker` |

**خروجی:** `bool`

#### مثال

```python
from balegram.types import ChatAction

await bot.send_chat_action(12345, ChatAction.TYPING)
```

**میانبر:**

```python
await message.answer_chat_action()   # typing
```

::: tip
برای کارهای طولانی از `ChatActionSender` استفاده کنید تا نشانگر تکرار شود.
:::

:::

::: method
## send_location {#send_location}
::: head sendLocation | Message
:::
::: sig
await bot.send_location(chat_id, latitude, longitude, horizontal_accuracy=None, reply_to_message_id=None, reply_markup=None)
:::

یک موقعیت مکانی روی نقشه می‌فرستد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `latitude` | `float` | {req} | عرض جغرافیایی |
| `longitude` | `float` | {req} | طول جغرافیایی |
| `horizontal_accuracy` | `float` | {opt} | دقت افقی به متر (۰ تا ۱۵۰۰) |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
await bot.send_location(12345, latitude=35.6892, longitude=51.3890)   # تهران
```

**میانبر:**

```python
await message.answer_location(lat, lon)
```

:::

::: method
## send_contact {#send_contact}
::: head sendContact | Message
:::
::: sig
await bot.send_contact(chat_id, phone_number, first_name, last_name=None, reply_to_message_id=None, reply_markup=None)
:::

یک مخاطب (شماره‌ی تماس) می‌فرستد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `phone_number` | `str \| int` | {req} | شماره‌ی تلفن |
| `first_name` | `str` | {req} | نام |
| `last_name` | `str` | {opt} | نام خانوادگی |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
await bot.send_contact(12345, phone_number="09120000000", first_name="پشتیبانی")
```

**میانبر:**

```python
await message.answer_contact(phone, first_name, last_name=None)
```

:::

---
title: متدها: ویرایش و حذف
lead: ویرایش متن، کپشن و کیبورد، حذف پیام و پاسخ به دکمه‌ها.
---

## فهرست متدها

| متد | نام در Bot API | کار |
|---|---|---|
| [`edit_message_text`](/reference/methods-editing?s=edit_message_text) | `editMessageText` | متن یک پیام (و در صورت لزوم کیبوردش) را ویرایش می‌کند. |
| [`edit_message_caption`](/reference/methods-editing?s=edit_message_caption) | `editMessageCaption` | کپشن یک پیام رسانه‌ای را ویرایش می‌کند. |
| [`edit_message_reply_markup`](/reference/methods-editing?s=edit_message_reply_markup) | `editMessageReplyMarkup` | فقط کیبورد inline یک پیام را عوض می‌کند (بدون دست‌زدن به متن). |
| [`delete_message`](/reference/methods-editing?s=delete_message) | `deleteMessage` | یک پیام را حذف می‌کند. |
| [`answer_callback_query`](/reference/methods-editing?s=answer_callback_query) | `answerCallbackQuery` | به زدن دکمه‌ی inline پاسخ می‌دهد و حالت «در انتظار» دکمه را پایان می‌دهد؛ اختیاری یک اعلان کوتاه نشان می‌دهد. |

::: method
## edit_message_text {#edit_message_text}
::: head editMessageText | Message | bool
:::
::: sig
await bot.edit_message_text(chat_id, message_id, text, reply_markup=None)
:::

متن یک پیام (و در صورت لزوم کیبوردش) را ویرایش می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `message_id` | `int` | {req} | شناسه‌ی پیام |
| `text` | `str` | {req} | متن؛ ۱ تا ۴۰۹۶ نویسه |
| `reply_markup` | `InlineKeyboardMarkup` | {opt} | کیبورد inline جدید |

**خروجی:** `Message | bool`

#### مثال

```python
await bot.edit_message_text(12345, 77, "ویرایش شد ✏️")
```

**میانبر:**

```python
await message.edit_text(text, reply_markup=None)
```

::: warn
اگر متن و کیبورد جدید با قبلی یکی باشد، بله `400 message is not modified` می‌دهد.
:::

:::

::: method
## edit_message_caption {#edit_message_caption}
::: head editMessageCaption | Message | bool
:::
::: sig
await bot.edit_message_caption(chat_id, message_id, caption=None, reply_markup=None)
:::

کپشن یک پیام رسانه‌ای را ویرایش می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `message_id` | `int` | {req} | شناسه‌ی پیام |
| `caption` | `str` | {opt} | کپشن؛ تا ۴۰۹۶ نویسه |
| `reply_markup` | `InlineKeyboardMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message | bool`

#### مثال

```python
await bot.edit_message_caption(12345, 78, caption="کپشن تازه")
```

**میانبر:**

```python
await message.edit_caption(caption, reply_markup=None)
```

:::

::: method
## edit_message_reply_markup {#edit_message_reply_markup}
::: head editMessageReplyMarkup | Message | bool
:::
::: sig
await bot.edit_message_reply_markup(chat_id, message_id, reply_markup=None)
:::

فقط کیبورد inline یک پیام را عوض می‌کند (بدون دست‌زدن به متن).

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `message_id` | `int` | {req} | شناسه‌ی پیام |
| `reply_markup` | `InlineKeyboardMarkup` | {opt} | کیبورد جدید؛ بدون آن، کیبورد حذف می‌شود |

**خروجی:** `Message | bool`

#### مثال

```python
await bot.edit_message_reply_markup(12345, 77, reply_markup=None)      # حذف دکمه‌ها
```

**میانبر:**

```python
await message.edit_reply_markup(reply_markup=None)
```

:::

::: method
## delete_message {#delete_message}
::: head deleteMessage | bool
:::
::: sig
await bot.delete_message(chat_id, message_id)
:::

یک پیام را حذف می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `message_id` | `int` | {req} | شناسه‌ی پیام |

**خروجی:** `bool`

#### مثال

```python
await bot.delete_message(12345, 77)
```

**میانبر:**

```python
await message.delete()
```

::: warn
فقط پیام‌هایی که در ۴۸ ساعت گذشته فرستاده شده‌اند قابل حذف‌اند.
:::

:::

::: method
## answer_callback_query {#answer_callback_query}
::: head answerCallbackQuery | bool
:::
::: sig
await bot.answer_callback_query(callback_query_id, text=None, show_alert=None)
:::

به زدن دکمه‌ی inline پاسخ می‌دهد و حالت «در انتظار» دکمه را پایان می‌دهد؛ اختیاری یک اعلان کوتاه نشان می‌دهد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `callback_query_id` | `str` | {req} | `query.id` رویداد callback |
| `text` | `str` | {opt} | متن اعلان؛ تا ۲۰۰ نویسه |
| `show_alert` | `bool` | {opt} | `True` = پنجره‌ی هشدار به‌جای اعلان کوتاه |

**خروجی:** `bool`

#### مثال

```python
@dp.callback_query(F.data == "ok")
async def ok(query: CallbackQuery):
    await query.answer("انجام شد ✅", show_alert=False)
```

**میانبر:**

```python
await query.answer(text=None, show_alert=None)
```

::: warn
این متد در کلاینت‌های قدیمی بله پشتیبانی نمی‌شود (شناسه با `1` شروع می‌شود)؛ `query.answer()` این را خودکار رد می‌کند.
:::

:::

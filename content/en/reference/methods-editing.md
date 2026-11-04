---
title: Methods: editing
lead: Editing text, captions and keyboards, deleting messages and answering buttons.
---

## Methods at a glance

| Method | Bot API name | What it does |
|---|---|---|
| [`edit_message_text`](/reference/methods-editing?s=edit_message_text) | `editMessageText` | Edits the text of a message (and its keyboard if needed). |
| [`edit_message_caption`](/reference/methods-editing?s=edit_message_caption) | `editMessageCaption` | Edits the caption of a media message. |
| [`edit_message_reply_markup`](/reference/methods-editing?s=edit_message_reply_markup) | `editMessageReplyMarkup` | Changes only the inline keyboard of a message (leaves the text alone). |
| [`delete_message`](/reference/methods-editing?s=delete_message) | `deleteMessage` | Deletes a message. |
| [`answer_callback_query`](/reference/methods-editing?s=answer_callback_query) | `answerCallbackQuery` | Answers a tap on an inline button and ends the button's "waiting" state; optionally shows a short notice. |

::: method
## edit_message_text {#edit_message_text}
::: head editMessageText | Message | bool
:::
::: sig
await bot.edit_message_text(chat_id, message_id, text, reply_markup=None)
:::

Edits the text of a message (and its keyboard if needed).

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `message_id` | `int` | {req} | Message id |
| `text` | `str` | {req} | Text; 1 to 4096 characters |
| `reply_markup` | `InlineKeyboardMarkup` | {opt} | The new inline keyboard |

**Returns:** `Message | bool`

#### Example

```python
await bot.edit_message_text(12345, 77, "Edited ✏️")
```

**Shortcut:**

```python
await message.edit_text(text, reply_markup=None)
```

::: warn
If the new text and keyboard equal the old ones, Bale returns `400 message is not modified`.
:::

:::

::: method
## edit_message_caption {#edit_message_caption}
::: head editMessageCaption | Message | bool
:::
::: sig
await bot.edit_message_caption(chat_id, message_id, caption=None, reply_markup=None)
:::

Edits the caption of a media message.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `message_id` | `int` | {req} | Message id |
| `caption` | `str` | {opt} | Caption; up to 4096 characters |
| `reply_markup` | `InlineKeyboardMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message | bool`

#### Example

```python
await bot.edit_message_caption(12345, 78, caption="New caption")
```

**Shortcut:**

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

Changes only the inline keyboard of a message (leaves the text alone).

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `message_id` | `int` | {req} | Message id |
| `reply_markup` | `InlineKeyboardMarkup` | {opt} | The new keyboard; without it the keyboard is removed |

**Returns:** `Message | bool`

#### Example

```python
await bot.edit_message_reply_markup(12345, 77, reply_markup=None)      # remove the buttons
```

**Shortcut:**

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

Deletes a message.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `message_id` | `int` | {req} | Message id |

**Returns:** `bool`

#### Example

```python
await bot.delete_message(12345, 77)
```

**Shortcut:**

```python
await message.delete()
```

::: warn
Only messages sent within the last 48 hours can be deleted.
:::

:::

::: method
## answer_callback_query {#answer_callback_query}
::: head answerCallbackQuery | bool
:::
::: sig
await bot.answer_callback_query(callback_query_id, text=None, show_alert=None)
:::

Answers a tap on an inline button and ends the button's "waiting" state; optionally shows a short notice.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `callback_query_id` | `str` | {req} | The callback event's `query.id` |
| `text` | `str` | {opt} | Notice text; up to 200 characters |
| `show_alert` | `bool` | {opt} | `True` = an alert dialog instead of a short toast |

**Returns:** `bool`

#### Example

```python
@dp.callback_query(F.data == "ok")
async def ok(query: CallbackQuery):
    await query.answer("Done ✅", show_alert=False)
```

**Shortcut:**

```python
await query.answer(text=None, show_alert=None)
```

::: warn
Old Bale clients do not support it (the id starts with `1`); `query.answer()` skips them automatically.
:::

:::

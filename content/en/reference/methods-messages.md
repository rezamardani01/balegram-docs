---
title: Methods: sending
lead: Methods for sending text, forwarding, copying, locations, contacts and the typing indicator.
---

## Methods at a glance

| Method | Bot API name | What it does |
|---|---|---|
| [`send_message`](/reference/methods-messages?s=send_message) | `sendMessage` | Sends a text message. |
| [`forward_message`](/reference/methods-messages?s=forward_message) | `forwardMessage` | Forwards a message, with the original sender's name, to another chat. |
| [`copy_message`](/reference/methods-messages?s=copy_message) | `copyMessage` | Copies a message without the original sender's name. |
| [`send_chat_action`](/reference/methods-messages?s=send_chat_action) | `sendChatAction` | Shows an "is ..." status in the chat (for example "typing"). |
| [`send_location`](/reference/methods-messages?s=send_location) | `sendLocation` | Sends a location on the map. |
| [`send_contact`](/reference/methods-messages?s=send_contact) | `sendContact` | Sends a contact (a phone number). |

::: method
## send_message {#send_message}
::: head sendMessage | Message
:::
::: sig
await bot.send_message(chat_id, text, reply_to_message_id=None, reply_markup=None)
:::

Sends a text message. The text understands Bale Markdown (`**bold**`, `__italic__`, `[link](url)`).

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `text` | `str` | {req} | Text; 1 to 4096 characters |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
msg = await bot.send_message(12345, "Hello! 👋")
print(msg.message_id)

# with a keyboard and a reply
kb = InlineKeyboardBuilder().button(text="OK", callback_data="ok", style="success").as_markup()
await bot.send_message(12345, "Shall we continue?", reply_to_message_id=77, reply_markup=kb)
```

**Shortcut:**

```python
await message.answer(text)   # new message
await message.reply(text)    # as a reply
```

::: tip
Send text longer than 4096 characters in pieces with `split_text`.
:::

:::

::: method
## forward_message {#forward_message}
::: head forwardMessage | Message
:::
::: sig
await bot.forward_message(chat_id, from_chat_id, message_id)
:::

Forwards a message, with the original sender's name, to another chat.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | The destination chat |
| `from_chat_id` | `int \| str` | {req} | The chat that holds the original message |
| `message_id` | `int` | {req} | Message id |

**Returns:** `Message`

#### Example

```python
await bot.forward_message(chat_id=-1001, from_chat_id=12345, message_id=42)
```

**Shortcut:**

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

Copies a message without the original sender's name. Returns only the new message's `MessageId`.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | The destination chat |
| `from_chat_id` | `int \| str` | {req} | The chat that holds the original message |
| `message_id` | `int` | {req} | Message id |

**Returns:** `MessageId`

#### Example

```python
copied = await bot.copy_message(chat_id=-1001, from_chat_id=12345, message_id=42)
print(copied.message_id)
```

**Shortcut:**

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

Shows an "is ..." status in the chat (for example "typing"). Lasts about 5 seconds.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `action` | `ChatAction \| str` | {req} | One of: `typing`, `upload_photo`, `record_video`, `upload_video`, `record_voice`, `upload_voice`, `choose_sticker` |

**Returns:** `bool`

#### Example

```python
from balegram.types import ChatAction

await bot.send_chat_action(12345, ChatAction.TYPING)
```

**Shortcut:**

```python
await message.answer_chat_action()   # typing
```

::: tip
For long tasks use `ChatActionSender` so the indicator repeats.
:::

:::

::: method
## send_location {#send_location}
::: head sendLocation | Message
:::
::: sig
await bot.send_location(chat_id, latitude, longitude, horizontal_accuracy=None, reply_to_message_id=None, reply_markup=None)
:::

Sends a location on the map.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `latitude` | `float` | {req} | Latitude |
| `longitude` | `float` | {req} | Longitude |
| `horizontal_accuracy` | `float` | {opt} | Horizontal accuracy in meters (0 to 1500) |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
await bot.send_location(12345, latitude=35.6892, longitude=51.3890)   # Tehran
```

**Shortcut:**

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

Sends a contact (a phone number).

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `phone_number` | `str \| int` | {req} | The phone number |
| `first_name` | `str` | {req} | First name |
| `last_name` | `str` | {opt} | Last name |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
await bot.send_contact(12345, phone_number="09120000000", first_name="Support")
```

**Shortcut:**

```python
await message.answer_contact(phone, first_name, last_name=None)
```

:::

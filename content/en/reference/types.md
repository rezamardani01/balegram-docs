---
title: Types
lead: Every Bale object as a pydantic model: fields, types and shortcuts.
---

All types are imported from `balegram.types`. Optional fields are marked with `?` and can be `None`. Unknown fields from Bale are kept, not dropped, so a new API field never breaks anything.

```python
from balegram.types import Message, User, Chat, Update, CallbackQuery
```

## Update

An incoming event from Bale. Only one of the optional fields is set.

| Field | Type | Description |
|---|---|---|
| `update_id` | `int` | Sequential update id |
| `message` | `Message?` | A new message |
| `edited_message` | `Message?` | An edited message |
| `callback_query` | `CallbackQuery?` | An inline button press |
| `pre_checkout_query` | `PreCheckoutQuery?` | A pre-checkout confirmation |
| `event_type` | `str (property)` | Event type: `message`, `edited_message`, `callback_query`, `pre_checkout_query` or `unknown` |
| `event` | `(property)` | The event itself (whichever is set) |

## User

A user or a bot.

| Field | Type | Description |
|---|---|---|
| `id` | `int` | Numeric id |
| `is_bot` | `bool` | Is it a bot? |
| `first_name` | `str` | First name |
| `last_name` | `str?` | Last name |
| `username` | `str?` | Username (without @) |
| `language_code` | `str?` | Language code |
| `full_name` | `str (property)` | Full name |
| `mention` | `str (property)` | `@username` or the full name |

## Chat

A chat (private, group or channel).

| Field | Type | Description |
|---|---|---|
| `id` | `int` | Chat id |
| `type` | `str` | `private` \| `group` \| `channel` |
| `title` | `str?` | Group/channel title |
| `username` | `str?` | Username |
| `first_name` | `str?` | First name (private chat) |
| `last_name` | `str?` | Last name (private chat) |

## ChatFullInfo

The result of `get_chat`; all `Chat` fields plus:

| Field | Type | Description |
|---|---|---|
| `photo` | `ChatPhoto?` | Chat photo |
| `bio` | `str?` | Bio |
| `description` | `str?` | Description |
| `invite_link` | `str?` | Invite link |
| `linked_chat_id` | `str?` | Linked chat id |

## Message

A message. Media fields are set only when the message has that media.

| Field | Type | Description |
|---|---|---|
| `message_id` | `int` | Message id in the chat |
| `from_user` | `User?` | The sender (named `from` in JSON) |
| `date` | `int` | Send time (Unix) |
| `chat` | `Chat` | The chat the message is in |
| `sender_chat` | `Chat?` | Sender chat (channel) |
| `forward_from` | `User?` | Original sender of a forward |
| `forward_from_chat` | `Chat?` | Original chat of a forward |
| `forward_from_message_id` | `int?` | Original message id |
| `forward_date` | `int?` | Original message time |
| `reply_to_message` | `Message?` | The message this one replies to |
| `edit_date` | `int?` | Last edit time |
| `media_group_id` | `str?` | Album id |
| `text` | `str?` | Text |
| `entities` | `list[MessageEntity]?` | Text entities (`mention`, `bot_command`) |
| `animation / audio / document / video / voice / sticker` | `…?` | The corresponding media |
| `photo` | `list[PhotoSize]?` | Photo in several sizes; the last is the largest |
| `caption` | `str?` | Media caption |
| `caption_entities` | `list[MessageEntity]?` | Caption entities |
| `contact` | `Contact?` | A contact |
| `location` | `Location?` | A location |
| `new_chat_members` | `list[User]?` | Newly joined members |
| `left_chat_member` | `User?` | A member who left |
| `invoice` | `Invoice?` | An invoice |
| `successful_payment` | `SuccessfulPayment?` | A successful payment |
| `web_app_data` | `WebAppData?` | Mini-app data |
| `reply_markup` | `InlineKeyboardMarkup \| dict?` | The message's inline keyboard |
| `content_type` | `str (property)` | Content type: `text`, `photo`, `video`, ... |
| `content_text` | `str? (property)` | `text` or `caption` |
| `file_id` | `str? (property)` | The media file id (largest photo) |

## MessageEntity

A part of the text (mention and command for now).

| Field | Type | Description |
|---|---|---|
| `type` | `str` | `mention` \| `bot_command` |
| `offset` | `int` | Start (UTF-16 units) |
| `length` | `int` | Length (UTF-16 units) |

## CallbackQuery

A press of an inline button.

| Field | Type | Description |
|---|---|---|
| `id` | `str` | Callback id |
| `from_user` | `User` | The user who pressed |
| `message` | `Message?` | The message with the button (may be missing for very old messages) |
| `data` | `str?` | The button's `callback_data` |
| `answer()` | `method` | Answers the callback (skipped for old clients) |
| `is_answered` | `bool (property)` | Has it been answered? |
| `is_old_client` | `bool (property)` | Does the id start with `1`? |

## PhotoSize

One size of a photo.

| Field | Type | Description |
|---|---|---|
| `file_id` | `str` | File id |
| `file_unique_id` | `str` | Unique id |
| `width` | `int` | Width |
| `height` | `int` | Height |
| `file_size` | `int?` | Size (bytes) |

## Animation

A GIF/animation.

| Field | Type | Description |
|---|---|---|
| `file_id, file_unique_id` | `str` | Ids |
| `width, height, duration` | `int` | Dimensions and duration |
| `thumbnail` | `PhotoSize?` | Thumbnail |
| `file_name, mime_type` | `str?` | Name and type |
| `file_size` | `int?` | Size |

## Audio

An audio file.

| Field | Type | Description |
|---|---|---|
| `file_id, file_unique_id` | `str` | Ids |
| `duration` | `int` | Duration (seconds) |
| `title, file_name, mime_type` | `str?` | Title, name and type |
| `file_size` | `int?` | Size |

## Document

A general file.

| Field | Type | Description |
|---|---|---|
| `file_id, file_unique_id` | `str` | Ids |
| `thumbnail` | `PhotoSize?` | Thumbnail |
| `file_name, mime_type` | `str?` | Name and type |
| `file_size` | `int?` | Size |

## Video

A video.

| Field | Type | Description |
|---|---|---|
| `file_id, file_unique_id` | `str` | Ids |
| `width, height, duration` | `int` | Dimensions and duration |
| `file_name, mime_type` | `str?` | Name and type |
| `file_size` | `int?` | Size |

## Voice

A voice message.

| Field | Type | Description |
|---|---|---|
| `file_id, file_unique_id` | `str` | Ids |
| `duration, mime_type, file_size` | `?` | Optional |

## Sticker

A sticker.

| Field | Type | Description |
|---|---|---|
| `file_id, file_unique_id` | `str` | Ids |
| `type` | `str?` | `regular` \| `mask` |
| `width, height` | `int?` | Dimensions |
| `file_size` | `int?` | Size |

## StickerSet

A sticker set.

| Field | Type | Description |
|---|---|---|
| `name` | `str` | Name |
| `title` | `str` | Title |
| `stickers` | `list[Sticker]` | The stickers |
| `thumbnail` | `PhotoSize?` | Thumbnail |

## File

The result of `get_file`.

| Field | Type | Description |
|---|---|---|
| `file_id, file_unique_id` | `str` | Ids |
| `file_size` | `int?` | Size |
| `file_path` | `str?` | Path for downloading |

## Contact

A contact.

| Field | Type | Description |
|---|---|---|
| `phone_number` | `str` | Phone number |
| `first_name` | `str` | First name |
| `last_name` | `str?` | Last name |
| `user_id` | `int?` | User id |

## Location

A location.

| Field | Type | Description |
|---|---|---|
| `longitude` | `float` | Longitude |
| `latitude` | `float` | Latitude |

## ChatMember

A chat member. Four variants distinguished by `status`.

| Field | Type | Description |
|---|---|---|
| `status` | `str` | `creator` \| `administrator` \| `member` \| `restricted` |
| `user` | `User` | The user |
| `can_* (ادمین/محدود)` | `bool?` | Rights: `can_delete_messages`, `can_restrict_members`, `can_change_info`, `can_invite_users`, `can_pin_messages`, ... |
| `is_member` | `bool?` | For `restricted` |
| `is_admin` | `bool (property)` | Is owner or administrator? |
| `is_joined` | `bool (property)` | Still a member? (not banned/left) |

## ChatPhoto

Chat photo ids.

| Field | Type | Description |
|---|---|---|
| `small_file_id, small_file_unique_id` | `str` | Small |
| `big_file_id, big_file_unique_id` | `str` | Big |

## WebhookInfo

The result of `get_webhook_info`.

| Field | Type | Description |
|---|---|---|
| `url` | `str` | The webhook address; empty means none |

## Invoice

An invoice inside a message.

| Field | Type | Description |
|---|---|---|
| `title` | `str` | Title |
| `description` | `str` | Description |
| `total_amount` | `int` | Total (rial) |

## LabeledPrice

A price item.

| Field | Type | Description |
|---|---|---|
| `label` | `str` | Label |
| `amount` | `int` | Amount in rial |

## PreCheckoutQuery

A pre-checkout confirmation (10 seconds to answer).

| Field | Type | Description |
|---|---|---|
| `id` | `str` | Id |
| `from_user` | `User` | The payer |
| `currency` | `str` | `IRR` |
| `total_amount` | `int` | Total amount |
| `invoice_payload` | `str` | Your `payload` |
| `answer()` | `method` | A quick answer |

## SuccessfulPayment

A successful payment.

| Field | Type | Description |
|---|---|---|
| `currency` | `str` | `IRR` |
| `total_amount` | `int` | Amount |
| `invoice_payload` | `str` | Your `payload` |
| `telegram_payment_charge_id, provider_payment_charge_id` | `str` | Tracking ids |

## Transaction

The result of `inquire_transaction`.

| Field | Type | Description |
|---|---|---|
| `id` | `str` | Id |
| `status` | `str` | `pending` \| `paid` \| `failed` \| `rejected` |
| `userID` | `int?` | The user |
| `amount` | `int?` | Amount (rial) |
| `createdAt` | `int?` | Creation time |

## InlineKeyboardMarkup / InlineKeyboardButton

An inline keyboard and its buttons (only one of `url`, `callback_data`, `web_app`, `copy_text`).

| Field | Type | Description |
|---|---|---|
| `inline_keyboard` | `list[list[Button]]` | Rows of buttons |
| `text` | `str` | Button text |
| `callback_data` | `str?` | 1 to 64 bytes |
| `url` | `str?` | Link |
| `web_app` | `WebAppInfo?` | Mini app (HTTPS) |
| `copy_text` | `CopyTextButton?` | Text to copy (1 to 256) |
| `style` | `ButtonStyle \| str?` | Color: `primary` blue, `success` green, `danger` red |

## ReplyKeyboardMarkup / KeyboardButton

A reply keyboard and its buttons.

| Field | Type | Description |
|---|---|---|
| `keyboard` | `list[list[KeyboardButton]]` | Rows |
| `text` | `str` | Text |
| `request_contact` | `bool?` | Request the contact |
| `request_location` | `bool?` | Request the location |
| `web_app` | `WebAppInfo?` | Mini app |
| `style` | `ButtonStyle \| str?` | Color (unconfirmed) |

## ReplyKeyboardRemove

Removes the reply keyboard.

| Field | Type | Description |
|---|---|---|
| `remove_keyboard` | `bool` | Always `True` |

## WebAppInfo / WebAppData / CopyTextButton

Mini app and copy-text.

| Field | Type | Description |
|---|---|---|
| `WebAppInfo.url` | `str` | HTTPS address |
| `WebAppData.data` | `str` | Data sent by the mini app (not fully trustworthy) |
| `CopyTextButton.text` | `str` | Text (1 to 256 characters) |

## InputFile

A file that gets uploaded.

| Field | Type | Description |
|---|---|---|
| `FSInputFile(path, filename=None)` | `class` | A file on disk |
| `BufferedInputFile(data, filename)` | `class` | Bytes in memory |

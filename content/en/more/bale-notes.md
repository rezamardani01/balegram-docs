---
title: Bale notes & limits
lead: All the numbers, ceilings and special behaviors of Bale's Bot API on one page; from the official docs and real testing.
---

Official source: [docs.bale.ai](https://docs.bale.ai). Things that came from "real testing" are marked 🧪.

## Addresses

| Thing | Address |
|---|---|
| Bot API | `https://tapi.bale.ai/bot<TOKEN>/<METHOD>` |
| File download | `https://tapi.bale.ai/file/bot<TOKEN>/<file_path>` (valid about 1 hour) |
| Business API | `https://tapi.bale.ai/business/bot<TOKEN>/<METHOD>` |
| Bot link | `https://ble.ir/<username>?start=<param>` |

Method names are case-insensitive; both GET and POST work. Parameters can be JSON, form or query; uploads only as multipart.

## Ceilings

| Item | Ceiling |
|---|---|
| message text | 1 to 4096 characters |
| caption (media sending and editing) | up to 4096 characters |
| caption of each album item | up to 1024 characters |
| `answerCallbackQuery` text | up to 200 characters |
| `callback_data` | 1 to 64 **bytes** |
| `copy_text` | 1 to 256 characters |
| invoice title / description / payload | 32 / 255 / 128 bytes |
| sticker set name and title | 1 to 64 characters |
| stickers per set (on creation) | 1 to 50 |
| `getUpdates limit` | 1 to 100 |
| buttons per row / total (balegram) | 8 / 100 |

### File size

| Method | Photo | Others |
|---|---|---|
| `file_id` | unlimited | unlimited |
| URL | 5 MB | 20 MB |
| upload | 10 MB | 50 MB |
| download (`getFile`) | — | 20 MB |

Voice: `audio/ogg`; under 1 MB as a voice message and 1 to 20 MB as a document. Thumbnails: JPEG, under 200 KB, at most 320 px.

## Times

| Thing | Value |
|---|---|
| update retention | last 2000, 24 hours |
| answering `pre_checkout_query` | at most 10 seconds |
| deleting messages | only messages from the last 48 hours |
| webhook ports | 443 and 88 (HTTPS only) |

## Differences from Telegram

Bale is "similar to" Telegram's Bot API but **not the same**:

| Topic | Bale |
|---|---|
| `parse_mode` | none; all text is Bale Markdown (`**bold**`, `__italic__`) |
| `allowed_updates` | none |
| webhook secret token | none (keep the path secret) |
| update types | only `message`, `edited_message`, `callback_query`, `pre_checkout_query` |
| polls, inline mode, games | none |
| payments | Bale wallet only (rial); card-to-card removed |
| `askReview`, `inquireTransaction`, `createInvoiceLink` | Bale-specific |
| colored buttons (`style`) | Bale-specific (beta) |
| Business API | Bale-specific |

## Important behaviors

### Old clients and `answerCallbackQuery`
This method was added to Bale clients in Khordad 1404 (mid-2025). If the callback id starts with **`1`** it is an old client and answering is not supported. balegram's `query.answer()` skips it automatically.

### 🧪 Send `chat_id` as a string
In real testing, `sendChatAction` with a **numeric** `chat_id` in JSON gave `400 chat id is empty` but worked with a string. Since 0.2 balegram always sends `chat_id` as a string; if you make raw requests yourself, do the same.

### 🧪 Group methods on a private chat
`getChatMember`, `getChatAdministrators` and `getChatMembersCount` return `400 unsupported peer type` on a private chat. `getChat` works on a private chat.

### 🧪 `403 permission_denied`
When the bot may not write: the user blocked it, never pressed `/start`, or is restricted in a group. For bulk sending, catch this error and remove the user from the list.

### 🧪 429 and `retry_after`
A 429 reply has `parameters.retry_after` (seconds). balegram waits and retries automatically.

### Inconsistencies in the docs themselves
- The `reply_markup` field of `Message` is wrongly typed as `InlineKeyboardButton`; balegram accepts both shapes.
- `sendPhoto` has a `from_chat_id` parameter in the docs that seems copied from `forwardMessage`; it is not used.
- `InputSticker` is referenced but not defined; balegram's `sticker` + `emoji_list` shape is a guess.
- `Transaction` names (`userID`, `createdAt`) are camelCase.

## Practical advice

::: tip Best-practice summary
1. `skip_updates=True` in polling.
2. Split long text with `split_text`.
3. Always answer callbacks.
4. Use the Business API for bulk notifications.
5. Treat colored buttons as a "visual aid" only.
:::

Back to the [docs](/start/intro).

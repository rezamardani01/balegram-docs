---
title: Changelog
lead: The list of changes in every baleropy release.
---

Primary source: [CHANGELOG.md](https://github.com/rezamardani01/Baleropy/blob/main/CHANGELOG.md) in the repository.

## 0.3.3

- Publish the release from GitHub Actions with PyPI Trusted Publishing for verifiable provenance.

## 0.3.2

- The colored inline-button example defines its layout directly with nested rows and no longer needs `adjust()`.

## 0.2.0

**New**
- 🎨 **Colored buttons**: `style` on buttons (`ButtonStyle`: primary blue, success green, danger red) and the `style=` argument in the keyboard builders.
- 🔗 Deep links: `create_start_link`, `bot_link`, `encode_payload` / `decode_payload`.
- ✍️ Text helpers: `bold`, `italic`, `link`, `split_text`.
- ⌨️ `ChatActionSender`, `MediaGroupBuilder`, `InlineKeyboardBuilder.from_markup` and `copy`.
- 🏢 `Bot.business()` for the Business API.
- 🔎 New filters: `MagicData`, `ExceptionTypeFilter`, `ExceptionMessageFilter`; `F.a == F.b` comparisons; `get_flag`.
- 🧩 An argument named `event` always receives the event itself.

**Fixed**
- `chat_id` is always sent as a string (Bale answered `chat id is empty` to a number on `sendChatAction`).
- 429: retry by default, one shared pause for all of a bot's requests and bounded attempts.
- `Dispatcher.start_polling(max_concurrent_updates=...)`; API errors during polling are logged as one line.
- Bale's documented limits are validated before sending.
- `Message.reply_markup` with an unexpected shape no longer drops the update.

**Behavior change**
- The default `retry_on_flood` is now 60 seconds (it used to be off).

## 0.1.0

First release: Bot API client, routers, middlewares, filters, FSM, polling and webhook, pydantic models and full method coverage.

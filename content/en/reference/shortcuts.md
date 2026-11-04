---
title: Message shortcuts
lead: Shortcut methods on Message, CallbackQuery and PreCheckoutQuery that shorten working with the Bot.
---

Objects received from Bale are bound to the `Bot`; so instead of `bot.send_message(message.chat.id, ...)` you can write `message.answer(...)`.

## Message

### Sending

| Shortcut | Equivalent |
|---|---|
| `await m.answer(text, reply_markup=None, *, reply=False)` | `send_message` to this chat |
| `await m.reply(text, reply_markup=None)` | like `answer(..., reply=True)` |
| `await m.answer_photo(photo, caption=None, reply_markup=None, *, reply=False)` | `send_photo` |
| `await m.answer_document(document, caption=None, reply_markup=None, *, reply=False)` | `send_document` |
| `await m.answer_video(video, ...)` | `send_video` |
| `await m.answer_audio(audio, ...)` | `send_audio` |
| `await m.answer_voice(voice, ...)` | `send_voice` |
| `await m.answer_animation(animation, ...)` | `send_animation` |
| `await m.answer_location(latitude, longitude, *, reply=False)` | `send_location` |
| `await m.answer_contact(phone_number, first_name, last_name=None, *, reply=False)` | `send_contact` |
| `await m.answer_chat_action(action=ChatAction.TYPING)` | `send_chat_action` |

### Editing and management

| Shortcut | Equivalent |
|---|---|
| `await m.edit_text(text, reply_markup=None)` | `edit_message_text` |
| `await m.edit_caption(caption=None, reply_markup=None)` | `edit_message_caption` |
| `await m.edit_reply_markup(reply_markup=None)` | `edit_message_reply_markup` |
| `await m.delete()` | `delete_message` |
| `await m.forward(chat_id)` | `forward_message` |
| `await m.copy_to(chat_id)` | `copy_message` |
| `await m.pin()` / `await m.unpin()` | `pin_chat_message` / `unpin_chat_message` |
| `await m.download(destination=None)` | download the message's media |

### Properties

| Property | Meaning |
|---|---|
| `m.content_type` | `"text"`, `"photo"`, `"video"`, `"voice"` ... or `"unknown"` |
| `m.content_text` | `text`, or `caption` if there is none |
| `m.file_id` | the media id (largest photo) or `None` |

```python
@dp.message(F.photo | F.document)
async def media(message: Message):
    await message.reply(f"Type: {message.content_type}, caption: {message.content_text}")
    buf = await message.download()          # BytesIO
```

::: note Replying
With `reply=True` in any `answer_*` the new message replies to the user's message.
:::

## CallbackQuery

| Shortcut | Meaning |
|---|---|
| `await q.answer(text=None, show_alert=None)` | answer the button. Silently skipped (`False`) for old clients. |
| `q.is_answered` | has it been answered? |
| `q.is_old_client` | does the id start with `1`? |
| `q.from_user` / `q.data` / `q.message` | the user, the `callback_data`, the message with the button |

```python
@dp.callback_query(F.data == "ok")
async def ok(query: CallbackQuery):
    await query.answer("Saved ✅")
    await query.message.edit_text("Done")
```

## PreCheckoutQuery

```python
await query.answer(ok=True)
await query.answer(ok=False, error_message="Insufficient stock")
```

## Bot

| Shortcut | What it does |
|---|---|
| `await bot.me()` | cached `getMe` (one request) |
| `bot.id` | the numeric id (from the token; no request) |
| `await bot.download(file, destination=None)` | download by `file_id` or `File` |
| `Bot.business(token)` | a Business API bot |
| `await bot.close()` / `async with Bot(...)` | close the session |

## If a shortcut raises "not bound"

```text
RuntimeError: Message is not bound to a Bot instance
```

It means the object was built without a `Bot` (for example in a test). Pass it when building: `Update.model_validate(raw, context={"bot": bot})` ([Testing your bot](/guide/testing)).

Next: [Filters reference](/reference/filters-ref).

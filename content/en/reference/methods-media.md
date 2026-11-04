---
title: Methods: media
lead: Sending photos, audio, files, video, GIFs, voice, stickers and albums.
---

All examples on this page assume these imports:

```python
from balegram.types import FSInputFile, BufferedInputFile
```

A file argument takes three forms: a `file_id`, an HTTP URL or an `InputFile` for uploads. Details in the lesson [Sending & receiving files](/guide/files).

## Methods at a glance

| Method | Bot API name | What it does |
|---|---|---|
| [`send_photo`](/reference/methods-media?s=send_photo) | `sendPhoto` | Sends a photo. |
| [`send_audio`](/reference/methods-media?s=send_audio) | `sendAudio` | Sends an audio file (for example mp3). |
| [`send_document`](/reference/methods-media?s=send_document) | `sendDocument` | Sends any file (PDF, ZIP, text, ...). |
| [`send_video`](/reference/methods-media?s=send_video) | `sendVideo` | Sends a video. |
| [`send_animation`](/reference/methods-media?s=send_animation) | `sendAnimation` | Sends an animation (GIF). |
| [`send_voice`](/reference/methods-media?s=send_voice) | `sendVoice` | Sends a voice message. |
| [`send_sticker`](/reference/methods-media?s=send_sticker) | `sendSticker` | Sends a sticker. |
| [`send_media_group`](/reference/methods-media?s=send_media_group) | `sendMediaGroup` | Sends several photos/videos/audio/files as an album. |

::: method
## send_photo {#send_photo}
::: head sendPhoto | Message
:::
::: sig
await bot.send_photo(chat_id, photo, caption=None, reply_to_message_id=None, reply_markup=None)
:::

Sends a photo. Size cap: 10 MB upload, 5 MB by URL.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `photo` | `InputFile \| str` | {req} | A `file_id`, an HTTP URL or an `InputFile` (upload) |
| `caption` | `str` | {opt} | Caption; up to 4096 characters |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
from balegram.types import FSInputFile

await bot.send_photo(12345, FSInputFile("cat.jpg"), caption="My cat 🐱")
await bot.send_photo(12345, "AgACAgQAAxk...")            # file_id
```

**Shortcut:**

```python
await message.answer_photo(photo, caption=None, reply=False)
```

::: tip
After the first upload save the `file_id` and send with it next time.
:::

:::

::: method
## send_audio {#send_audio}
::: head sendAudio | Message
:::
::: sig
await bot.send_audio(chat_id, audio, caption=None, reply_to_message_id=None, reply_markup=None)
:::

Sends an audio file (for example mp3).

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `audio` | `InputFile \| str` | {req} | A `file_id`, an HTTP URL or an `InputFile` (upload) |
| `caption` | `str` | {opt} | Caption; up to 4096 characters |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
await bot.send_audio(12345, FSInputFile("song.mp3"), caption="Song of the day 🎵")
```

**Shortcut:**

```python
await message.answer_audio(audio, caption=None)
```

::: note
For URLs the file must have the correct MIME type (for example `audio/mpeg`).
:::

:::

::: method
## send_document {#send_document}
::: head sendDocument | Message
:::
::: sig
await bot.send_document(chat_id, document, caption=None, reply_to_message_id=None, reply_markup=None)
:::

Sends any file (PDF, ZIP, text, ...). Upload cap 50 MB.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `document` | `InputFile \| str` | {req} | A `file_id`, an HTTP URL or an `InputFile` (upload) |
| `caption` | `str` | {opt} | Caption; up to 4096 characters |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
await bot.send_document(12345, FSInputFile("report.pdf"), caption="Monthly report")
await bot.send_document(12345, BufferedInputFile(b"hello", "hello.txt"))
```

**Shortcut:**

```python
await message.answer_document(document, caption=None)
```

::: note
Sending by URL is supported only for GIF, PDF and ZIP.
:::

:::

::: method
## send_video {#send_video}
::: head sendVideo | Message
:::
::: sig
await bot.send_video(chat_id, video, caption=None, reply_to_message_id=None, reply_markup=None)
:::

Sends a video.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `video` | `InputFile \| str` | {req} | A `file_id`, an HTTP URL or an `InputFile` (upload) |
| `caption` | `str` | {opt} | Caption; up to 4096 characters |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
await bot.send_video(12345, FSInputFile("clip.mp4"), caption="Clip")
```

**Shortcut:**

```python
await message.answer_video(video, caption=None)
```

:::

::: method
## send_animation {#send_animation}
::: head sendAnimation | Message
:::
::: sig
await bot.send_animation(chat_id, animation, caption=None, reply_to_message_id=None, reply_markup=None)
:::

Sends an animation (GIF).

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `animation` | `InputFile \| str` | {req} | A `file_id`, an HTTP URL or an `InputFile` (upload) |
| `caption` | `str` | {opt} | Caption; up to 4096 characters |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
await bot.send_animation(12345, FSInputFile("dance.gif"))
```

**Shortcut:**

```python
await message.answer_animation(animation, caption=None)
```

:::

::: method
## send_voice {#send_voice}
::: head sendVoice | Message
:::
::: sig
await bot.send_voice(chat_id, voice, caption=None, reply_to_message_id=None, reply_markup=None)
:::

Sends a voice message. The file must be `audio/ogg`.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `voice` | `InputFile \| str` | {req} | A `file_id`, an HTTP URL or an `InputFile` (upload) |
| `caption` | `str` | {opt} | Caption; up to 4096 characters |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
await bot.send_voice(12345, FSInputFile("note.ogg"))
```

**Shortcut:**

```python
await message.answer_voice(voice, caption=None)
```

::: warn
Files under 1 MB appear as voice messages and 1 to 20 MB as documents.
:::

:::

::: method
## send_sticker {#send_sticker}
::: head sendSticker | Message
:::
::: sig
await bot.send_sticker(chat_id, sticker, reply_to_message_id=None, reply_markup=None)
:::

Sends a sticker.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `sticker` | `InputFile \| str` | {req} | A `file_id`, an HTTP URL or an `InputFile` (upload) |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |
| `reply_markup` | `ReplyMarkup` | {opt} | An inline or reply keyboard (or `ReplyKeyboardRemove`) |

**Returns:** `Message`

#### Example

```python
await bot.send_sticker(12345, "CAACAgQAAxk...")      # file_id
```

::: note
This method is not listed on Bale's docs page but exists in the Bot API; tell us if it errors.
:::

:::

::: method
## send_media_group {#send_media_group}
::: head sendMediaGroup | list[Message]
:::
::: sig
await bot.send_media_group(chat_id, media, reply_to_message_id=None)
:::

Sends several photos/videos/audio/files as an album.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `media` | `list[InputMedia*]` | {req} | A list of `InputMediaPhoto`, `InputMediaVideo`, `InputMediaAnimation`, `InputMediaAudio` or `InputMediaDocument` (2 to 10 items) |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |

**Returns:** `list[Message]`

#### Example

```python
from balegram.utils import MediaGroupBuilder

album = MediaGroupBuilder(caption="Trip")
album.add_photo(FSInputFile("1.jpg")).add_photo(FSInputFile("2.jpg"))
messages = await bot.send_media_group(12345, album.build())
```

::: tip
Each item's caption is up to 1024 characters. `MediaGroupBuilder` makes albums easier.
:::

:::

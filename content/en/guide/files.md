---
title: Sending & receiving files
lead: Send photos, videos, audio and files in three ways (file_id, URL, upload), albums, and download files that users send.
---

## Three ways to send a file

| Method | What you pass | Size cap (per Bale docs) |
|---|---|---|
| **file_id** | an id Bale gave earlier | unlimited; **fastest and recommended** |
| **URL** | an HTTP address; Bale downloads it | photo 5 MB, others 20 MB |
| **upload** | the file itself (multipart) | photo 10 MB, others 50 MB |

In balegram the file argument accepts all three: a string (file_id or URL) or an `InputFile` object (upload).

## Uploading

```python
from balegram.types import BufferedInputFile, FSInputFile

# from disk (read when sending)
await message.answer_document(FSInputFile("report.pdf"), caption="Monthly report")

# from memory (bytes)
data = make_chart_png()
await message.answer_photo(BufferedInputFile(data, "chart.png"), caption="Chart")

# a custom file name for the user
await message.answer_document(FSInputFile("tmp/x7f3.bin", filename="invoice.pdf"))
```

| Class | Use |
|---|---|
| `FSInputFile(path, filename=None)` | a file on disk |
| `BufferedInputFile(bytes, filename)` | data in memory |

## Sending by file_id and URL

```python
await message.answer_photo("AgACAgQAAxk...")                  # file_id
await message.answer_photo("https://example.com/cat.jpg")     # URL
```

::: tip Save the file_id
After the first upload Bale gives the file a `file_id` (`sent.photo[-1].file_id`). Store it in a database and next time send with it instead of uploading again; it is much faster. Note: a `file_id` belongs to **that bot only**.
:::

## All send kinds

| Method (shortcut on Message) | Bot method |
|---|---|
| `answer_photo(photo, caption)` | `send_photo` |
| `answer_document(document, caption)` | `send_document` |
| `answer_video(video, caption)` | `send_video` |
| `answer_audio(audio, caption)` | `send_audio` |
| `answer_voice(voice, caption)` | `send_voice` |
| `answer_animation(animation, caption)` | `send_animation` |
| `answer_location(lat, lon)` | `send_location` |
| `answer_contact(phone, first_name)` | `send_contact` |
| — | `send_sticker` |
| — | `send_media_group` |

To reply to the user's message pass `reply=True`: `await message.answer_photo(img, reply=True)`.

::: warn Voice must be ogg
`send_voice` needs `audio/ogg`. Files of 1 to 20 MB are shown as documents and under 1 MB as voice messages. For mp3 use `send_audio`.
:::

## Albums (media group)

```python
from balegram.utils import MediaGroupBuilder

album = MediaGroupBuilder(caption="North trip 🌲")        # caption on the first photo
album.add_photo(FSInputFile("a.jpg"))
album.add_photo(FSInputFile("b.jpg"))
album.add_photo("AgACAgQAAxk...")                         # a file_id works too
album.add_video("BAACAgQAAxk...", caption="Video")

await bot.send_media_group(message.chat.id, album.build())
```

An album has at least 2 and at most 10 items. Each item may have its own caption (up to 1024 characters).

## Receiving files from users

When a user sends a photo, file and so on, the fields `photo`, `document`, `video`, `audio`, `voice`, `animation` and `sticker` of `Message` are filled:

```python
@dp.message(F.photo)
async def got_photo(message: Message):
    best = message.photo[-1]                  # the last element = the largest size
    await message.answer(f"Got a {best.width}x{best.height} photo")


@dp.message(F.document)
async def got_doc(message: Message):
    doc = message.document
    await message.answer(f"File “{doc.file_name}” ({doc.file_size} bytes)")
```

The shortcut `message.file_id` gives the message's media id (the largest size for photos).

## Downloading files

```python
# to memory
buf = await message.download()                 # BytesIO
data = buf.read()

# to disk
await message.download("downloads/file.bin")

# with Bot and a file_id
await bot.download(file_id, "downloads/x.jpg")
info = await bot.get_file(file_id)             # File: file_path and file_size
```

::: note Download cap
Per the docs, `getFile` serves files up to 20 MB only. The download link is valid for about an hour; `bot.download` always fetches a fresh one.
:::

## Full example: echo any media

```python
@dp.message(F.photo | F.video | F.audio | F.voice | F.document | F.animation | F.sticker)
async def echo_media(message: Message, bot: Bot):
    kind = message.content_type            # "photo" | "video" | ...
    fid = message.file_id
    chat = message.chat.id
    info = await bot.get_file(fid)
    note = f"📦 {kind} — {info.file_size or '?'} bytes"
    if kind == "photo":
        await bot.send_photo(chat, fid, note)
    elif kind == "video":
        await bot.send_video(chat, fid, note)
    elif kind == "sticker":
        await bot.send_sticker(chat, fid)
    else:
        await bot.send_document(chat, fid, note)
```

## Summary

- Send: `file_id` > URL > upload (`FSInputFile` / `BufferedInputFile`).
- Albums with `MediaGroupBuilder`.
- Receive: `message.photo[-1]`, download with `message.download()`.
- Next: [Running: polling & webhook](/guide/running).

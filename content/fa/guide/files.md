---
title: ارسال و دریافت فایل
lead: ارسال عکس، ویدیو، صدا و فایل به سه روش (file_id، لینک، آپلود)، آلبوم، و دانلود فایل‌هایی که کاربر می‌فرستد.
---

## سه راه برای ارسال فایل

| روش | چه می‌دهید؟ | سقف حجم (طبق مستندات بله) |
|---|---|---|
| **file_id** | شناسه‌ای که بله قبلاً داده | بدون محدودیت؛ **سریع‌ترین و پیشنهادی** |
| **لینک (URL)** | آدرس HTTP فایل؛ بله خودش دانلود می‌کند | عکس ۵ مگابایت، بقیه ۲۰ مگابایت |
| **آپلود** | خود فایل (multipart) | عکس ۱۰ مگابایت، بقیه ۵۰ مگابایت |

در balegram آرگومان فایل هر سه را می‌پذیرد: رشته (file_id یا لینک) یا شیء `InputFile` (آپلود).

## آپلود

```python
from balegram.types import BufferedInputFile, FSInputFile

# از روی دیسک (موقع ارسال خوانده می‌شود)
await message.answer_document(FSInputFile("report.pdf"), caption="گزارش ماهانه")

# از حافظه (bytes)
data = make_chart_png()
await message.answer_photo(BufferedInputFile(data, "chart.png"), caption="نمودار")

# نام فایل دلخواه برای کاربر
await message.answer_document(FSInputFile("tmp/x7f3.bin", filename="فاکتور.pdf"))
```

| کلاس | کاربرد |
|---|---|
| `FSInputFile(path, filename=None)` | فایلی روی دیسک |
| `BufferedInputFile(bytes, filename)` | داده‌ی داخل حافظه |

## ارسال با file_id و لینک

```python
await message.answer_photo("AgACAgQAAxk...")                  # file_id
await message.answer_photo("https://example.com/cat.jpg")     # لینک
```

::: tip file_id را ذخیره کنید
بعد از اولین آپلود، بله برای فایل یک `file_id` می‌دهد (`sent.photo[-1].file_id`). آن را در دیتابیس بگذارید و دفعات بعد به‌جای آپلود مجدد با همان بفرستید؛ خیلی سریع‌تر است. توجه: `file_id` مخصوص **همان ربات** است.
:::

## همه‌ی انواع ارسال

| متد (shortcut روی Message) | متد Bot |
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

برای ریپلای به پیام کاربر، `reply=True` بدهید: `await message.answer_photo(img, reply=True)`.

::: warn ویس باید ogg باشد
`send_voice` فایل `audio/ogg` می‌خواهد. فایل‌های ۱ تا ۲۰ مگابایت به‌صورت سند و زیر ۱ مگابایت به‌صورت ویس نمایش داده می‌شوند. برای mp3 از `send_audio` استفاده کنید.
:::

## آلبوم (media group)

```python
from balegram.utils import MediaGroupBuilder

album = MediaGroupBuilder(caption="سفر شمال 🌲")        # کپشن روی اولین عکس
album.add_photo(FSInputFile("a.jpg"))
album.add_photo(FSInputFile("b.jpg"))
album.add_photo("AgACAgQAAxk...")                       # file_id هم می‌شود
album.add_video("BAACAgQAAxk...", caption="ویدیو")

await bot.send_media_group(message.chat.id, album.build())
```

آلبوم حداقل ۲ و حداکثر ۱۰ مورد دارد. هر مورد کپشن جدا (تا ۱۰۲۴ نویسه) می‌تواند داشته باشد.

## دریافت فایل از کاربر

وقتی کاربر عکس، فایل و ... می‌فرستد، فیلدهای `photo`، `document`، `video`، `audio`، `voice`، `animation` و `sticker` روی `Message` پر می‌شوند:

```python
@dp.message(F.photo)
async def got_photo(message: Message):
    best = message.photo[-1]                  # آخرین عنصر = بزرگ‌ترین اندازه
    await message.answer(f"عکس {best.width}x{best.height} دریافت شد")


@dp.message(F.document)
async def got_doc(message: Message):
    doc = message.document
    await message.answer(f"فایل «{doc.file_name}» ({doc.file_size} بایت)")
```

میانبر `message.file_id` شناسه‌ی رسانه‌ی پیام را (برای عکس، بزرگ‌ترین اندازه) می‌دهد.

## دانلود فایل

```python
# به حافظه
buf = await message.download()                 # BytesIO
data = buf.read()

# روی دیسک
await message.download("downloads/file.bin")

# با Bot و file_id
await bot.download(file_id, "downloads/x.jpg")
info = await bot.get_file(file_id)             # File: file_path و file_size
```

::: note سقف دانلود
طبق مستندات، `getFile` فقط فایل‌های تا ۲۰ مگابایت را می‌دهد. لینک دانلود حدود یک ساعت معتبر است؛ `bot.download` همیشه لینک تازه می‌گیرد.
:::

## مثال کامل: برگرداندن هر رسانه

```python
@dp.message(F.photo | F.video | F.audio | F.voice | F.document | F.animation | F.sticker)
async def echo_media(message: Message, bot: Bot):
    kind = message.content_type            # "photo" | "video" | ...
    fid = message.file_id
    chat = message.chat.id
    info = await bot.get_file(fid)
    note = f"📦 {kind} — {info.file_size or '?'} بایت"
    if kind == "photo":
        await bot.send_photo(chat, fid, note)
    elif kind == "video":
        await bot.send_video(chat, fid, note)
    elif kind == "sticker":
        await bot.send_sticker(chat, fid)
    else:
        await bot.send_document(chat, fid, note)
```

## خلاصه

- ارسال: `file_id` > لینک > آپلود (`FSInputFile` / `BufferedInputFile`).
- آلبوم با `MediaGroupBuilder`.
- دریافت: `message.photo[-1]`، دانلود با `message.download()`.
- بعدی: [اجرا: Polling و Webhook](/guide/running).

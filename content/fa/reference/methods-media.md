---
title: متدها: رسانه
lead: ارسال عکس، صدا، فایل، ویدیو، گیف، ویس، استیکر و آلبوم.
---

همه‌ی مثال‌های این صفحه فرض می‌کنند این importها را دارید:

```python
from balegram.types import FSInputFile, BufferedInputFile
```

آرگومان فایل سه شکل می‌پذیرد: `file_id`، لینک HTTP یا `InputFile` برای آپلود. جزئیات در درس [ارسال و دریافت فایل](/guide/files).

## فهرست متدها

| متد | نام در Bot API | کار |
|---|---|---|
| [`send_photo`](/reference/methods-media?s=send_photo) | `sendPhoto` | یک عکس می‌فرستد. |
| [`send_audio`](/reference/methods-media?s=send_audio) | `sendAudio` | یک فایل صوتی (مثلاً mp3) می‌فرستد. |
| [`send_document`](/reference/methods-media?s=send_document) | `sendDocument` | یک فایل دلخواه (PDF، ZIP، متن و ...) می‌فرستد. |
| [`send_video`](/reference/methods-media?s=send_video) | `sendVideo` | یک ویدیو می‌فرستد. |
| [`send_animation`](/reference/methods-media?s=send_animation) | `sendAnimation` | یک انیمیشن (گیف) می‌فرستد. |
| [`send_voice`](/reference/methods-media?s=send_voice) | `sendVoice` | یک پیام صوتی (ویس) می‌فرستد. |
| [`send_sticker`](/reference/methods-media?s=send_sticker) | `sendSticker` | یک استیکر می‌فرستد. |
| [`send_media_group`](/reference/methods-media?s=send_media_group) | `sendMediaGroup` | چند عکس/ویدیو/صدا/فایل را به‌صورت آلبوم می‌فرستد. |

::: method
## send_photo {#send_photo}
::: head sendPhoto | Message
:::
::: sig
await bot.send_photo(chat_id, photo, caption=None, reply_to_message_id=None, reply_markup=None)
:::

یک عکس می‌فرستد. سقف حجم: آپلود ۱۰ مگابایت، لینک ۵ مگابایت.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `photo` | `InputFile \| str` | {req} | `file_id`، لینک HTTP یا شیء `InputFile` (آپلود) |
| `caption` | `str` | {opt} | کپشن؛ تا ۴۰۹۶ نویسه |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
from balegram.types import FSInputFile

await bot.send_photo(12345, FSInputFile("cat.jpg"), caption="گربه‌ی من 🐱")
await bot.send_photo(12345, "AgACAgQAAxk...")            # file_id
```

**میانبر:**

```python
await message.answer_photo(photo, caption=None, reply=False)
```

::: tip
بعد از اولین آپلود، `file_id` را ذخیره کنید و دفعات بعد با آن بفرستید.
:::

:::

::: method
## send_audio {#send_audio}
::: head sendAudio | Message
:::
::: sig
await bot.send_audio(chat_id, audio, caption=None, reply_to_message_id=None, reply_markup=None)
:::

یک فایل صوتی (مثلاً mp3) می‌فرستد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `audio` | `InputFile \| str` | {req} | `file_id`، لینک HTTP یا شیء `InputFile` (آپلود) |
| `caption` | `str` | {opt} | کپشن؛ تا ۴۰۹۶ نویسه |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
await bot.send_audio(12345, FSInputFile("song.mp3"), caption="آهنگ امروز 🎵")
```

**میانبر:**

```python
await message.answer_audio(audio, caption=None)
```

::: note
برای لینک، نوع MIME فایل باید درست باشد (مثلاً `audio/mpeg`).
:::

:::

::: method
## send_document {#send_document}
::: head sendDocument | Message
:::
::: sig
await bot.send_document(chat_id, document, caption=None, reply_to_message_id=None, reply_markup=None)
:::

یک فایل دلخواه (PDF، ZIP، متن و ...) می‌فرستد. سقف حجم آپلود ۵۰ مگابایت.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `document` | `InputFile \| str` | {req} | `file_id`، لینک HTTP یا شیء `InputFile` (آپلود) |
| `caption` | `str` | {opt} | کپشن؛ تا ۴۰۹۶ نویسه |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
await bot.send_document(12345, FSInputFile("report.pdf"), caption="گزارش ماهانه")
await bot.send_document(12345, BufferedInputFile(b"hello", "hello.txt"))
```

**میانبر:**

```python
await message.answer_document(document, caption=None)
```

::: note
ارسال با لینک فقط برای GIF، PDF و ZIP پشتیبانی می‌شود.
:::

:::

::: method
## send_video {#send_video}
::: head sendVideo | Message
:::
::: sig
await bot.send_video(chat_id, video, caption=None, reply_to_message_id=None, reply_markup=None)
:::

یک ویدیو می‌فرستد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `video` | `InputFile \| str` | {req} | `file_id`، لینک HTTP یا شیء `InputFile` (آپلود) |
| `caption` | `str` | {opt} | کپشن؛ تا ۴۰۹۶ نویسه |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
await bot.send_video(12345, FSInputFile("clip.mp4"), caption="کلیپ")
```

**میانبر:**

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

یک انیمیشن (گیف) می‌فرستد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `animation` | `InputFile \| str` | {req} | `file_id`، لینک HTTP یا شیء `InputFile` (آپلود) |
| `caption` | `str` | {opt} | کپشن؛ تا ۴۰۹۶ نویسه |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
await bot.send_animation(12345, FSInputFile("dance.gif"))
```

**میانبر:**

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

یک پیام صوتی (ویس) می‌فرستد. فایل باید `audio/ogg` باشد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `voice` | `InputFile \| str` | {req} | `file_id`، لینک HTTP یا شیء `InputFile` (آپلود) |
| `caption` | `str` | {opt} | کپشن؛ تا ۴۰۹۶ نویسه |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
await bot.send_voice(12345, FSInputFile("note.ogg"))
```

**میانبر:**

```python
await message.answer_voice(voice, caption=None)
```

::: warn
فایل‌های زیر ۱ مگابایت به‌صورت ویس و ۱ تا ۲۰ مگابایت به‌صورت سند نمایش داده می‌شوند.
:::

:::

::: method
## send_sticker {#send_sticker}
::: head sendSticker | Message
:::
::: sig
await bot.send_sticker(chat_id, sticker, reply_to_message_id=None, reply_markup=None)
:::

یک استیکر می‌فرستد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `sticker` | `InputFile \| str` | {req} | `file_id`، لینک HTTP یا شیء `InputFile` (آپلود) |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |
| `reply_markup` | `ReplyMarkup` | {opt} | کیبورد inline یا reply (یا `ReplyKeyboardRemove`) |

**خروجی:** `Message`

#### مثال

```python
await bot.send_sticker(12345, "CAACAgQAAxk...")      # file_id
```

::: note
این متد در صفحه‌ی مستندات بله فهرست نشده ولی در Bot API استفاده می‌شود؛ اگر خطا گرفتید بگویید.
:::

:::

::: method
## send_media_group {#send_media_group}
::: head sendMediaGroup | list[Message]
:::
::: sig
await bot.send_media_group(chat_id, media, reply_to_message_id=None)
:::

چند عکس/ویدیو/صدا/فایل را به‌صورت آلبوم می‌فرستد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `media` | `list[InputMedia*]` | {req} | لیست `InputMediaPhoto`، `InputMediaVideo`، `InputMediaAnimation`، `InputMediaAudio` یا `InputMediaDocument` (۲ تا ۱۰ مورد) |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |

**خروجی:** `list[Message]`

#### مثال

```python
from balegram.utils import MediaGroupBuilder

album = MediaGroupBuilder(caption="سفر")
album.add_photo(FSInputFile("1.jpg")).add_photo(FSInputFile("2.jpg"))
messages = await bot.send_media_group(12345, album.build())
```

::: tip
کپشن هر مورد تا ۱۰۲۴ نویسه است. با `MediaGroupBuilder` ساخت آلبوم ساده‌تر است.
:::

:::

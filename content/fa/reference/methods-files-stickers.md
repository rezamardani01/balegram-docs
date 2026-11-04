---
title: متدها: فایل و استیکر
lead: دریافت و دانلود فایل و مدیریت ست‌های استیکر.
---

## فهرست متدها

| متد | نام در Bot API | کار |
|---|---|---|
| [`get_file`](/reference/methods-files-stickers?s=get_file) | `getFile` | اطلاعات فایل (مسیر دانلود و حجم) را از روی `file_id` می‌گیرد. |
| [`download`](/reference/methods-files-stickers?s=download) | `(file download)` | فایل را دانلود می‌کند (خودش `getFile` و لینک تازه را مدیریت می‌کند). |
| [`upload_sticker_file`](/reference/methods-files-stickers?s=upload_sticker_file) | `uploadStickerFile` | فایل استیکر (`.webp`، `.png`، `.tgs`، `.webm`) را آپلود می‌کند تا در ست استیکر استفاده شود. |
| [`create_new_sticker_set`](/reference/methods-files-stickers?s=create_new_sticker_set) | `createNewStickerSet` | یک ست استیکر جدید می‌سازد. |
| [`add_sticker_to_set`](/reference/methods-files-stickers?s=add_sticker_to_set) | `addStickerToSet` | یک استیکر به ست موجود اضافه می‌کند. |
| [`get_sticker_set`](/reference/methods-files-stickers?s=get_sticker_set) | `getStickerSet` | اطلاعات یک ست استیکر و فهرست استیکرهایش را می‌دهد. |

::: method
## get_file {#get_file}
::: head getFile | File
:::
::: sig
await bot.get_file(file_id)
:::

اطلاعات فایل (مسیر دانلود و حجم) را از روی `file_id` می‌گیرد. لینک دانلود حدود یک ساعت معتبر است.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `file_id` | `str` | {req} |  |

**خروجی:** `File`

#### مثال

```python
info = await bot.get_file(message.photo[-1].file_id)
print(info.file_path, info.file_size)
```

::: note
فقط فایل‌های تا ۲۰ مگابایت قابل دریافت‌اند.
:::

:::

::: method
## download {#download}
::: head (file download) | BinaryIO | None
:::
::: sig
await bot.download(file, destination=None, chunk_size=65536)
:::

فایل را دانلود می‌کند (خودش `getFile` و لینک تازه را مدیریت می‌کند). بدون `destination` یک `BytesIO` برمی‌گرداند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `file` | `str \| File` | {req} | `file_id` یا شیء `File` |
| `destination` | `str \| Path \| BinaryIO` | {opt} | مسیر ذخیره یا شیء فایل؛ خالی = برگرداندن در حافظه |
| `chunk_size` | `int` | {opt} | اندازه‌ی تکه‌های دانلود |

**خروجی:** `BinaryIO | None`

#### مثال

```python
buf = await bot.download(file_id)                    # BytesIO
await bot.download(file_id, "downloads/photo.jpg")    # روی دیسک
```

**میانبر:**

```python
await message.download(destination=None)
```

:::

::: method
## upload_sticker_file {#upload_sticker_file}
::: head uploadStickerFile | File
:::
::: sig
await bot.upload_sticker_file(user_id, sticker)
:::

فایل استیکر (`.webp`، `.png`، `.tgs`، `.webm`) را آپلود می‌کند تا در ست استیکر استفاده شود.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `user_id` | `int` | {req} | صاحب ست استیکر |
| `sticker` | `InputFile` | {req} | `file_id`، لینک HTTP یا شیء `InputFile` (آپلود) |

**خروجی:** `File`

#### مثال

```python
uploaded = await bot.upload_sticker_file(12345, FSInputFile("smile.png"))
print(uploaded.file_id)
```

:::

::: method
## create_new_sticker_set {#create_new_sticker_set}
::: head createNewStickerSet | bool
:::
::: sig
await bot.create_new_sticker_set(user_id, name, title, stickers)
:::

یک ست استیکر جدید می‌سازد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `user_id` | `int` | {req} | شناسه‌ی عددی کاربر |
| `name` | `str` | {req} | نام یکتا؛ ۱ تا ۶۴ نویسه |
| `title` | `str` | {req} | عنوان؛ ۱ تا ۶۴ نویسه |
| `stickers` | `list[InputSticker]` | {req} | ۱ تا ۵۰ استیکر |

**خروجی:** `bool`

#### مثال

```python
from balegram.methods.misc import InputSticker

uploaded = await bot.upload_sticker_file(12345, FSInputFile("smile.png"))
await bot.create_new_sticker_set(
    12345, name="my_set", title="ست من",
    stickers=[InputSticker(sticker=uploaded.file_id, emoji_list=["😀"])],
)
```

::: warn
مستندات بله ساختار `InputSticker` را تعریف نکرده است. این شکل (`sticker` و `emoji_list`) بر اساس رایج‌ترین قالب است؛ اگر خطا گرفتید به ما خبر بدهید.
:::

:::

::: method
## add_sticker_to_set {#add_sticker_to_set}
::: head addStickerToSet | bool
:::
::: sig
await bot.add_sticker_to_set(user_id, name, sticker)
:::

یک استیکر به ست موجود اضافه می‌کند.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `user_id` | `int` | {req} | شناسه‌ی عددی کاربر |
| `name` | `str` | {req} | نام ست |
| `sticker` | `InputSticker` | {req} |  |

**خروجی:** `bool`

#### مثال

```python
await bot.add_sticker_to_set(12345, "my_set", InputSticker(sticker=uploaded.file_id, emoji_list=["🔥"]))
```

:::

::: method
## get_sticker_set {#get_sticker_set}
::: head getStickerSet | StickerSet
:::
::: sig
await bot.get_sticker_set(name)
:::

اطلاعات یک ست استیکر و فهرست استیکرهایش را می‌دهد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `name` | `str` | {req} | نام ست |

**خروجی:** `StickerSet`

#### مثال

```python
sticker_set = await bot.get_sticker_set("my_set")
await bot.send_sticker(12345, sticker_set.stickers[0].file_id)
```

::: note
این متد در مستندات فعلی بله فهرست نشده ولی در Bot API وجود دارد.
:::

:::

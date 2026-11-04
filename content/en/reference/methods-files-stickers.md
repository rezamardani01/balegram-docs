---
title: Methods: files & stickers
lead: Getting and downloading files and managing sticker sets.
---

## Methods at a glance

| Method | Bot API name | What it does |
|---|---|---|
| [`get_file`](/reference/methods-files-stickers?s=get_file) | `getFile` | Gets a file's info (download path and size) from a `file_id`. |
| [`download`](/reference/methods-files-stickers?s=download) | `(file download)` | Downloads a file (it handles `getFile` and the fresh link itself). |
| [`upload_sticker_file`](/reference/methods-files-stickers?s=upload_sticker_file) | `uploadStickerFile` | Uploads a sticker file (`.webp`, `.png`, `.tgs`, `.webm`) to use in a sticker set. |
| [`create_new_sticker_set`](/reference/methods-files-stickers?s=create_new_sticker_set) | `createNewStickerSet` | Creates a new sticker set. |
| [`add_sticker_to_set`](/reference/methods-files-stickers?s=add_sticker_to_set) | `addStickerToSet` | Adds a sticker to an existing set. |
| [`get_sticker_set`](/reference/methods-files-stickers?s=get_sticker_set) | `getStickerSet` | Returns a sticker set and its stickers. |

::: method
## get_file {#get_file}
::: head getFile | File
:::
::: sig
await bot.get_file(file_id)
:::

Gets a file's info (download path and size) from a `file_id`. The download link is valid for about an hour.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `file_id` | `str` | {req} |  |

**Returns:** `File`

#### Example

```python
info = await bot.get_file(message.photo[-1].file_id)
print(info.file_path, info.file_size)
```

::: note
Only files up to 20 MB can be fetched.
:::

:::

::: method
## download {#download}
::: head (file download) | BinaryIO | None
:::
::: sig
await bot.download(file, destination=None, chunk_size=65536)
:::

Downloads a file (it handles `getFile` and the fresh link itself). Without `destination` it returns a `BytesIO`.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `file` | `str \| File` | {req} | A `file_id` or a `File` object |
| `destination` | `str \| Path \| BinaryIO` | {opt} | Save path or file object; empty = return in memory |
| `chunk_size` | `int` | {opt} | Download chunk size |

**Returns:** `BinaryIO | None`

#### Example

```python
buf = await bot.download(file_id)                    # BytesIO
await bot.download(file_id, "downloads/photo.jpg")    # to disk
```

**Shortcut:**

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

Uploads a sticker file (`.webp`, `.png`, `.tgs`, `.webm`) to use in a sticker set.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user_id` | `int` | {req} | The owner of the sticker set |
| `sticker` | `InputFile` | {req} | A `file_id`, an HTTP URL or an `InputFile` (upload) |

**Returns:** `File`

#### Example

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

Creates a new sticker set.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user_id` | `int` | {req} | Numeric user id |
| `name` | `str` | {req} | Unique name; 1 to 64 characters |
| `title` | `str` | {req} | Title; 1 to 64 characters |
| `stickers` | `list[InputSticker]` | {req} | 1 to 50 stickers |

**Returns:** `bool`

#### Example

```python
from balegram.methods.misc import InputSticker

uploaded = await bot.upload_sticker_file(12345, FSInputFile("smile.png"))
await bot.create_new_sticker_set(
    12345, name="my_set", title="My set",
    stickers=[InputSticker(sticker=uploaded.file_id, emoji_list=["😀"])],
)
```

::: warn
Bale's docs do not define `InputSticker`. This shape (`sticker` and `emoji_list`) follows the most common format; tell us if it errors.
:::

:::

::: method
## add_sticker_to_set {#add_sticker_to_set}
::: head addStickerToSet | bool
:::
::: sig
await bot.add_sticker_to_set(user_id, name, sticker)
:::

Adds a sticker to an existing set.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `user_id` | `int` | {req} | Numeric user id |
| `name` | `str` | {req} | The set name |
| `sticker` | `InputSticker` | {req} |  |

**Returns:** `bool`

#### Example

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

Returns a sticker set and its stickers.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `name` | `str` | {req} | The set name |

**Returns:** `StickerSet`

#### Example

```python
sticker_set = await bot.get_sticker_set("my_set")
await bot.send_sticker(12345, sticker_set.stickers[0].file_id)
```

::: note
This method is not listed in Bale's current docs but exists in the Bot API.
:::

:::

---
title: ابزارهای کمکی
lead: لینک عمیق، قالب‌بندی Markdown بله، تقسیم متن بلند، نشانگر «در حال تایپ» و ساخت آلبوم.
---

همه‌ی این‌ها در `balegram.utils` هستند:

```python
from balegram.utils import (
    bold, italic, link, split_text,
    bot_link, create_start_link, encode_payload, decode_payload,
    ChatActionSender, MediaGroupBuilder,
    InlineKeyboardBuilder, ReplyKeyboardBuilder,
)
```

## قالب‌بندی متن (Markdown بله)

بله متن همه‌ی پیام‌ها را **Markdown** می‌خواند:

| می‌خواهید | بنویسید | نتیجه |
|---|---|---|
| **پررنگ** | `**متن**` | پررنگ |
| *کج* | `__متن__` | کج |
| لینک | `[برچسب](https://...)` | لینک |

::: warn فاصله‌ی لازم
طبق مستندات بله، پیش از شروع و پس از پایان نشانه‌ی پررنگ/کج یک **فاصله** لازم است و در لینک بین `]` و `(` نباید فاصله باشد.
:::

```python
from balegram.utils import bold, italic, link

text = f"قیمت: {bold('۱۰۰ هزار')} تومان، {italic('ارسال رایگان')}. جزئیات: {link('سایت', 'https://example.com')}"
await message.answer(text)
```

## تقسیم متن بلند: split_text

بله هر پیام را تا **۴۰۹۶ نویسه** می‌پذیرد. برای متن‌های بلندتر:

```python
from balegram.utils import split_text

for part in split_text(very_long_report):            # پیش‌فرض ۴۰۹۶
    await message.answer(part)

split_text(text, limit=1000)                         # سقف دلخواه
```

برش اولویت‌دار انجام می‌شود: ابتدا در خط جدید، بعد فاصله، و در نهایت وسط کلمه. فاصله‌های ابتدا/انتهای هر تکه حذف می‌شود.

## لینک عمیق (Deep link)

لینک ربات در بله: `https://ble.ir/<نام_ربات>?start=<پارامتر>`. کاربر که بزند، ربات `/start <پارامتر>` را می‌گیرد؛ مناسب برای کد دعوت، کمپین و مسیر ویژه.

```python
from balegram.utils import create_start_link, bot_link

link = await create_start_link(bot, "ref42")            # نام ربات را از getMe می‌گیرد
# https://ble.ir/mybot?start=ref42

bot_link("mybot", "campaign 1")                          # بدون تماس شبکه: ...?start=campaign%201
```

### پارامتر رمزگذاری‌شده

برای مقدارهایی با نویسه‌ی خاص یا فارسی، `encode=True` بگذارید (base64 امن برای URL):

```python
link = await create_start_link(bot, "user=5&from=سایت", encode=True)
```

```python
@dp.message(CommandStart(deep_link=True, encoded=True))
async def start(message: Message, command: CommandObject):
    print(command.args)          # "user=5&from=سایت" (رمزگشایی‌شده)
```

| تابع | کار |
|---|---|
| `bot_link(username, payload=None, encode=False)` | ساخت لینک (sync) |
| `create_start_link(bot, payload=None, encode=False)` | همان با `getMe` (async) |
| `encode_payload(text)` / `decode_payload(text)` | رمزگذاری base64 امن |

## ChatActionSender: «در حال تایپ…»

کار طولانی؟ تا تمام نشده، نشانگر را نگه دارید:

```python
from balegram.utils import ChatActionSender

@dp.message(Command("report"))
async def report(message: Message, bot: Bot):
    async with ChatActionSender.typing(bot, message.chat.id):
        result = await generate_big_report()          # ۱۰ ثانیه
    await message.answer(result)
```

هر ~۴ ثانیه `sendChatAction` تکرار می‌شود و با خروج از بلوک خودکار متوقف می‌شود. حالت‌های دیگر:

| سازنده | عمل |
|---|---|
| `ChatActionSender.typing` | در حال تایپ |
| `.upload_photo` | در حال ارسال عکس |
| `.upload_video` | در حال ارسال ویدیو |
| `.record_voice` | در حال ضبط ویس |
| `.upload_voice` | در حال ارسال ویس |

برای یک بار: `await message.answer_chat_action(ChatAction.TYPING)`.

## MediaGroupBuilder

```python
from balegram.utils import MediaGroupBuilder

album = MediaGroupBuilder(caption="تعطیلات")
album.add_photo(FSInputFile("1.jpg")).add_photo("file_id").add_video("video_id")
await bot.send_media_group(chat_id, album.build())
```

متدها: `add_photo`، `add_video`، `add_animation`، `add_audio`، `add_document`. حداقل ۲ و حداکثر ۱۰ مورد.

## کیبوردسازها

در درس [کیبورد و دکمه رنگی](/guide/keyboards) کامل توضیح داده شده‌اند: `InlineKeyboardBuilder`، `ReplyKeyboardBuilder`.

## مثال کامل: لینک دعوت با پاداش

```python
@dp.message(Command("invite"))
async def invite(message: Message, bot: Bot):
    url = await create_start_link(bot, f"ref{message.from_user.id}")
    await message.answer(f"دوستانت را دعوت کن:\n{url}")


@dp.message(CommandStart(deep_link=True))
async def start_with_ref(message: Message, command: CommandObject):
    inviter = command.args.removeprefix("ref")
    await give_bonus(int(inviter))
    await message.answer("خوش آمدی! دعوت‌کننده‌ات امتیاز گرفت 🎁")
```

## خلاصه

- Markdown بله: `**پررنگ**`، `__کج__`، `[لینک](url)`.
- `split_text` برای متن بلند؛ `ChatActionSender` برای کارهای کند.
- `create_start_link` برای لینک عمیق.
- بعدی: [تست کردن ربات](/guide/testing).

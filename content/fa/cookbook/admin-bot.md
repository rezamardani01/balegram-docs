---
title: ربات مدیریت گروه
lead: خوش‌آمدگویی، بن و آزادسازی، پین، حذف لینک تبلیغاتی و اخطار؛ همه فقط برای ادمین‌ها.
---

## چه می‌سازیم؟

| دستور / رویداد | کار |
|---|---|
| ورود عضو جدید | پیام خوش‌آمد |
| `/ban` (ریپلای) | اخراج و بن |
| `/unban` (ریپلای) | آزادسازی |
| `/pin` (ریپلای) | پین پیام |
| `/warn` (ریپلای) | اخطار؛ با ۳ اخطار بن خودکار |
| پیام حاوی لینک از عضو عادی | حذف خودکار |

::: warn پیش‌نیاز
ربات را به گروه اضافه کنید و **ادمین** کنید (حق حذف پیام و مسدودسازی). بدون ادمین بودن، `ban` و `delete` خطا می‌دهند.
:::

مفاهیم: [روتر و فیلتر سطح Router](/guide/routers)، `IsChatAdmin` ([مرجع فیلترها](/reference/filters-ref))، [متدهای چت](/reference/methods-chats).

## کد کامل

```python title="admin_bot.py"
import asyncio
from collections import defaultdict

from balegram import Bot, Dispatcher, F, Router
from balegram.exceptions import BaleAPIError
from balegram.filters import ChatTypeFilter, Command, IsChatAdmin
from balegram.types import Message

TOKEN = "YOUR_BOT_TOKEN"
MAX_WARNS = 3

router = Router(name="admin")
router.message.filter(ChatTypeFilter("group", "supergroup"))        # فقط گروه‌ها
warns: dict[tuple[int, int], int] = defaultdict(int)                # (چت، کاربر) -> تعداد اخطار


def target_of(message: Message):
    """کاربرِ پیامی که ریپلای شده؛ وگرنه None."""
    reply = message.reply_to_message
    return reply.from_user if reply and reply.from_user else None


# ── خوش‌آمدگویی ────────────────────────────────────────────────────────────────
@router.message(F.new_chat_members)
async def welcome(message: Message):
    names = "، ".join(u.full_name for u in message.new_chat_members if not u.is_bot)
    if names:
        await message.answer(f"🌹 {names} عزیز، به گروه خوش آمدی!\nقوانین را در پیام پین‌شده بخوان.")


# ── دستورهای ادمین (فیلتر ارزان اول، IsChatAdmin آخر) ──────────────────────────
@router.message(Command("ban"), IsChatAdmin())
async def ban(message: Message, bot: Bot):
    user = target_of(message)
    if user is None:
        return await message.reply("روی پیام کاربر ریپلای کن.")
    await bot.ban_chat_member(message.chat.id, user.id)
    await message.reply(f"🔨 {user.full_name} بن شد.")


@router.message(Command("unban"), IsChatAdmin())
async def unban(message: Message, bot: Bot):
    user = target_of(message)
    if user is None:
        return await message.reply("روی پیام کاربر ریپلای کن.")
    await bot.unban_chat_member(message.chat.id, user.id, only_if_banned=True)
    await message.reply(f"🕊 {user.full_name} آزاد شد.")


@router.message(Command("pin"), IsChatAdmin())
async def pin(message: Message):
    if message.reply_to_message is None:
        return await message.reply("روی پیامی که می‌خواهی پین شود ریپلای کن.")
    await message.reply_to_message.pin()
    await message.reply("📌 پین شد.")


@router.message(Command("warn"), IsChatAdmin())
async def warn(message: Message, bot: Bot):
    user = target_of(message)
    if user is None:
        return await message.reply("روی پیام کاربر ریپلای کن.")
    key = (message.chat.id, user.id)
    warns[key] += 1
    if warns[key] >= MAX_WARNS:
        await bot.ban_chat_member(message.chat.id, user.id)
        warns.pop(key)
        await message.answer(f"⛔ {user.full_name} به‌خاطر {MAX_WARNS} اخطار بن شد.")
    else:
        await message.answer(f"⚠️ اخطار {warns[key]} از {MAX_WARNS} برای {user.full_name}")


# ── حذف خودکار لینک از اعضای عادی ──────────────────────────────────────────────
@router.message(F.text.regexp(r"(https?://|t\.me/|ble\.ir/|www\.)"), ~IsChatAdmin())
async def delete_links(message: Message):
    try:
        await message.delete()
    except BaleAPIError:
        return                                   # ربات حق حذف ندارد؛ نادیده بگیر
    await message.answer(f"🚫 {message.from_user.full_name}، ارسال لینک ممنوع است.")


dp = Dispatcher()
dp.include_router(router)

if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## توضیح بخش‌های مهم

::: steps
1. **فیلتر سطح Router**: `router.message.filter(ChatTypeFilter(...))` یعنی هیچ‌کدام از این هندلرها در چت خصوصی اجرا نمی‌شوند.
2. **ترتیب فیلترها**: `Command("ban")` ارزان است و اول می‌آید؛ `IsChatAdmin()` یک تماس API می‌زند و آخر.
3. **`~IsChatAdmin()`** در حذف لینک: فقط اعضای عادی؛ ادمین‌ها آزادند.
4. **`target_of`**: کاربر هدف از روی پیامِ ریپلای‌شده می‌آید، پس لازم نیست آیدی تایپ کنید.
:::

::: tip پرهیز از تماس‌های اضافه
`IsChatAdmin` برای هر پیام حاوی لینک یک `getChatMember` می‌زند. در گروه‌های شلوغ، نتیجه را چند دقیقه کش کنید (دیکشنری با زمان انقضا).
:::

## ایده‌های توسعه

- ذخیره‌ی اخطارها در دیتابیس.
- فیلتر کلمات ممنوعه.
- `/rules` که قوانین را از `get_chat(...).description` می‌خواند.
- لاگ اقدامات مدیریتی در یک کانال.

بعدی: [ربات فروشگاه](/cookbook/shop-bot).

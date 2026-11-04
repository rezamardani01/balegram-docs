---
title: عضویت اجباری
lead: استفاده از ربات را مشروط به عضویت در کانال یا گروه کنید، با دکمه‌ی «عضو شدم، بررسی کن».
---

## چه می‌سازیم؟

کاربر تا عضو کانال (یا کانال‌های) شما نشده، فقط پیام «اول عضو شو» می‌بیند. با زدن **«عضو شدم»** دوباره بررسی می‌شود.

::: warn پیش‌نیاز
ربات را در کانال/گروه **ادمین** کنید؛ وگرنه `getChatMember` برای کاربران جواب نمی‌دهد و `IsMember` همیشه نادرست خواهد بود.
:::

مفاهیم: فیلتر [`IsMember`](/reference/filters-ref)، [میدلور](/guide/middlewares)، [دکمه](/guide/keyboards).

## روش ۱: فیلتر IsMember (ساده)

```python title="members_only.py"
import asyncio

from baleropy import Bot, Dispatcher, F, Router
from baleropy.filters import CommandStart, IsMember
from baleropy.types import CallbackQuery, Message
from baleropy.utils import InlineKeyboardBuilder

TOKEN = "YOUR_BOT_TOKEN"
CHANNELS = ["@my_channel"]                      # یا شناسه‌ی عددی

gate = Router(name="gate")                      # ورودی: فقط اعضا
public = Router(name="public")                  # بقیه: «اول عضو شو»


def join_markup():
    kb = InlineKeyboardBuilder()
    kb.button(text="📢 عضویت در کانال", url="https://ble.ir/my_channel", style="primary")
    kb.button(text="✅ عضو شدم، بررسی کن", callback_data="check", style="success")
    return kb.adjust(1).as_markup()


# ── اعضا: ربات کار می‌کند ─────────────────────────────────────────────────────
@gate.message(CommandStart(), IsMember(*CHANNELS))
async def start_member(message: Message):
    await message.answer("🎉 خوش آمدی! عضویتت تایید شد.\nاز منو استفاده کن.")


@gate.message(F.text, IsMember(*CHANNELS))
async def main_feature(message: Message):
    await message.answer(f"شما گفتید: {message.text}")


# ── غیرعضو: دعوت به عضویت ────────────────────────────────────────────────────
@public.message()
async def ask_to_join(message: Message):
    await message.answer("برای استفاده از ربات ابتدا عضو کانال ما شوید 👇", reply_markup=join_markup())


@public.callback_query(F.data == "check", IsMember(*CHANNELS))
async def joined(query: CallbackQuery):
    await query.answer("عضویت تایید شد ✅")
    await query.message.edit_text("🎉 عالی! حالا می‌توانید از ربات استفاده کنید. /start")


@public.callback_query(F.data == "check")
async def not_joined(query: CallbackQuery):
    await query.answer("هنوز عضو نشده‌اید ❌", show_alert=True)


dp = Dispatcher()
dp.include_routers(gate, public)                # gate اول: اعضا پیش از «public» پردازش می‌شوند

if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

### چرا کار می‌کند؟

- `gate` اول ثبت شده: اگر `IsMember` درست باشد، هندلرش اجرا می‌شود.
- در غیر این صورت پیام به `public` می‌رسد و «اول عضو شو» نشان داده می‌شود.
- `IsMember(*CHANNELS)` باید فرستنده را در **همه‌ی** کانال‌های لیست عضو بداند.

## روش ۲: میدلور (همه‌ی هندلرها را یک‌جا قفل کن)

اگر نمی‌خواهید روی هر هندلر فیلتر بگذارید، یک میدلور inner بنویسید:

```python
from baleropy.dispatcher import BaseMiddleware
from baleropy.exceptions import BaleAPIError


class MembershipMiddleware(BaseMiddleware):
    def __init__(self, channels):
        self.channels = channels

    async def __call__(self, handler, event, data):
        user, bot = data.get("event_from_user"), data["bot"]
        if user is None:
            return await handler(event, data)

        for channel in self.channels:
            try:
                member = await bot.get_chat_member(channel, user.id)
            except BaleAPIError:
                continue                         # کانال/دسترسی مشکل دارد؛ قفل نکن
            if not member.is_joined:
                if hasattr(event, "answer") and not hasattr(event, "data"):
                    await event.answer("اول عضو کانال شوید 👇", reply_markup=join_markup())
                return None                      # هندلر اجرا نشود
        return await handler(event, data)


dp.message.middleware(MembershipMiddleware(CHANNELS))
```

::: tip کش کنید
هر پیام یک `getChatMember` می‌زند. برای ربات‌های شلوغ نتیجه‌ی «عضو است» را ۵ دقیقه در دیکشنری نگه دارید.
:::

## نکته‌ها

::: note عضویت چطور تشخیص داده می‌شود؟
`member.is_joined` برای وضعیت‌های `creator`، `administrator` و `member` درست است و برای `restricted` به `is_member` نگاه می‌کند؛ کاربر ترک‌کرده یا بن‌شده «عضو نیست».
:::

::: warn کانال خصوصی
برای کانال بدون username از شناسه‌ی عددی استفاده کنید و لینک دعوت را با `export_chat_invite_link` بسازید.
:::

بعدی: [استقرار روی سرور](/cookbook/deploy).

---
title: ربات نظرسنجی
lead: نظرسنجی زنده با دکمه‌های inline که شمارنده‌ی رأی‌ها فوری عوض می‌شود. هر نفر یک رأی دارد و می‌تواند نظرش را عوض کند.
---

## چه می‌سازیم؟

`/poll سؤال | گزینه ۱ | گزینه ۲ | گزینه ۳` یک نظرسنجی می‌سازد. با هر رأی، فقط **کیبورد** پیام ویرایش می‌شود (`edit_reply_markup`).

مفاهیم: [کیبورد](/guide/keyboards)، [CallbackData](/guide/callback-data)، [`edit_message_reply_markup`](/reference/methods-editing).

## کد کامل

```python title="poll_bot.py"
import asyncio
from collections import Counter
from dataclasses import dataclass, field

from balegram import Bot, Dispatcher
from balegram.filters import CallbackData, Command, CommandObject
from balegram.types import CallbackQuery, Message
from balegram.utils import InlineKeyboardBuilder

TOKEN = "YOUR_BOT_TOKEN"
dp = Dispatcher()


@dataclass
class Poll:
    title: str
    options: list[str]
    votes: dict[int, int] = field(default_factory=dict)      # شناسه‌ی کاربر -> شماره‌ی گزینه


POLLS: dict[tuple[int, int], Poll] = {}                      # (چت، پیام) -> نظرسنجی (در عمل: دیتابیس)


class VoteCb(CallbackData, prefix="vote"):
    option: int


def keyboard(poll: Poll):
    counts = Counter(poll.votes.values())
    total = len(poll.votes) or 1
    kb = InlineKeyboardBuilder()
    for i, option in enumerate(poll.options):
        percent = round(counts[i] * 100 / total)
        kb.button(text=f"{option} — {counts[i]} ({percent}٪)", callback_data=VoteCb(option=i), style="primary")
    kb.adjust(1)
    return kb.as_markup()


@dp.message(Command("poll"))
async def create(message: Message, command: CommandObject):
    parts = [p.strip() for p in (command.args or "").split("|") if p.strip()]
    if len(parts) < 3:
        await message.reply("نمونه:\n/poll بهترین فصل؟ | بهار | تابستان | پاییز")
        return
    poll = Poll(title=parts[0], options=parts[1:9])           # حداکثر ۸ گزینه
    sent = await message.answer(f"📊 {poll.title}", reply_markup=keyboard(poll))
    POLLS[(message.chat.id, sent.message_id)] = poll


@dp.callback_query(VoteCb.filter())
async def vote(query: CallbackQuery, callback_data: VoteCb):
    key = (query.message.chat.id, query.message.message_id)
    poll = POLLS.get(key)
    if poll is None:
        await query.answer("این نظرسنجی دیگر فعال نیست.", show_alert=True)
        return

    previous = poll.votes.get(query.from_user.id)
    if previous == callback_data.option:
        await query.answer("همین را قبلاً انتخاب کرده‌اید 🙂")
        return

    poll.votes[query.from_user.id] = callback_data.option
    await query.message.edit_reply_markup(keyboard(poll))     # فقط دکمه‌ها عوض می‌شوند
    await query.answer("رأی شما ثبت شد ✅" if previous is None else "رأی شما تغییر کرد 🔄")


if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## نکته‌ها

::: tip چرا فقط کیبورد؟
`edit_reply_markup` سبک‌تر از `edit_text` است و متن پیام (و عنوان نظرسنجی) دست نمی‌خورد. اگر خواستید خلاصه‌ی نتایج در متن هم باشد، `edit_text(new_text, reply_markup=...)` بگذارید.
:::

::: warn خطای «بدون تغییر»
اگر کیبورد جدید دقیقاً با قبلی یکی باشد بله `400 message is not modified` می‌دهد. اینجا با بررسی `previous == option` از آن جلوگیری کردیم. در حالت کلی با `try/except BaleBadRequest` بگیرید.
:::

::: danger حافظه‌ی موقت
`POLLS` در حافظه است و با خاموش‌شدن ربات پاک می‌شود. برای نظرسنجی‌های واقعی از SQLite یا Redis استفاده کنید.
:::

## ایده‌های توسعه

- رأی ناشناس یا نمایش اسم رأی‌دهندگان.
- دکمه‌ی «بستن نظرسنجی» فقط برای سازنده (`F.from_user.id == poll.creator`).
- مهلت زمانی با `asyncio.sleep` و بستن خودکار.
- نمایش نتیجه با نوار: `"█" * count`.

بعدی: [مدیریت گروه](/cookbook/admin-bot).

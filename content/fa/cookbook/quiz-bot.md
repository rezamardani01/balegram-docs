---
title: ربات مسابقه
lead: یک مسابقه‌ی چندسؤالی با دکمه‌های رنگی، امتیازدهی و FSM؛ کامل و آماده‌ی اجرا.
---

## چه می‌سازیم؟

- `/quiz` مسابقه را شروع می‌کند و هر سؤال را با ۳ دکمه نشان می‌دهد.
- جواب درست با دکمه‌ی 🟢 و غلط با 🔴 نشان داده می‌شود.
- در پایان امتیاز نهایی و دکمه‌ی «دوباره».

مفاهیم به‌کار رفته: [FSM](/guide/fsm)، [CallbackData](/guide/callback-data)، [دکمه رنگی](/guide/keyboards)، [ویرایش پیام](/reference/methods-editing).

## کد کامل

```python title="quiz_bot.py"
import asyncio

from balegram import Bot, Dispatcher, F
from balegram.filters import CallbackData, Command, StateFilter
from balegram.fsm import FSMContext, State, StatesGroup
from balegram.types import CallbackQuery, Message
from balegram.utils import InlineKeyboardBuilder

TOKEN = "YOUR_BOT_TOKEN"

# (سؤال، گزینه‌ها، شماره‌ی گزینه‌ی درست از صفر)
QUESTIONS = [
    ("پایتخت ایران کدام شهر است؟", ["تهران", "شیراز", "تبریز"], 0),
    ("بزرگ‌ترین سیاره‌ی منظومه‌ی شمسی؟", ["زمین", "مشتری", "مریخ"], 1),
    ("حاصل ۷ × ۸ چند می‌شود؟", ["۵۴", "۵۶", "۶۴"], 1),
    ("لوگوی مار مربوط به کدام زبان برنامه‌نویسی است؟", ["جاوا", "پایتون", "گو"], 1),
    ("در یک دقیقه چند ثانیه است؟", ["۳۰", "۱۰۰", "۶۰"], 2),
]

dp = Dispatcher()


class QuizState(StatesGroup):
    active = State()


class AnswerCb(CallbackData, prefix="ans"):
    q: int          # شماره‌ی سؤال
    a: int          # شماره‌ی گزینه‌ی انتخاب‌شده


def question_view(index: int):
    text, options, _ = QUESTIONS[index]
    kb = InlineKeyboardBuilder()
    for i, option in enumerate(options):
        kb.button(text=option, callback_data=AnswerCb(q=index, a=i), style="primary")
    kb.adjust(1)
    return f"❓ سؤال {index + 1} از {len(QUESTIONS)}\n\n{text}", kb.as_markup()


@dp.message(Command("start", "quiz"))
async def start_quiz(message: Message, state: FSMContext):
    await state.set_state(QuizState.active)
    await state.update_data(index=0, score=0)
    text, markup = question_view(0)
    await message.answer(text, reply_markup=markup)


@dp.callback_query(AnswerCb.filter(), StateFilter(QuizState.active))
async def answer(query: CallbackQuery, callback_data: AnswerCb, state: FSMContext):
    data = await state.get_data()
    if callback_data.q != data["index"]:                     # دکمه‌ی یک سؤال قدیمی
        await query.answer("این سؤال تمام شده!", show_alert=True)
        return

    _, options, correct = QUESTIONS[callback_data.q]
    is_right = callback_data.a == correct
    score = data["score"] + int(is_right)
    verdict = "✅ درست!" if is_right else f"❌ غلط! جواب: {options[correct]}"
    next_index = callback_data.q + 1

    if next_index >= len(QUESTIONS):                         # پایان
        await state.clear()
        again = InlineKeyboardBuilder().button(text="🔁 دوباره", callback_data="again", style="success")
        await query.message.edit_text(
            f"{verdict}\n\n🏁 تمام شد! امتیاز شما: {score} از {len(QUESTIONS)}",
            reply_markup=again.as_markup(),
        )
    else:
        await state.update_data(index=next_index, score=score)
        text, markup = question_view(next_index)
        await query.message.edit_text(f"{verdict}\n\n{text}", reply_markup=markup)
    await query.answer()


@dp.callback_query(F.data == "again")
async def again(query: CallbackQuery, state: FSMContext):
    await state.set_state(QuizState.active)
    await state.update_data(index=0, score=0)
    text, markup = question_view(0)
    await query.message.edit_text(text, reply_markup=markup)
    await query.answer()


if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## چطور کار می‌کند؟

::: steps
1. `/quiz` حالت `QuizState.active` را می‌گذارد و `index` و `score` را در داده‌ی FSM ذخیره می‌کند.
2. هر دکمه یک `AnswerCb(q, a)` است؛ شماره‌ی سؤال داخل دکمه می‌آید.
3. هندلر پاسخ فقط وقتی اجرا می‌شود که **در حالت active** باشیم (`StateFilter`).
4. اگر `callback_data.q` با `index` فعلی نخواند، یعنی کاربر دکمه‌ی یک پیام قدیمی را زده؛ هشدار می‌دهیم.
5. با `edit_text` همان پیام تبدیل به سؤال بعدی می‌شود؛ چت شلوغ نمی‌شود.
:::

## ایده‌های توسعه

- سؤال‌ها را از فایل JSON بخوانید و **به‌صورت تصادفی** مرتب کنید (`random.shuffle`).
- بهترین امتیاز هر کاربر را در دیتابیس نگه دارید و `/top` بسازید.
- زمان‌سنج: با `asyncio.create_task` بعد از ۳۰ ثانیه سؤال را رد کنید.
- جایزه: به برندگان با [Business API](/guide/business) پیام بدهید.

بعدی: [ربات نظرسنجی](/cookbook/poll-bot).

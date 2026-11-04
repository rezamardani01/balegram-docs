---
title: Quiz bot
lead: A multi-question quiz with colored buttons, scoring and an FSM; complete and ready to run.
---

## What are we building?

- `/quiz` starts the quiz and shows each question with 3 buttons.
- The correct answer is marked ✅ and a wrong one ❌.
- At the end: the final score and a "again" button.

Concepts used: [FSM](/guide/fsm), [CallbackData](/guide/callback-data), [colored buttons](/guide/keyboards), [editing messages](/reference/methods-editing).

## The full code

```python title="quiz_bot.py"
import asyncio

from baleropy import Bot, Button, Dispatcher, F
from baleropy.filters import CallbackData, Command, StateFilter
from baleropy.fsm import FSMContext, State, StatesGroup
from baleropy.types import CallbackQuery, Message

TOKEN = "YOUR_BOT_TOKEN"

# (question, options, index of the correct option from zero)
QUESTIONS = [
    ("What is the capital of Iran?", ["Tehran", "Shiraz", "Tabriz"], 0),
    ("The largest planet of the solar system?", ["Earth", "Jupiter", "Mars"], 1),
    ("What is 7 × 8?", ["54", "56", "64"], 1),
    ("Which language has a snake logo?", ["Java", "Python", "Go"], 1),
    ("How many seconds are in a minute?", ["30", "100", "60"], 2),
]

dp = Dispatcher()


class QuizState(StatesGroup):
    active = State()


class AnswerCb(CallbackData, prefix="ans"):
    q: int          # question number
    a: int          # chosen option number


def question_view(index: int):
    text, options, _ = QUESTIONS[index]
    buttons = [
        [Button.inline(option, AnswerCb(q=index, a=i), style="primary")]
        for i, option in enumerate(options)
    ]
    return f"❓ Question {index + 1} of {len(QUESTIONS)}\n\n{text}", buttons


@dp.message(Command("start", "quiz"))
async def start_quiz(message: Message, state: FSMContext):
    await state.set_state(QuizState.active)
    await state.update_data(index=0, score=0)
    text, buttons = question_view(0)
    await message.answer(text, buttons=buttons)


@dp.callback_query(AnswerCb.filter(), StateFilter(QuizState.active))
async def answer(query: CallbackQuery, callback_data: AnswerCb, state: FSMContext):
    data = await state.get_data()
    if callback_data.q != data["index"]:                     # a button of an old question
        await query.answer("This question is over!", show_alert=True)
        return

    _, options, correct = QUESTIONS[callback_data.q]
    is_right = callback_data.a == correct
    score = data["score"] + int(is_right)
    verdict = "✅ Correct!" if is_right else f"❌ Wrong! Answer: {options[correct]}"
    next_index = callback_data.q + 1

    if next_index >= len(QUESTIONS):                         # the end
        await state.clear()
        buttons = [[Button.inline("🔁 Again", "again", style="success")]]
        await query.message.edit_text(
            f"{verdict}\n\n🏁 Finished! Your score: {score} of {len(QUESTIONS)}",
            buttons=buttons,
        )
    else:
        await state.update_data(index=next_index, score=score)
        text, buttons = question_view(next_index)
        await query.message.edit_text(f"{verdict}\n\n{text}", buttons=buttons)
    await query.answer()


@dp.callback_query(F.data == "again")
async def again(query: CallbackQuery, state: FSMContext):
    await state.set_state(QuizState.active)
    await state.update_data(index=0, score=0)
    text, buttons = question_view(0)
    await query.message.edit_text(text, buttons=buttons)
    await query.answer()


if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## How does it work?

::: steps
1. `/quiz` sets the state `QuizState.active` and stores `index` and `score` in the FSM data.
2. Each button is an `AnswerCb(q, a)`; the question number travels inside the button.
3. The answer handler runs only when **in the active state** (`StateFilter`).
4. If `callback_data.q` does not match the current `index`, the user pressed a button of an old message; we warn them.
5. `edit_text` turns the same message into the next question; the chat stays tidy.
:::

## Ideas to extend it

- Read the questions from a JSON file and **shuffle** them (`random.shuffle`).
- Keep each user's best score in a database and build `/top`.
- A timer: with `asyncio.create_task`, skip the question after 30 seconds.
- Prizes: message winners with the [Business API](/guide/business).

Next: [Poll bot](/cookbook/poll-bot).

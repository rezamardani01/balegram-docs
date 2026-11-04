---
title: State machine (FSM)
lead: For multi-step conversations (sign-up, orders, quizzes) the bot must remember where the user is. That is exactly what the FSM does.
---

## What is the problem?

When the bot asks "What's your name?" and the user writes "Reza", how does the bot know this "Reza" is the answer and not an ordinary message? The answer: a **State**. The bot stores a state for each user and picks handlers based on it.

## Step 1: define the states

```python title="states.py"
from baleropy.fsm import State, StatesGroup


class Form(StatesGroup):
    name = State()
    age = State()
    city = State()
```

The full name of each state is `Form:name`, `Form:age`, and so on.

## Step 2: the handlers

```python title="handlers.py"
from baleropy import F, Router
from baleropy.filters import Command
from baleropy.fsm import FSMContext
from baleropy.types import Message

router = Router()


@router.message(Command("form"))
async def begin(message: Message, state: FSMContext):
    await state.set_state(Form.name)                  # enter the first step
    await message.answer("What's your name?")


@router.message(Form.name, F.text)                    # only while in state `name`
async def got_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text)        # save the answer
    await state.set_state(Form.age)
    await message.answer("How old are you?")


@router.message(Form.age, F.text.regexp(r"^\d{1,3}$"))
async def got_age(message: Message, state: FSMContext):
    await state.update_data(age=int(message.text))
    await state.set_state(Form.city)
    await message.answer("Which city do you live in?")


@router.message(Form.age)                             # invalid age
async def bad_age(message: Message):
    await message.answer("Please send only a number 🙏")


@router.message(Form.city, F.text)
async def got_city(message: Message, state: FSMContext):
    data = await state.update_data(city=message.text)  # returns the full dict
    await state.clear()                                # done: state and data are removed
    await message.answer(
        f"✅ Saved:\nName: {data['name']}\nAge: {data['age']}\nCity: {data['city']}"
    )
```

A `State` is used directly as a filter: `@router.message(Form.name)`.

## FSMContext: the `state` object

| Method | What it does |
|---|---|
| `await state.set_state(Form.age)` | change the state (`None` = no state) |
| `await state.get_state()` | the current state string or `None` |
| `await state.update_data(a=1, b=2)` | merge into the data and return the full data |
| `await state.set_data({...})` | replace all data |
| `await state.get_data()` | the data dict |
| `await state.get_value("name", default)` | a single value |
| `await state.clear()` | remove state and data |

## State filters

```python
from baleropy.filters import StateFilter
from baleropy.fsm import default_state, any_state

@router.message(Form.name)                      # one state
@router.message(StateFilter(Form.name, Form.age))   # one of several
@router.message(StateFilter(Form))              # any state of the Form group
@router.message(default_state)                  # no state (normal mode)
@router.message(any_state)                      # any state, even none
```

## Cancel at any step

```python
from baleropy.filters import Command

@router.message(Command("cancel"))              # no state filter: works everywhere
async def cancel(message: Message, state: FSMContext):
    if await state.get_state() is None:
        return await message.answer("Nothing to cancel.")
    await state.clear()
    await message.answer("Cancelled ❌")
```

::: warn Mind the registration order
Register `/cancel` **before** handlers that accept "any message" in some state; otherwise they swallow the command as an answer (or add a `~F.text.startswith("/")` filter).
:::

## Nested states

```python
class Order(StatesGroup):
    class Payment(StatesGroup):
        card = State()
        confirm = State()

    items = State()
    address = State()

# Order.Payment.card.state == "Order.Payment:card"
# StateFilter(Order) matches every state including the nested ones
```

## Storage strategy: state for whom?

```python
from baleropy import Dispatcher
from baleropy.fsm import FSMStrategy

dp = Dispatcher(fsm_strategy=FSMStrategy.USER_IN_CHAT)   # the default
```

| Strategy | Storage key | Good for |
|---|---|---|
| `USER_IN_CHAT` | (chat, user) | each user has a separate state in each group; the standard |
| `CHAT` | (chat) | one shared state for the whole group (group games) |
| `GLOBAL_USER` | (user) | the user's state is the same in all chats |

## Storages

| Storage | Traits |
|---|---|
| `MemoryStorage()` | default; fast; cleared when the bot stops |
| `RedisStorage` | persistent; for production; data must be JSON-serializable |

```python
from baleropy.fsm import MemoryStorage, RedisStorage

dp = Dispatcher(storage=MemoryStorage())

# Redis (pip install baleropy[redis])
storage = RedisStorage.from_url("redis://localhost:6379/0", state_ttl=3600, data_ttl=3600)
dp = Dispatcher(storage=storage)
```

`state_ttl` and `data_ttl` set the lifetime of keys (seconds) so abandoned forms disappear by themselves.

### A custom storage

Inherit `BaseStorage` and implement five coroutines: `set_state`, `get_state`, `set_data`, `get_data`, `close`.

## Full example: guess the number

```python
import random
from baleropy import F, Router
from baleropy.filters import Command
from baleropy.fsm import FSMContext, State, StatesGroup
from baleropy.types import Message

router = Router()


class Guess(StatesGroup):
    playing = State()


@router.message(Command("guess"))
async def start_game(message: Message, state: FSMContext):
    await state.set_state(Guess.playing)
    await state.update_data(target=random.randint(1, 100), tries=0)
    await message.answer("🔢 Guess a number between 1 and 100!")


@router.message(Guess.playing, F.text.regexp(r"^\d{1,3}$"))
async def attempt(message: Message, state: FSMContext):
    data = await state.get_data()
    number, tries = int(message.text), data["tries"] + 1
    if number == data["target"]:
        await state.clear()
        return await message.reply(f"🎉 Correct! You found it in {tries} guesses.")
    await state.update_data(tries=tries)
    await message.reply("⬆️ higher" if number < data["target"] else "⬇️ lower")
```

## Summary

- `StatesGroup` + `State` define states.
- `state.set_state` / `update_data` / `clear`.
- A `State` is itself a filter; handler registration order matters.
- Next: [Keyboards & colored buttons](/guide/keyboards).

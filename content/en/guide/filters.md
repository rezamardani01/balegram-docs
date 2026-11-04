---
title: Filters
lead: A filter is the condition for running a handler. Built-in filters, combining them with operators, and filters that hand data to the handler.
---

## What is a filter?

You can give a handler one or more filters. The handler runs only when **all filters pass** (AND). Each filter returns one of:

| Filter result | Meaning |
|---|---|
| `False` | reject; try the next handler |
| `True` | accept |
| `dict` | accept **and** pass the dict's values to the handler as arguments |

```python
from balegram import F
from balegram.filters import Command, ChatTypeFilter

@dp.message(Command("start"), ChatTypeFilter("private"))   # both must pass
async def start_in_private(message): ...
```

## Built-in filters

| Filter | What it does |
|---|---|
| [`Command`](/reference/filters-ref) | Commands like `/start arg` + arguments |
| `CommandStart` | `/start` with deep-link support |
| [`F`](/guide/magic-filter) | The magic filter for any condition on a message |
| `StateFilter` | The current FSM state |
| `CallbackData.filter()` | Typed buttons |
| `ChatTypeFilter` | Chat type: private / group / channel |
| `IsChatAdmin` | Is the sender an admin of the chat? |
| `IsMember` | Has the sender joined the given channels/groups? |
| `MagicData` | Magic filter over the middleware *data* |
| `ExceptionTypeFilter` / `ExceptionMessageFilter` | For error handlers |

## Combining with & , | and ~

```python
from balegram.filters import Command, ChatTypeFilter, IsChatAdmin

# AND with & (same as giving two separate filters)
@dp.message(Command("ban") & IsChatAdmin())

# OR with |
@dp.message(F.photo | F.video | F.document)

# NOT with ~
@dp.message(~Command("start"), F.text)      # any text except /start
```

::: note "Several arguments" vs "&"
`@dp.message(A, B)` and `@dp.message(A & B)` are equivalent. But `|` and `~` are only possible with operators.
:::

## Filters that provide data

When a filter returns a `dict`, its keys reach the handler as arguments. `Command` does exactly that:

```python
from balegram.filters import Command, CommandObject

@dp.message(Command("repeat"))
async def repeat(message: Message, command: CommandObject):
    # /repeat hello world
    await message.answer(command.args or "Give me some text!")
```

`CommandObject` has these fields:

| Field | Example for `/repeat@mybot a b` |
|---|---|
| `command.command` | `repeat` |
| `command.args` | `a b` |
| `command.args_list` | `['a', 'b']` |
| `command.mention` | `mybot` |
| `command.prefix` | `/` |

## Command in detail

```python
Command("start")                       # /start
Command("help", "menu")                # one of several commands
Command("go", prefix="!")              # !go
Command("START", ignore_case=True)     # case-insensitive
Command(re.compile(r"item\d+"))        # pattern: /item12
Command("x", magic=F.args)             # only with arguments: /x 5
```

::: tip @mention
In groups a user may type `/start@mybot`. By default `Command` checks that the mention is really **this** bot's name (one `getMe` call, cached). `ignore_mention=True` turns the check off.
:::

## Deep links with CommandStart

When the link `https://ble.ir/<bot>?start=ref42` is opened, the bot receives `/start ref42`:

```python
from balegram.filters import CommandStart, CommandObject

@dp.message(CommandStart(deep_link=True))          # only with a parameter
async def with_ref(message: Message, command: CommandObject):
    await message.answer(f"Invite code: {command.args}")

@dp.message(CommandStart())                        # plain /start
async def plain(message: Message):
    await message.answer("Welcome!")
```

For complex parameters set `encoded=True` so the value is base64-decoded (and build the link with `create_start_link(bot, "x", encode=True)`). Details in [Helper utilities](/guide/utils).

## Chat type and admin filters

```python
from balegram.filters import ChatTypeFilter, IsChatAdmin, IsMember

@dp.message(Command("panel"), ChatTypeFilter("private"))
async def panel(message: Message): ...

@dp.message(Command("ban"), IsChatAdmin())          # one API call
async def ban(message: Message): ...

@dp.message(IsMember("@my_channel"))                # mandatory membership
async def members_only(message: Message): ...
```

::: warn Filter order matters
Filters are checked in order and the first `False` ends it. Put cheap filters (`Command`) **first** and API-calling filters (`IsChatAdmin`) **last** so no request is made for every message needlessly.
:::

## Play with filters

::: widget playground
:::

## Summary

- All filters pass ⇒ the handler runs.
- Combine with `&` `|` `~`.
- A filter can return a `dict` and inject arguments.
- Next: [The magic F filter](/guide/magic-filter).

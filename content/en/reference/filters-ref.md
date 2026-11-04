---
title: Filters reference
lead: Every built-in filter with its signature, parameters, the data it gives the handler and an example.
---

All are imported from `baleropy.filters`. Conceptual teaching is in the lessons [Filters](/guide/filters), [F](/guide/magic-filter) and [Custom filters](/guide/custom-filters).

## Filter (base class)

```python
class Filter:
    async def __call__(self, event, **data) -> bool | dict: ...
```

Inherit it to get `&`, `|` and `~` automatically. Result: `False` reject, `True` accept, `dict` accept + inject.

## Command

```python
Command(*commands, prefix="/", ignore_case=False, ignore_mention=False, magic=None)
```

| Parameter | Meaning |
|---|---|
| `*commands` | one or more names (string or `re.Pattern`) without the prefix |
| `prefix` | the command prefix; default `/` |
| `ignore_case` | ignore letter case |
| `ignore_mention` | skip the `@bot_name` check |
| `magic` | an `F` filter over the `CommandObject` (e.g. `F.args`) |

**Injects:** `command: CommandObject` with `prefix`, `command`, `mention`, `args`, `args_list`, `text`.

```python
@dp.message(Command("add", "plus"))
async def add(message: Message, command: CommandObject):
    a, b = map(int, command.args_list)
    await message.answer(str(a + b))
```

## CommandStart

```python
CommandStart(*, deep_link=False, encoded=False, **Command_kwargs)
```

| Parameter | Meaning |
|---|---|
| `deep_link=True` | only `/start` with a parameter |
| `encoded=True` | decode the parameter from URL-safe base64 |

## F / MagicFilter

```python
F.text == "hello"     F.from_user.id.in_({1, 2})     F.text.regexp(r"\d+")
```

Operators: `== != < <= > >=`, `in_`, `not_in`, `contains`, `startswith`, `endswith`, `lower`, `len`, `is_`, `is_not`, `regexp`, `func`, `as_`, and combining with `& | ~`. The full list with examples is in [The magic filter](/guide/magic-filter).

**Injects:** `magic_result` (when the result is not `True`, like a Match).

## MagicData

```python
MagicData(F.<field on data>)
```

A magic condition over the middleware **data** (and `event`):

```python
@dp.message(MagicData(F.is_admin))
@dp.message(MagicData(F.event_from_user.id == F.config.owner_id))
```

## StateFilter

```python
StateFilter(*states)     # State | string | StatesGroup | None | "*"
```

| Input | Meaning |
|---|---|
| `Form.name` | that state |
| `Form` | any state of the group |
| `None` | no state |
| `"*"` / `any_state` | any state |

A `State` is itself a filter: `@router.message(Form.name)`.

## CallbackData.filter

```python
class Cb(CallbackData, prefix="x"): ...
Cb.filter()                 # all
Cb.filter(F.action == "a")  # with a condition
```

**Injects:** `callback_data` (a `Cb` object). A failed unpack = reject, no error. ([CallbackData](/guide/callback-data))

## ChatTypeFilter

```python
ChatTypeFilter("private")
ChatTypeFilter("group", "supergroup", "channel")
```

Works on `Message` and `CallbackQuery` (with a message).

## IsChatAdmin

```python
IsChatAdmin()
```

Is the sender an owner or administrator? One `getChatMember` call (groups/channels only). ⚠️ Put it **last** among filters.

## IsMember

```python
IsMember(*chat_ids)
```

Has the sender joined **all** the given chats? (The bot must be an admin of them.) Good for mandatory membership ([Cookbook](/cookbook/mandatory-membership)).

## ExceptionTypeFilter / ExceptionMessageFilter

For `@router.error()`:

```python
ExceptionTypeFilter(BaleForbidden, BaleBadRequest)
ExceptionMessageFilter(r"not modified")       # injects: match_exception
```

## Summary table

| Filter | Injects | API call? |
|---|---|---|
| `Command` | `command` | — |
| `CommandStart` | `command` | — |
| `F...` | `magic_result` | — |
| `MagicData` | — | — |
| `StateFilter` / `State` | — | — |
| `CallbackData.filter()` | `callback_data` | — |
| `ChatTypeFilter` | — | — |
| `IsChatAdmin` | — | ✅ |
| `IsMember` | — | ✅ |
| `ExceptionMessageFilter` | `match_exception` | — |

Next: [Middlewares reference](/reference/middlewares-ref).

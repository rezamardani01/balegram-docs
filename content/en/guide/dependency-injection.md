---
title: Dependency injection
lead: Handlers, filters and middlewares receive only the arguments they declare; balegram supplies the rest automatically.
---

## The core rule

balegram injects arguments **by name** (not by type). Any name you write in your function that exists in the "current data" is filled in:

```python
@dp.message(Command("me"))
async def me(message: Message, bot: Bot, event_from_user, state: FSMContext):
    #            ↑ the event   ↑ by name "bot"  ↑ by name   ↑ by name "state"
    ...
```

::: note Type hints are only for readability
`bot: Bot` is filled because of the name `bot`, not because of the type `Bot`. If you write `b: Bot` it gets nothing.
:::

## Which names exist?

| Name | Value | When? |
|---|---|---|
| `bot` | The `Bot` that received this update | always |
| `dispatcher` | The root `Dispatcher` | always |
| `event_update` | The whole raw `Update` | always |
| `event_router` | The current `Router` | always |
| `event_from_user` | The sender `User` | when it comes from a user |
| `event_chat` | The `Chat` | when there is a chat |
| `state` | This user's `FSMContext` | when there is a user/chat |
| `raw_state` | The current state string or `None` | together with `state` |
| `fsm_storage` | The FSM storage object | always |
| `handler` | The chosen handler object (for `get_flag`) | inner middlewares only |
| `command` | `CommandObject` | with the `Command` filter |
| `callback_data` | A `CallbackData` object | with `Class.filter()` |
| `magic_result` | The regex/magic result | with `F...regexp` |
| `exception` | The exception itself | in an `error` handler |
| *your data* | Anything you put in `Dispatcher(...)` or a middleware | depends |

## Injecting your own data

### 1) From the Dispatcher

```python
dp = Dispatcher(db=my_database, config=my_config, admin_ids={1, 2})

@dp.message(Command("stats"))
async def stats(message: Message, db, admin_ids):
    if message.from_user.id in admin_ids:
        await message.answer(str(await db.count_users()))
```

Also after creation: `dp["db"] = my_database`.

### 2) From start_polling

```python
await dp.start_polling(bot, version="1.0")      # extra arguments = data

@dp.message(Command("version"))
async def v(message: Message, version: str):
    await message.answer(version)
```

### 3) From a middleware

```python
class UserMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data):
        data["user"] = await load_user(data["event_from_user"].id)
        return await handler(event, data)
```

### 4) From a filter

A filter adds data by returning a `dict` (like `command`). See [Custom filters](/guide/custom-filters).

## The first argument and the name `event`

- The function's first argument receives the **event** (whatever its name: `message`, `m`, `query`).
- If the first argument's name is itself one of the data names (like `bot`), the event is **not** given to it.
- An argument named `event` **always** receives the event (even if it is not first).

```python
@dp.message()
async def a(message): ...                  # event = message
@dp.message()
async def b(bot, message): ...             # bot from data; message ??? ← it won't arrive!
@dp.message()
async def c(bot, event): ...               # right: event is always the event
@dp.message()
async def d(message, bot): ...             # right
```

::: warn The argument-order trap
In example `b`, because the first argument is named `bot`, the event does not reach it, and `message` is not a name in the data; the result is a "missing argument" error. Always write the **event first**.
:::

## Default values and **kwargs

```python
@dp.message()
async def h(message: Message, db=None): ...    # None if there is no db

@dp.message()
async def all_data(message: Message, **data):  # take all the data
    print(sorted(data))
```

## Where does it work?

Injection follows this rule in **handlers**, **filters**, **Router-level filters**, **on_startup/on_shutdown callbacks** and **error handlers**.

```python
@dp.on_startup
async def started(bot: Bot, db):                 # the same data
    await db.connect()
```

## Full example: a user layer

```python
class UserMiddleware(BaseMiddleware):
    def __init__(self, repo):
        self.repo = repo

    async def __call__(self, handler, event, data):
        tg_user = data.get("event_from_user")
        if tg_user:
            data["user"] = await self.repo.get_or_create(tg_user.id, tg_user.full_name)
        return await handler(event, data)


dp = Dispatcher(repo=UserRepository())
dp.message.outer_middleware(UserMiddleware(dp["repo"]))


@dp.message(Command("profile"))
async def profile(message: Message, user):
    await message.answer(f"👤 {user.name}\n⭐ Points: {user.points}")
```

## Summary

- Injection is by **name**, not type.
- Sources: Dispatcher, start_polling, middleware, filter.
- Write the event as the first argument or use the name `event`.
- Next: [State machine (FSM)](/guide/fsm).

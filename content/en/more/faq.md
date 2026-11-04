---
title: FAQ & troubleshooting
lead: Common problems and their fixes; plus a migration guide from aiogram.
---

## The bot does not answer

::: steps
1. Is the program still running? Look at the terminal.
2. Is the token right? (`401 Unauthorized` means no.)
3. Did you send `/start` to the bot first?
4. Does your handler really match? [Handler order](/start/install) matters; a generic handler before the others swallows everything.
5. Turn on logging: `logging.basicConfig(level=logging.INFO)`.
:::

## Why does my handler not run?

- **Registration order**: the first matching handler wins. Put the generic handler (`F.text`) last.
- **Router not attached**: after creating a `Router` you must call `dp.include_router(router)`.
- **A wrong filter**: with `F.text == "..."` the text must be *exactly* equal; use `.lower()` or `.contains()`.
- **You are in an FSM state**: if the handler wants `default_state` but the user is in a state, it does not run (send `/cancel`).
- **An error in a filter**: an error inside a filter stops the whole event; check the log.

## The `403 permission_denied` error

The bot may not write: the user blocked it, never pressed `/start`, or the bot is restricted in the group. Catch `except BaleForbidden` and set that user aside. ([Errors](/guide/errors))

## The `429 Too Many Requests` error

You hit the rate limit. balegram waits automatically; if you see it a lot:
- set `skip_updates=True` (skip the old queue).
- add `ThrottlingMiddleware`.
- do bulk sending with the [Business API](/guide/business).

## The `400 chat id is empty` error

It happened on `sendChatAction` with old library versions (Bale rejected a numeric `chat_id`). Update the library:

```bash
pip install --upgrade --force-reinstall --no-deps git+https://github.com/rezamardani01/balegram.git
```

## The `400 message is not modified` error

The new text and keyboard equal the old ones. Check something changed before editing, or catch it:

```python
from balegram.exceptions import BaleBadRequest
try:
    await message.edit_text(text, reply_markup=kb)
except BaleBadRequest:
    pass
```

## The `unsupported peer type` error

You called a group-only method (`getChatMember`, `getChatAdministrators`, `getChatMembersCount`) on a private chat. Check the chat type first.

## `RuntimeError: ... is not bound to a Bot instance`

A `Message` was built without a Bot (usually in a test). Use `Update.model_validate(raw, context={"bot": bot})`. ([Testing](/guide/testing))

## `TypeError: MagicFilter cannot be used as a boolean`

You used `and`/`or`/`not` on `F`. Use `&` `|` `~` with parentheses instead. ([F](/guide/magic-filter))

## The button stays "loading" forever

You did not answer the `callback_query`. Add `await query.answer()` or enable `CallbackAnswerMiddleware`.

## I see a traceback on Ctrl+C

That is normal `asyncio.run` behavior. Use `dp.run_polling(bot)` or wrap `asyncio.run` in `try/except KeyboardInterrupt`. ([Running](/guide/running))

## The webhook gets no updates

- Is the address **HTTPS** with port **443 or 88**?
- Did `set_webhook` succeed? (check `get_webhook_info()`)
- Is the certificate valid (not self-signed)?
- Is the path in `register(app, PATH)` exactly the one you gave `set_webhook`?

## Where do I get my numeric id?

```python
@dp.message(Command("myid"))
async def myid(message: Message):
    await message.answer(str(message.from_user.id))
```

## How do I post to a channel?

Make the bot an admin of the channel and give `chat_id` as `@channel_username` or the (negative) numeric id: `await bot.send_message("@my_channel", "Hello")`.

## How do I run several bots together?

`await dp.start_polling(bot1, bot2)`; in a handler the `bot` argument tells you which bot got the message. ([Running](/guide/running))

---

## Migrating from aiogram

If you know aiogram, almost everything is familiar:

| aiogram | balegram |
|---|---|
| `Dispatcher()`, `Router()` | the same |
| `@router.message(F.text)` | the same |
| `Command("start")`, `CommandStart()` | the same |
| `FSMContext`, `StatesGroup`, `State` | the same; from `balegram.fsm` |
| `CallbackData` with `prefix` | the same; from `balegram.filters` |
| `InlineKeyboardBuilder` | the same; from `balegram.utils`; colored with `style=` |
| `BaseMiddleware` | the same; `dp.update/message.outer_middleware` |
| `await bot.send_message(...)` | the same |
| `Bot(token, default=DefaultBotProperties(parse_mode=...))` | `Bot(token)`; Bale has no `parse_mode` |
| `dp.start_polling(bot)` | the same + `skip_updates`, `run_polling` |
| `message.answer(...)` | the same |
| `allowed_updates` | does not exist |
| webhook with `secret_token` | does not exist; `secret_path()` |
| `aiogram.utils.keyboard`, `deep_linking` | `balegram.utils` (`create_start_link` ...) |

**Key differences:** the module names (`balegram.*`), no `parse_mode`, no built-in Scenes or i18n, and Bale-specific features (colored buttons, Business API, `IsMember`).

## Still stuck?

Open an [issue on GitHub](https://github.com/rezamardani01/balegram/issues) and include: the Python and balegram versions, a short code sample and the **full error text**. Never include your token.

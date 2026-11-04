---
title: Errors & rate limits
lead: Which errors can happen, how to catch them, and how baleropy handles rate limiting (429) for you.
---

## The exception hierarchy

All baleropy errors inherit `BaleropyError`:

```text
BaleropyError
├── DetailedError
│   ├── BaleAPIError            ← Bale answered "ok: false"
│   │   ├── BaleBadRequest      (400)
│   │   ├── BaleUnauthorized    (401: wrong token)
│   │   ├── BaleForbidden       (403: no permission)
│   │   ├── BaleNotFound        (404)
│   │   ├── BaleRetryAfter      (429: too fast!)
│   │   └── BaleServerError     (5xx)
│   ├── BaleNetworkError        ← network drop / timeout
│   └── ClientDecodeError       ← Bale's reply could not be understood
├── SkipHandler                 ← you raise it
└── CancelHandler               ← in a middleware
```

`BaleAPIError` has these fields: `method` (the method name), `message`, `error_code`, `parameters`.

## Catching errors in the handler

```python
from baleropy.exceptions import BaleForbidden, BaleBadRequest, BaleAPIError

@dp.message(Command("hi"))
async def hi(message: Message):
    try:
        await bot.send_message(OTHER_USER_ID, "Hello!")
    except BaleForbidden:
        await message.answer("That user blocked the bot or never pressed /start 🤷")
    except BaleBadRequest as e:
        await message.answer(f"Invalid request: {e.message}")
    except BaleAPIError as e:
        await message.answer(f"Bale returned an error [{e.error_code}]: {e.message}")
```

## A global error handler

Any unhandled error of a handler reaches the `error` observer:

```python
from baleropy.dispatcher import ErrorEvent
from baleropy.filters import ExceptionTypeFilter, ExceptionMessageFilter
from baleropy.exceptions import BaleForbidden, BaleAPIError


@dp.error(ExceptionTypeFilter(BaleForbidden))
async def forbidden(event: ErrorEvent):
    print("No permission, ignoring")
    return True


@dp.error(ExceptionMessageFilter(r"message is not modified"))
async def not_modified(event: ErrorEvent):
    return True                            # harmless


@dp.error()                                # all other errors
async def other(event: ErrorEvent, exception: Exception):
    msg = event.update.message
    if msg:
        await msg.answer("😵 Something went wrong, try again.")
    raise exception                        # or return True to swallow it
```

| Argument | Meaning |
|---|---|
| `event` (`ErrorEvent`) | `event.update` the original update, `event.exception` the error |
| `exception` | the exception itself (injected) |

::: warn If an error handler returns nothing
When an error handler runs, its result counts as "handled" (even without `return`). If you want the error raised again, `raise exception` yourself. If **no** error handler matched, the error goes up and in polling is logged.
:::

## Rate limiting (429)

Bale rate-limits sending. When you exceed it you get `429 Too Many Requests` with `retry_after` (seconds). baleropy handles this **automatically**:

1. On the first 429, **all requests of that bot** pause until `retry_after` ends (not just that one; otherwise they would all retry together).
2. Then the request is resent.
3. Up to 5 attempts, and only if `retry_after` is at most 60 seconds; otherwise `BaleRetryAfter` is raised.

```python
from baleropy import Bot
from baleropy.client import AiohttpSession

session = AiohttpSession(
    retry_on_flood=60,        # wait up to this many seconds (0 = off)
    max_flood_retries=5,      # max number of attempts
    timeout=60,               # per-request timeout (seconds)
)
bot = Bot("TOKEN", session=session)
```

If you want control yourself:

```python
from baleropy.exceptions import BaleRetryAfter

session = AiohttpSession(retry_on_flood=0)            # not automatic
try:
    await bot.send_message(chat_id, text)
except BaleRetryAfter as e:
    await asyncio.sleep(e.retry_after)
```

::: tip Bulk sending?
For notifications to thousands of users use the [Business API](/guide/business); it has a separate and higher quota.
:::

## Common errors and their causes

| Error | Usually means |
|---|---|
| `401 Unauthorized` | the token is wrong or revoked |
| `403 permission_denied` | the user blocked the bot / the bot may not write in the group / the user never pressed `/start` |
| `400 chat not found` | the chat id is wrong |
| `400 message is not modified` | the new text and keyboard equal the old ones |
| `400 unsupported peer type` | you called a group-only method on a private chat (like `getChatMember`) |
| `429` | too fast; handled automatically |
| `ClientDecodeError` | an unexpected reply; details in `.data` and `.original` |
| `BaleNetworkError` | internet drop or timeout |

## Validation before sending

Limits documented by Bale (4096-character text, 200-character callback answer, ...) are checked **before sending** and raise `pydantic.ValidationError`:

```python
from pydantic import ValidationError

try:
    await message.answer("x" * 5000)
except ValidationError:
    for chunk in split_text("x" * 5000):          # from the helper utilities
        await message.answer(chunk)
```

## Logging

baleropy uses the standard `logging` (logger names: `baleropy.dispatcher`, `baleropy.middleware`, `baleropy.webhook`):

```python
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
```

API errors during polling are logged as **a single warning line** (no long traceback); unexpected errors with the full traceback.

## Summary

- Catch `BaleAPIError` and its subclasses; `@dp.error()` for global handling.
- 429 is handled automatically with a shared pause.
- Bale's limits are validated before sending.
- Next: [Payments](/guide/payments).

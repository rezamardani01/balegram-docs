---
title: Exceptions
lead: Every baleropy exception, its attributes and the matching HTTP codes.
---

All are imported from `baleropy.exceptions`. Teaching: [Errors & rate limits](/guide/errors).

```python
from baleropy.exceptions import BaleAPIError, BaleForbidden, BaleRetryAfter
```

## Table

| Exception | Base | Code | When? |
|---|---|---|---|
| `BaleropyError` | `Exception` | — | base of all library errors |
| `DetailedError` | `BaleropyError` | — | an error with a `message` |
| `BaleAPIError` | `DetailedError` | any | Bale answered `ok: false` |
| `BaleBadRequest` | `BaleAPIError` | 400 | invalid request |
| `BaleUnauthorized` | `BaleAPIError` | 401 | wrong/revoked token |
| `BaleForbidden` | `BaleAPIError` | 403 | no permission (the user blocked the bot, the bot may not write) |
| `BaleNotFound` | `BaleAPIError` | 404 | not found |
| `BaleRetryAfter` | `BaleAPIError` | 429 | rate limit; `.retry_after` seconds |
| `BaleServerError` | `BaleAPIError` | 5xx | a Bale server error |
| `BaleNetworkError` | `DetailedError` | — | network drop or timeout |
| `ClientDecodeError` | `DetailedError` | — | the reply could not be understood/validated |
| `SkipHandler` | `BaleropyError` | — | (you) skip this handler |
| `CancelHandler` | `BaleropyError` | — | (middleware) drop the event |

## Attributes

### BaleAPIError

| Attribute | Meaning |
|---|---|
| `.method` | the Bot API method name, e.g. `"sendMessage"` |
| `.message` | Bale's explanation (`description`) |
| `.error_code` | the error code (number) |
| `.parameters` | extra `dict` (e.g. `retry_after`) |

```python
try:
    await bot.send_message(chat_id, "Hello")
except BaleAPIError as e:
    print(e.method, e.error_code, e.message)
```

### BaleRetryAfter

```python
except BaleRetryAfter as e:
    await asyncio.sleep(e.retry_after)
```

### ClientDecodeError

| Attribute | Meaning |
|---|---|
| `.original` | the original exception (usually a pydantic validation error) |
| `.data` | the raw data that could not be decoded |

## Errors that come from pydantic

If a method's arguments violate Bale's documented limits (for example text over 4096 characters), `pydantic.ValidationError` is raised before sending; it is not a `BaleropyError`.

## Suggested handling

```python
from baleropy.exceptions import BaleForbidden, BaleAPIError, BaleNetworkError

try:
    await bot.send_message(user_id, text)
except BaleForbidden:
    mark_user_blocked(user_id)           # do not retry
except BaleNetworkError:
    schedule_retry(user_id, text)        # a temporary problem
except BaleAPIError as e:
    log.warning("API error %s: %s", e.error_code, e.message)
```

Next: [Cookbook](/cookbook/quiz-bot).

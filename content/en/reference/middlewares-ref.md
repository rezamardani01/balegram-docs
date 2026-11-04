---
title: Middlewares reference
lead: BaseMiddleware, the three built-in middlewares, the registration points and the outgoing-request (Session) middleware.
---

Conceptual teaching: [Middlewares](/guide/middlewares).

## BaseMiddleware

```python
from baleropy.dispatcher import BaseMiddleware

class MyMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data): ...
```

| Argument | Type | Meaning |
|---|---|---|
| `handler` | `async (event, data) -> Any` | the rest of the chain |
| `event` | `Message` / `CallbackQuery` / ... (or `Update` for `dp.update`) | the event |
| `data` | `dict` | the shared data; changes reach the handler |

Any async function with this signature is a middleware too.

## Registration points

| Code | When? |
|---|---|
| `dp.update.outer_middleware(mw)` | around the processing of **every** update |
| `observer.outer_middleware(mw)` | every event of that type in that Router, before filtering |
| `observer.middleware(mw)` | after a handler was chosen (inner); parent Routers before children |
| `session.middleware(mw)` | around every **outgoing request** to Bale |

`observer` is one of `router.message`, `edited_message`, `callback_query`, `pre_checkout_query`, `error`.

## LoggingMiddleware

```python
LoggingMiddleware(level=logging.INFO)
```

Logs every event with the user and processing time (logger `baleropy.middleware`). Errors are logged with a traceback and re-raised.

## ThrottlingMiddleware

```python
ThrottlingMiddleware(rate=1.0, on_throttled=None, max_tracked=10_000)
```

| Parameter | Meaning |
|---|---|
| `rate` | minimum gap between two events of one user (seconds) |
| `on_throttled` | `async (event, data)`; called **only the first time** in each window |
| `max_tracked` | ceiling of users kept in memory (old ones are purged) |

Extra events are dropped with `CancelHandler`. Events without `event_from_user` pass through.

## CallbackAnswerMiddleware

```python
CallbackAnswerMiddleware(text=None, show_alert=None)
```

After the handler runs, if `query.is_answered` is false it calls `answer(text, show_alert)` itself. Good for making sure buttons never stay in the "waiting" state.

```python
dp.callback_query.outer_middleware(CallbackAnswerMiddleware())
```

## Execution order

```text
dp.update outer           (UserContext, FSM and your middlewares)
  └ router outer          (parent → child)
      └ handler filters
          └ inner         (parent → child)
              └ handler
```

`dp.update` always has two built-in middlewares registered automatically: `UserContextMiddleware` (`event_from_user`, `event_chat`) and `FSMContextMiddleware` (`state`, `raw_state`).

## Control exceptions

| Exception | Effect |
|---|---|
| `CancelHandler` | the event is silently dropped (`UNHANDLED`) |
| `SkipHandler` | (in a handler) go to the next handler |

## get_flag

```python
from baleropy.dispatcher import get_flag
get_flag(data, "rate_limit", default=1)
```

The flag value of the chosen handler; only in an **inner** middleware (it needs `data["handler"]`).

Next: [Exceptions](/reference/exceptions).

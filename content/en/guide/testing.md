---
title: Testing your bot
lead: With no internet and no token, feed fake updates to the Dispatcher and see which requests your bot makes.
---

## The idea

We fake two things:

1. **The incoming update**: a `dict` like the one Bale sends → `Update`.
2. **The Bale server**: a fake `Session` that records requests instead of using the network.

Then we call `await dp.feed_update(bot, update)` and inspect the recorded requests.

## Setup

```python title="tests/conftest.py"
import json
from typing import Any

import pytest

from baleropy import Bot
from baleropy.client.session.base import BaseSession
from baleropy.types import Update


class FakeSession(BaseSession):
    """Stores requests instead of using the network and returns a success reply."""

    def __init__(self) -> None:
        super().__init__(retry_on_flood=0)
        self.calls: list[tuple[str, dict[str, Any]]] = []

    async def _send(self, bot, method):
        data, _files = method.build_request()
        self.calls.append((method.__api_method__, data))
        # a sample message; enough for methods that return a Message
        result: Any = {"message_id": 1, "date": 1, "chat": {"id": data.get("chat_id", 1), "type": "private"}}
        if method.__api_method__ in {"answerCallbackQuery", "sendChatAction", "deleteMessage"}:
            result = True
        return 200, json.dumps({"ok": True, "result": result}).encode()

    async def stream_content(self, url, chunk_size=65536):
        yield b""

    async def close(self) -> None: ...


@pytest.fixture
def session() -> FakeSession:
    return FakeSession()


@pytest.fixture
def bot(session: FakeSession) -> Bot:
    return Bot("1:abc", session=session)


def make_update(bot: Bot, text: str, user_id: int = 100, update_id: int = 1) -> Update:
    raw = {
        "update_id": update_id,
        "message": {
            "message_id": update_id, "date": 1, "text": text,
            "from": {"id": user_id, "first_name": "Reza"},
            "chat": {"id": user_id, "type": "private"},
        },
    }
    return Update.model_validate(raw, context={"bot": bot})      # context = bot: for message.answer
```

::: warn Don't forget context={"bot": bot}
Without it `message.answer()` does not know which bot to send with and raises `not bound to a Bot`.
:::

## Writing tests

```python title="tests/test_handlers.py"
from baleropy.dispatcher import UNHANDLED
from conftest import make_update
from my_bot.bot import dp          # your project's Dispatcher


async def test_start_greets(bot, session):
    await dp.feed_update(bot, make_update(bot, "/start"))

    method, data = session.calls[0]
    assert method == "sendMessage"
    assert "Hello" in data["text"]


async def test_unknown_command_is_ignored(bot, session):
    result = await dp.feed_update(bot, make_update(bot, "/nothing"))
    assert result is UNHANDLED          # no handler matched
    assert session.calls == []


async def test_handler_return_value(bot):
    # feed_update returns the handler's return value
    assert await dp.feed_update(bot, make_update(bot, "5")) == "number"
```

For `pytest-asyncio` put this in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
```

## Testing an FSM conversation

The state stays in `MemoryStorage`, so several updates in a row simulate a conversation:

```python
async def test_form_flow(bot, session):
    for i, text in enumerate(["/form", "Reza", "30"], start=1):
        await dp.feed_update(bot, make_update(bot, text, update_id=i))

    texts = [d["text"] for m, d in session.calls if m == "sendMessage"]
    assert texts[-1].startswith("✅ Saved")
```

::: tip A fresh Dispatcher per test
FSM state and Dispatcher data persist between tests. If you build the bot in a function (`def create_dispatcher() -> Dispatcher`) and call it in a fixture, tests stay isolated.
:::

## Testing a button (callback)

```python
def make_callback(bot, data: str, user_id: int = 100) -> Update:
    raw = {
        "update_id": 1,
        "callback_query": {
            "id": "9001", "from": {"id": user_id, "first_name": "Reza"}, "data": data,
            "message": {"message_id": 5, "date": 1, "chat": {"id": user_id, "type": "private"}},
        },
    }
    return Update.model_validate(raw, context={"bot": bot})


async def test_like_button(bot, session):
    await dp.feed_update(bot, make_callback(bot, "like"))
    assert ("answerCallbackQuery", {"callback_query_id": "9001", "text": "Thanks ❤️"}) in session.calls
```

::: note The callback id
An id starting with `1` counts as an "old client" and `query.answer()` is skipped; in tests use an id like `"9001"`.
:::

## Testing a middleware or filter

A filter is an async object; call it directly:

```python
from baleropy.filters import Command

async def test_command_filter():
    result = await Command("start")(message_obj)
    assert result["command"].args == "ref1"
```

## With a real HTTP server (advanced)

To test the network layer too, start a local `aiohttp` server and pass `ApiServer.from_base("http://127.0.0.1:PORT")` to `Bot(server=...)`. Ready examples live in the `tests/` folder of the baleropy repository.

## Summary

- `FakeSession` + `Update.model_validate(..., context={"bot": bot})` + `dp.feed_update`.
- The test result: `session.calls` and the return value.
- Give every test a fresh Dispatcher.
- Next: [Method reference](/reference/methods-messages).

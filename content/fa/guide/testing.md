---
title: تست کردن ربات
lead: بدون اینترنت و بدون توکن، آپدیت جعلی به Dispatcher بدهید و ببینید ربات چه درخواست‌هایی می‌فرستد.
---

## ایده

دو چیز را جعل می‌کنیم:

1. **آپدیت ورودی**: یک `dict` مثل آنچه بله می‌فرستد → `Update`.
2. **سرور بله**: یک `Session` ساختگی که به‌جای شبکه، درخواست‌ها را ضبط می‌کند.

سپس `await dp.feed_update(bot, update)` را صدا می‌زنیم و درخواست‌های ضبط‌شده را بررسی می‌کنیم.

## آماده‌سازی

```python title="tests/conftest.py"
import json
from typing import Any

import pytest

from balegram import Bot
from balegram.client.session.base import BaseSession
from balegram.types import Update


class FakeSession(BaseSession):
    """به‌جای شبکه، درخواست‌ها را ذخیره می‌کند و پاسخ موفق برمی‌گرداند."""

    def __init__(self) -> None:
        super().__init__(retry_on_flood=0)
        self.calls: list[tuple[str, dict[str, Any]]] = []

    async def _send(self, bot, method):
        data, _files = method.build_request()
        self.calls.append((method.__api_method__, data))
        # یک پیام نمونه؛ برای متدهایی که Message برمی‌گردانند کافی است
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
    return Update.model_validate(raw, context={"bot": bot})      # context = bot: برای message.answer
```

::: warn context={"bot": bot} را فراموش نکنید
بدون آن، `message.answer()` نمی‌داند از کدام ربات بفرستد و خطای `not bound to a Bot` می‌دهد.
:::

## نوشتن تست

```python title="tests/test_handlers.py"
from balegram.dispatcher import UNHANDLED
from conftest import make_update
from my_bot.bot import dp          # Dispatcher پروژه‌ی شما


async def test_start_greets(bot, session):
    await dp.feed_update(bot, make_update(bot, "/start"))

    method, data = session.calls[0]
    assert method == "sendMessage"
    assert "سلام" in data["text"]


async def test_unknown_command_is_ignored(bot, session):
    result = await dp.feed_update(bot, make_update(bot, "/nothing"))
    assert result is UNHANDLED          # هیچ هندلری نخورد
    assert session.calls == []


async def test_handler_return_value(bot):
    # feed_update مقدار بازگشتی هندلر را برمی‌گرداند
    assert await dp.feed_update(bot, make_update(bot, "5")) == "number"
```

برای `pytest-asyncio` در `pyproject.toml` بگذارید:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
```

## تست گفتگوی FSM

حالت در `MemoryStorage` می‌ماند، پس چند آپدیت پشت‌سرهم یک گفتگو را شبیه‌سازی می‌کنند:

```python
async def test_form_flow(bot, session):
    for i, text in enumerate(["/form", "رضا", "30"], start=1):
        await dp.feed_update(bot, make_update(bot, text, update_id=i))

    texts = [d["text"] for m, d in session.calls if m == "sendMessage"]
    assert texts[-1].startswith("✅ ثبت شد")
```

::: tip هر تست یک Dispatcher تازه
حالت FSM و داده‌ی Dispatcher بین تست‌ها می‌ماند. اگر ربات را در تابع بسازید (`def create_dispatcher() -> Dispatcher`) و در fixture صدا بزنید، تست‌ها از هم ایزوله می‌مانند.
:::

## تست دکمه (callback)

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
    assert ("answerCallbackQuery", {"callback_query_id": "9001", "text": "ممنون ❤️"}) in session.calls
```

::: note شناسه‌ی callback
شناسه‌ای که با `1` شروع شود «کلاینت قدیمی» حساب می‌شود و `query.answer()` رد می‌شود؛ در تست از شناسه‌ای مثل `"9001"` استفاده کنید.
:::

## تست میدلور و فیلتر

فیلتر یک شیء async است؛ مستقیم صدایش بزنید:

```python
from balegram.filters import Command

async def test_command_filter():
    result = await Command("start")(message_obj)
    assert result["command"].args == "ref1"
```

## با سرور HTTP واقعی (پیشرفته)

اگر می‌خواهید لایه‌ی شبکه را هم تست کنید، یک سرور `aiohttp` محلی بسازید و `ApiServer.from_base("http://127.0.0.1:PORT")` را به `Bot(server=...)` بدهید. مثال‌های آماده در پوشه‌ی `tests/` مخزن balegram هست.

## خلاصه

- `FakeSession` + `Update.model_validate(..., context={"bot": bot})` + `dp.feed_update`.
- نتیجه‌ی تست: `session.calls` و مقدار بازگشتی.
- هر تست Dispatcher تازه بگیرد.
- بعدی: [مرجع متدها](/reference/methods-messages).

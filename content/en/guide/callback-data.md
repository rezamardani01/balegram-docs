---
title: CallbackData
lead: Instead of building and parsing strings like "item:5:buy" by hand, write a typed class and let pack/unpack happen automatically.
---

## The problem with hand-made strings

`callback_data` is a string of at most 64 bytes. If you build it by hand:

```python
kb.button(text="Buy", callback_data=f"item:{item.id}:buy")         # build
...
_, item_id, action = query.data.split(":")                         # parse
item_id = int(item_id)                                             # convert... and if it is broken?
```

It is error-prone and repetitive. `CallbackData` solves it.

## Definition

```python title="callbacks.py"
from baleropy.filters import CallbackData


class ItemCb(CallbackData, prefix="item"):
    id: int
    action: str
```

- `prefix` is the start of the string and must be unique (and contain no `:`).
- Fields are typed; conversion (for example `str → int`) and validation are done by pydantic.

## Usage

### Building a button

```python
from baleropy import Button

buttons = [[
    Button.inline("🛒 Buy", ItemCb(id=5, action="buy")),        # pass the object directly
    Button.inline("ℹ️ Details", ItemCb(id=5, action="info")),
]]
```

The resulting string: `item:5:buy`.

### Receiving it in a handler

```python
@router.callback_query(ItemCb.filter())
async def any_item(query: CallbackQuery, callback_data: ItemCb):
    await query.answer(f"Item {callback_data.id}: {callback_data.action}")


@router.callback_query(ItemCb.filter(F.action == "buy"))               # with an F condition
async def buy(query: CallbackQuery, callback_data: ItemCb):
    ...
```

The unpacked object is injected as `callback_data`. If the string does not belong to `ItemCb` or a field type is broken, the filter simply rejects (no error).

## Supported types

| Type | Stored in the string as |
|---|---|
| `int`, `float`, `str` | the value |
| `bool` | `1` / `0` |
| `Enum` | the enum value |
| `Optional[...]` or `X \| None` | an empty value (`item:5:`) for `None` |
| `UUID` etc. | whatever pydantic builds from a string |

```python
from enum import Enum

class Action(str, Enum):
    BUY = "buy"
    INFO = "info"

class ItemCb(CallbackData, prefix="item"):
    id: int
    action: Action
    gift: bool = False
    note: str | None = None

ItemCb(id=5, action=Action.BUY, gift=True).pack()    # "item:5:buy:1:"
ItemCb.unpack("item:5:buy:1:")                       # the full object
```

## Limits

::: warn The 64-byte ceiling
Bale accepts `callback_data` of at most 64 bytes (UTF-8). `pack()` raises `ValueError` if it is longer. Persian letters are 2 bytes each; keep long text values in a dict/database and send only a numeric id.
:::

- A string field value **must not** contain the separator (`:`); otherwise `ValueError`.
- You can change the separator: `class X(CallbackData, prefix="x", sep="|")`.

## Full example: pagination

```python
from baleropy import Router
from baleropy.filters import CallbackData, Command
from baleropy.types import CallbackQuery, Message
from baleropy.utils import InlineKeyboardBuilder

router = Router()
ITEMS = [f"Product {i}" for i in range(1, 24)]
PER_PAGE = 5


class PageCb(CallbackData, prefix="page"):
    n: int


def page_view(n: int):
    chunk = ITEMS[n * PER_PAGE:(n + 1) * PER_PAGE]
    text = f"📦 Page {n + 1}\n\n" + "\n".join(f"• {x}" for x in chunk)
    kb = InlineKeyboardBuilder()
    if n > 0:
        kb.button(text="◀️ Previous", callback_data=PageCb(n=n - 1), style="primary")
    if (n + 1) * PER_PAGE < len(ITEMS):
        kb.button(text="Next ▶️", callback_data=PageCb(n=n + 1), style="primary")
    return text, kb.as_markup()


@router.message(Command("list"))
async def list_items(message: Message):
    text, markup = page_view(0)
    await message.answer(text, reply_markup=markup)


@router.callback_query(PageCb.filter())
async def turn(query: CallbackQuery, callback_data: PageCb):
    text, markup = page_view(callback_data.n)
    await query.message.edit_text(text, reply_markup=markup)
    await query.answer()
```

## Summary

- A class with `prefix` + typed fields.
- Build: `callback_data=ItemCb(...)`; receive: `ItemCb.filter()` and the `callback_data` argument.
- 64-byte ceiling and no `:` in values.
- Next: [Sending & receiving files](/guide/files).

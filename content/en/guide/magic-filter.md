---
title: The magic F filter
lead: With F you write any condition on a message like an ordinary Python expression. No function, no class.
---

## The idea

`F` means "field". Instead of `lambda m: m.text == "hello"` you write `F.text == "hello"`. Each dot goes to an attribute of the message and each operator builds a condition:

```python
from balegram import F

@dp.message(F.text == "hello")                       # text is exactly "hello"
@dp.message(F.text.startswith("/"))                  # starts with /
@dp.message(F.from_user.id == 12345)                 # a specific sender
@dp.message(F.chat.type == "private")                # private chat
@dp.message(F.photo)                                 # has a photo
@dp.message(F.reply_to_message)                      # is a reply
```

::: tip What if an attribute is missing?
No problem. If any step of the chain is missing (for example `from_user` is `None`) the result is just **false** instead of an error. So `F.from_user.id == 5` does not crash on a channel post.
:::

## All operators

### Comparison

| Expression | Meaning |
|---|---|
| `F.text == "a"` | equal |
| `F.text != "a"` | not equal |
| `F.date > 1700000000` | greater (`<` `>=` `<=` too) |
| `F.a == F.b` | compare two fields with each other |

### Strings and sets

| Expression | Meaning |
|---|---|
| `F.text.in_({"a", "b"})` | value is in the set |
| `F.text.not_in({"x"})` | value is not in the set |
| `F.text.contains("hello")` | contains a substring |
| `F.text.startswith("hi")` | starts with (also `ignore_case=True`) |
| `F.text.endswith("?")` | ends with |
| `F.text.lower()` | lowercase it, for comparisons |
| `F.text.len() > 10` | longer than 10 |
| `F.text.regexp(r"\d+")` | a regex pattern |

### Control and tools

| Expression | Meaning |
|---|---|
| `F.photo` | exists and is non-empty |
| `F.x.is_(None)` / `F.x.is_not(None)` | identity comparison |
| `F.text.func(my_function)` | your own function |
| `F.text.as_("t")` | if it has a value, pass it to the handler as argument `t` |

## Combining

```python
@dp.message(F.text & (F.chat.type == "private"))                # AND
@dp.message((F.text == "a") | (F.text == "b"))                  # OR
@dp.message(~F.text.startswith("/"), F.text)                    # NOT
@dp.message(F.photo | F.video | F.document | F.audio)           # any media
```

::: warn Don't forget parentheses
Python's operator precedence makes `F.a == 1 | F.b == 2` parse wrongly. Always wrap each condition: `(F.a == 1) | (F.b == 2)`.
:::

::: danger Don't use `and` / `or` / `not`
Those work on booleans and `F` cannot be turned into one. If you do, you get `TypeError: MagicFilter cannot be used as a boolean`. Use `&` `|` `~` instead.
:::

## Regex and capturing the result

When a condition is "true but not `True`" (like a regex Match) the value reaches the handler as `magic_result`:

```python
import re

@dp.message(F.text.regexp(r"^order[- ](\d+)$"))
async def order(message: Message, magic_result: re.Match):
    order_id = magic_result.group(1)
    await message.answer(f"Found order {order_id}")
```

Or choose your own name with `as_`:

```python
@dp.message(F.text.regexp(r"\d+").as_("number"))
async def n(message: Message, number: re.Match): ...
```

## F on buttons

```python
@dp.callback_query(F.data == "yes")
async def yes(query: CallbackQuery): ...

@dp.callback_query(F.data.startswith("page:"))
async def page(query: CallbackQuery):
    n = int(query.data.split(":")[1])
```

For more complex buttons [CallbackData](/guide/callback-data) is cleaner.

## MagicData: filter over middleware data

If a middleware put a value into `data` (for example `is_admin`), use `MagicData` to test it:

```python
from balegram.filters import MagicData

@dp.message(MagicData(F.is_admin))
async def only_admins(message: Message): ...

@dp.message(MagicData(F.event_from_user.id == F.config.owner_id))
async def owner_only(message: Message): ...
```

## Common recipes

```python
# only non-command text
@dp.message(F.text, ~F.text.startswith("/"))

# only in groups, only replies
@dp.message((F.chat.type == "group") & F.reply_to_message)

# an Iranian mobile number
@dp.message(F.text.regexp(r"^09\d{9}$"))

# short message
@dp.message(F.text.len() < 20)

# only when the user is one of these
ADMINS = {111, 222}
@dp.message(F.from_user.id.in_(ADMINS))
```

## Summary

- `F.<field>` + operator = filter.
- Missing attribute ⇒ false, not an error.
- Combine only with `&` `|` `~` and parentheses.
- Next: [Custom filters](/guide/custom-filters).

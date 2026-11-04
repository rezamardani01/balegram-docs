---
title: مرجع فیلترها
lead: همه‌ی فیلترهای آماده با امضا، پارامترها، دادهای که به هندلر می‌دهند و مثال.
---

همه از `baleropy.filters` import می‌شوند. آموزش مفهومی در درس‌های [فیلترها](/guide/filters)، [F](/guide/magic-filter) و [فیلتر کاستوم](/guide/custom-filters).

## Filter (کلاس پایه)

```python
class Filter:
    async def __call__(self, event, **data) -> bool | dict: ...
```

از آن ارث ببرید تا `&`، `|` و `~` خودکار داشته باشید. خروجی: `False` رد، `True` قبول، `dict` قبول + تزریق.

## Command

```python
Command(*commands, prefix="/", ignore_case=False, ignore_mention=False, magic=None)
```

| پارامتر | معنی |
|---|---|
| `*commands` | یک یا چند نام (رشته یا `re.Pattern`) بدون پیشوند |
| `prefix` | پیشوند دستور؛ پیش‌فرض `/` |
| `ignore_case` | نادیده‌گرفتن اندازه‌ی حروف |
| `ignore_mention` | نادیده‌گرفتن بررسی `@نام_ربات` |
| `magic` | فیلتر `F` روی `CommandObject` (مثلاً `F.args`) |

**تزریق:** `command: CommandObject` با `prefix`، `command`، `mention`، `args`، `args_list`، `text`.

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

| پارامتر | معنی |
|---|---|
| `deep_link=True` | فقط `/start` همراه پارامتر |
| `encoded=True` | پارامتر را از base64 امن رمزگشایی کن |

## F / MagicFilter

```python
F.text == "سلام"     F.from_user.id.in_({1, 2})     F.text.regexp(r"\d+")
```

عملگرها: `== != < <= > >=`، `in_`، `not_in`، `contains`، `startswith`، `endswith`، `lower`، `len`، `is_`، `is_not`، `regexp`، `func`، `as_`، و ترکیب با `& | ~`. فهرست کامل با مثال در [فیلتر جادویی](/guide/magic-filter).

**تزریق:** `magic_result` (وقتی نتیجه غیر از `True` باشد، مثل Match).

## MagicData

```python
MagicData(F.<field on data>)
```

شرط جادویی روی **داده‌ی** میدلورها (و `event`):

```python
@dp.message(MagicData(F.is_admin))
@dp.message(MagicData(F.event_from_user.id == F.config.owner_id))
```

## StateFilter

```python
StateFilter(*states)     # State | رشته | StatesGroup | None | "*"
```

| ورودی | معنی |
|---|---|
| `Form.name` | آن حالت |
| `Form` | هر حالت گروه |
| `None` | هیچ حالتی |
| `"*"` / `any_state` | هر حالتی |

`State` خودش هم فیلتر است: `@router.message(Form.name)`.

## CallbackData.filter

```python
class Cb(CallbackData, prefix="x"): ...
Cb.filter()                 # همه
Cb.filter(F.action == "a")  # با شرط
```

**تزریق:** `callback_data` (شیء `Cb`). بسته‌شدن ناموفق = رد، بدون خطا. ([CallbackData](/guide/callback-data))

## ChatTypeFilter

```python
ChatTypeFilter("private")
ChatTypeFilter("group", "supergroup", "channel")
```

روی `Message` و `CallbackQuery` (با پیام) کار می‌کند.

## IsChatAdmin

```python
IsChatAdmin()
```

فرستنده owner یا administrator است؟ یک تماس `getChatMember` (فقط در گروه/کانال). ⚠️ آن را **آخر** فیلترها بگذارید.

## IsMember

```python
IsMember(*chat_ids)
```

فرستنده در **همه‌ی** چت‌های داده‌شده عضو است؟ (ربات باید در آن‌ها ادمین باشد.) مناسب عضویت اجباری ([دستور پخت](/cookbook/mandatory-membership)).

## ExceptionTypeFilter / ExceptionMessageFilter

برای `@router.error()`:

```python
ExceptionTypeFilter(BaleForbidden, BaleBadRequest)
ExceptionMessageFilter(r"not modified")       # تزریق: match_exception
```

## خلاصه جدول

| فیلتر | تزریق | تماس API؟ |
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

بعدی: [مرجع میدلورها](/reference/middlewares-ref).

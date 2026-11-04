---
title: فیلترها
lead: فیلتر شرطِ اجرای هندلر است. فیلترهای آماده، ترکیبشان با عملگرها، و فیلترهایی که داده به هندلر می‌دهند.
---

## فیلتر چیست؟

به هر هندلر می‌توانید یک یا چند فیلتر بدهید. هندلر فقط وقتی اجرا می‌شود که **همه‌ی فیلترها درست** باشند (AND). هر فیلتر یکی از این‌ها را برمی‌گرداند:

| خروجی فیلتر | معنی |
|---|---|
| `False` | رد؛ برو سراغ هندلر بعدی |
| `True` | قبول |
| `dict` | قبول **و** مقدارهای dict به‌عنوان آرگومان به هندلر داده می‌شود |

```python
from balegram import F
from balegram.filters import Command, ChatTypeFilter

@dp.message(Command("start"), ChatTypeFilter("private"))   # هر دو باید درست باشند
async def start_in_private(message): ...
```

## فیلترهای آماده

| فیلتر | کار |
|---|---|
| [`Command`](/reference/filters-ref) | دستورهایی مثل `/start arg` + آرگومان‌ها |
| `CommandStart` | `/start` با پشتیبانی لینک عمیق (deep link) |
| [`F`](/guide/magic-filter) | فیلتر جادویی برای هر شرطی روی پیام |
| `StateFilter` | حالت FSM فعلی |
| `CallbackData.filter()` | دکمه‌های تایپ‌دار |
| `ChatTypeFilter` | نوع چت: private / group / channel |
| `IsChatAdmin` | فرستنده ادمین چت است؟ |
| `IsMember` | فرستنده عضو کانال‌ها/گروه‌های داده‌شده است؟ |
| `MagicData` | فیلتر جادویی روی *داده‌ی* میدلورها |
| `ExceptionTypeFilter` / `ExceptionMessageFilter` | برای هندلر خطا |

## ترکیب با & ، | و ~

```python
from balegram.filters import Command, ChatTypeFilter, IsChatAdmin

# AND با عملگر & (معادل دادن دو فیلتر جدا)
@dp.message(Command("ban") & IsChatAdmin())

# OR با |
@dp.message(F.photo | F.video | F.document)

# NOT با ~
@dp.message(~Command("start"), F.text)      # هر متنی جز /start
```

::: note فرق «چند آرگومان» و «&»
`@dp.message(A, B)` و `@dp.message(A & B)` هم‌ارزند. ولی `|` و `~` فقط با عملگر ممکن است.
:::

## فیلترهایی که داده می‌دهند

وقتی یک فیلتر `dict` برمی‌گرداند، کلیدهای آن مثل آرگومان به هندلر می‌رسند. `Command` همین کار را می‌کند:

```python
from balegram.filters import Command, CommandObject

@dp.message(Command("repeat"))
async def repeat(message: Message, command: CommandObject):
    # /repeat سلام دنیا
    await message.answer(command.args or "یه متن بده!")
```

`CommandObject` این فیلدها را دارد:

| فیلد | مثال برای `/repeat@mybot a b` |
|---|---|
| `command.command` | `repeat` |
| `command.args` | `a b` |
| `command.args_list` | `['a', 'b']` |
| `command.mention` | `mybot` |
| `command.prefix` | `/` |

## Command با جزئیات

```python
Command("start")                       # /start
Command("help", "menu")                # یکی از چند دستور
Command("go", prefix="!")              # !go
Command("START", ignore_case=True)     # حساس به حروف نباشد
Command(re.compile(r"item\d+"))        # الگو: /item12
Command("x", magic=F.args)             # فقط وقتی آرگومان دارد: /x 5
```

::: tip @mention
در گروه‌ها ممکن است کاربر `/start@mybot` بزند. `Command` به‌صورت پیش‌فرض بررسی می‌کند که mention واقعاً نام **همین** ربات باشد (با `getMe` یک بار و کش). با `ignore_mention=True` این بررسی خاموش می‌شود.
:::

## لینک عمیق با CommandStart

لینک `https://ble.ir/<ربات>?start=ref42` وقتی باز شود، ربات `/start ref42` را دریافت می‌کند:

```python
from balegram.filters import CommandStart, CommandObject

@dp.message(CommandStart(deep_link=True))          # فقط وقتی پارامتر دارد
async def with_ref(message: Message, command: CommandObject):
    await message.answer(f"کد دعوت: {command.args}")

@dp.message(CommandStart())                        # /start ساده
async def plain(message: Message):
    await message.answer("خوش آمدی!")
```

برای پارامترهای پیچیده، `encoded=True` بگذارید تا مقدار به‌صورت base64 رمزگشایی شود (و با `create_start_link(bot, "x", encode=True)` بسازید). جزئیات در [ابزارهای کمکی](/guide/utils).

## فیلتر نوع چت و ادمین

```python
from balegram.filters import ChatTypeFilter, IsChatAdmin, IsMember

@dp.message(Command("panel"), ChatTypeFilter("private"))
async def panel(message: Message): ...

@dp.message(Command("ban"), IsChatAdmin())          # یک تماس API
async def ban(message: Message): ...

@dp.message(IsMember("@my_channel"))                # عضویت اجباری
async def members_only(message: Message): ...
```

::: warn ترتیب فیلترها مهم است
فیلترها به ترتیب چک می‌شوند و اولین `False` کار را تمام می‌کند. فیلترهای ارزان (`Command`) را **اول** و فیلترهایی که API صدا می‌زنند (`IsChatAdmin`) را **آخر** بگذارید تا برای هر پیام بی‌خودی درخواست نرود.
:::

## بازی با فیلترها

::: widget playground
:::

## خلاصه

- همه‌ی فیلترها درست ⇒ هندلر اجرا می‌شود.
- با `&` `|` `~` ترکیب کنید.
- فیلتر می‌تواند `dict` برگرداند و آرگومان تزریق کند.
- بعدی: [فیلتر جادویی F](/guide/magic-filter).

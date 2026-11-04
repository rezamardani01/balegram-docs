---
title: ماشین حالت (FSM)
lead: برای گفتگوهای چندمرحله‌ای (ثبت‌نام، سفارش، مسابقه) ربات باید یادش بماند کاربر کجاست. FSM دقیقاً همین کار را می‌کند.
---

## مشکل چیست؟

وقتی ربات می‌پرسد «اسمت چیه؟» و کاربر «رضا» می‌نویسد، ربات از کجا بفهمد این «رضا» جواب همان سؤال است و یک پیام معمولی نیست؟ جواب: **حالت (State)**. ربات برای هر کاربر یک حالت ذخیره می‌کند و هندلرها را بر اساس آن انتخاب می‌کند.

## گام ۱: تعریف حالت‌ها

```python title="states.py"
from baleropy.fsm import State, StatesGroup


class Form(StatesGroup):
    name = State()
    age = State()
    city = State()
```

نام کامل هر حالت `Form:name`، `Form:age` و ... است.

## گام ۲: هندلرها

```python title="handlers.py"
from baleropy import F, Router
from baleropy.filters import Command
from baleropy.fsm import FSMContext
from baleropy.types import Message

router = Router()


@router.message(Command("form"))
async def begin(message: Message, state: FSMContext):
    await state.set_state(Form.name)                  # ورود به مرحله‌ی اول
    await message.answer("اسمت چیه؟")


@router.message(Form.name, F.text)                    # فقط وقتی در حالت name هستیم
async def got_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text)        # ذخیره‌ی جواب
    await state.set_state(Form.age)
    await message.answer("چند سالته؟")


@router.message(Form.age, F.text.regexp(r"^\d{1,3}$"))
async def got_age(message: Message, state: FSMContext):
    await state.update_data(age=int(message.text))
    await state.set_state(Form.city)
    await message.answer("در کدام شهر زندگی می‌کنی؟")


@router.message(Form.age)                             # سن نامعتبر
async def bad_age(message: Message):
    await message.answer("لطفاً فقط عدد بفرست 🙏")


@router.message(Form.city, F.text)
async def got_city(message: Message, state: FSMContext):
    data = await state.update_data(city=message.text)  # دیکشنری کامل برمی‌گردد
    await state.clear()                                # پایان: حالت و داده پاک می‌شود
    await message.answer(
        f"✅ ثبت شد:\nنام: {data['name']}\nسن: {data['age']}\nشهر: {data['city']}"
    )
```

یک `State` را مستقیم به‌عنوان فیلتر استفاده می‌کنید: `@router.message(Form.name)`.

## FSMContext: شیء `state`

| متد | کار |
|---|---|
| `await state.set_state(Form.age)` | تغییر حالت (`None` = بدون حالت) |
| `await state.get_state()` | رشته‌ی حالت فعلی یا `None` |
| `await state.update_data(a=1, b=2)` | ادغام در داده و برگرداندن داده‌ی کامل |
| `await state.set_data({...})` | جایگزینی کل داده |
| `await state.get_data()` | دیکشنری داده |
| `await state.get_value("name", default)` | یک مقدار |
| `await state.clear()` | حذف حالت و داده |

## فیلتر حالت

```python
from baleropy.filters import StateFilter
from baleropy.fsm import default_state, any_state

@router.message(Form.name)                      # یک حالت
@router.message(StateFilter(Form.name, Form.age))   # یکی از چند حالت
@router.message(StateFilter(Form))              # هر حالتی از گروه Form
@router.message(default_state)                  # هیچ حالتی (حالت عادی)
@router.message(any_state)                      # هر حالتی، حتی بدون حالت
```

## لغو در هر مرحله

```python
from baleropy.filters import Command

@router.message(Command("cancel"))              # بدون فیلتر حالت: همه‌جا کار می‌کند
async def cancel(message: Message, state: FSMContext):
    if await state.get_state() is None:
        return await message.answer("چیزی برای لغو کردن نیست.")
    await state.clear()
    await message.answer("لغو شد ❌")
```

::: warn ترتیب ثبت را رعایت کنید
`/cancel` را **قبل از** هندلرهایی ثبت کنید که در یک حالت «هر پیامی» را می‌پذیرند؛ وگرنه آن‌ها دستور را به‌عنوان جواب می‌خورند (یا فیلتر `~F.text.startswith("/")` بگذارید).
:::

## حالت‌های تو در تو

```python
class Order(StatesGroup):
    class Payment(StatesGroup):
        card = State()
        confirm = State()

    items = State()
    address = State()

# Order.Payment.card.state == "Order.Payment:card"
# StateFilter(Order) همه‌ی حالت‌ها از جمله داخلی‌ها را می‌گیرد
```

## استراتژی ذخیره: حالت برای چه کسی؟

```python
from baleropy import Dispatcher
from baleropy.fsm import FSMStrategy

dp = Dispatcher(fsm_strategy=FSMStrategy.USER_IN_CHAT)   # پیش‌فرض
```

| استراتژی | کلید ذخیره | مناسب برای |
|---|---|---|
| `USER_IN_CHAT` | (چت، کاربر) | هر کاربر در هر گروه حالت جدا دارد؛ استاندارد |
| `CHAT` | (چت) | یک حالت مشترک برای کل گروه (بازی گروهی) |
| `GLOBAL_USER` | (کاربر) | حالت کاربر در همه‌ی چت‌ها یکی است |

## ذخیره‌سازها

| ذخیره‌ساز | ویژگی |
|---|---|
| `MemoryStorage()` | پیش‌فرض؛ سریع؛ با خاموش‌شدن ربات پاک می‌شود |
| `RedisStorage` | ماندگار؛ برای تولید (production)؛ داده باید JSON‌پذیر باشد |

```python
from baleropy.fsm import MemoryStorage, RedisStorage

dp = Dispatcher(storage=MemoryStorage())

# Redis (pip install baleropy[redis])
storage = RedisStorage.from_url("redis://localhost:6379/0", state_ttl=3600, data_ttl=3600)
dp = Dispatcher(storage=storage)
```

`state_ttl` و `data_ttl` عمر کلیدها را (ثانیه) تعیین می‌کنند تا فرم‌های رهاشده خودبه‌خود پاک شوند.

### ذخیره‌ساز دلخواه

از `BaseStorage` ارث ببرید و پنج کوروتین را پیاده کنید: `set_state`، `get_state`، `set_data`، `get_data`، `close`.

## مثال کامل: حدس عدد

```python
import random
from baleropy import F, Router
from baleropy.filters import Command
from baleropy.fsm import FSMContext, State, StatesGroup
from baleropy.types import Message

router = Router()


class Guess(StatesGroup):
    playing = State()


@router.message(Command("guess"))
async def start_game(message: Message, state: FSMContext):
    await state.set_state(Guess.playing)
    await state.update_data(target=random.randint(1, 100), tries=0)
    await message.answer("🔢 عددی بین ۱ تا ۱۰۰ حدس بزن!")


@router.message(Guess.playing, F.text.regexp(r"^\d{1,3}$"))
async def attempt(message: Message, state: FSMContext):
    data = await state.get_data()
    number, tries = int(message.text), data["tries"] + 1
    if number == data["target"]:
        await state.clear()
        return await message.reply(f"🎉 درسته! با {tries} حدس پیدا کردی.")
    await state.update_data(tries=tries)
    await message.reply("⬆️ بیشتر" if number < data["target"] else "⬇️ کمتر")
```

## خلاصه

- `StatesGroup` + `State` حالت‌ها را تعریف می‌کنند.
- `state.set_state` / `update_data` / `clear`.
- `State` خودش فیلتر است؛ ترتیب ثبت هندلرها مهم است.
- بعدی: [کیبورد و دکمه رنگی](/guide/keyboards).

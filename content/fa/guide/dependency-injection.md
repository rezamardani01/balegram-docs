---
title: تزریق وابستگی
lead: هندلرها، فیلترها و میدلورها فقط آرگومان‌هایی را که اعلام کرده‌اند می‌گیرند؛ balegram بقیه را خودکار می‌رساند.
---

## قانون اصلی

balegram **با نام** آرگومان‌ها را تزریق می‌کند (نه با نوع). هر نامی که در تابعتان بنویسید و در «داده‌ی جاری» موجود باشد، پر می‌شود:

```python
@dp.message(Command("me"))
async def me(message: Message, bot: Bot, event_from_user, state: FSMContext):
    #            ↑ رویداد     ↑ از نام «bot»    ↑ از نام   ↑ از نام «state»
    ...
```

::: note نوع (type hint) فقط برای خوانایی است
`bot: Bot` به‌خاطر نام `bot` پر می‌شود، نه به‌خاطر نوع `Bot`. اگر بنویسید `b: Bot` مقداری نمی‌گیرد.
:::

## چه نام‌هایی موجودند؟

| نام | مقدار | کی؟ |
|---|---|---|
| `bot` | شیء `Bot` که این آپدیت را گرفته | همیشه |
| `dispatcher` | `Dispatcher` ریشه | همیشه |
| `event_update` | کل `Update` خام | همیشه |
| `event_router` | `Router` فعلی | همیشه |
| `event_from_user` | `User` فرستنده | وقتی از کاربر باشد |
| `event_chat` | `Chat` | وقتی چت داشته باشد |
| `state` | `FSMContext` این کاربر | وقتی کاربر/چت داشته باشد |
| `raw_state` | رشته‌ی حالت فعلی یا `None` | همراه `state` |
| `fsm_storage` | شیء ذخیره‌ساز FSM | همیشه |
| `handler` | شیء هندلر انتخاب‌شده (برای `get_flag`) | فقط در میدلور inner |
| `command` | `CommandObject` | با فیلتر `Command` |
| `callback_data` | شیء `CallbackData` | با `Class.filter()` |
| `magic_result` | نتیجه‌ی regex/شرط جادویی | با `F...regexp` |
| `exception` | خود استثنا | در هندلر `error` |
| *داده‌ی شما* | هر چه در `Dispatcher(...)` یا میدلور بگذارید | بسته به ثبت |

## تزریق داده‌ی خودتان

### ۱) از Dispatcher

```python
dp = Dispatcher(db=my_database, config=my_config, admin_ids={1, 2})

@dp.message(Command("stats"))
async def stats(message: Message, db, admin_ids):
    if message.from_user.id in admin_ids:
        await message.answer(str(await db.count_users()))
```

همچنین بعد از ساخت: `dp["db"] = my_database`.

### ۲) از start_polling

```python
await dp.start_polling(bot, version="1.0")      # آرگومان‌های اضافه = داده

@dp.message(Command("version"))
async def v(message: Message, version: str):
    await message.answer(version)
```

### ۳) از میدلور

```python
class UserMiddleware(BaseMiddleware):
    async def __call__(self, handler, event, data):
        data["user"] = await load_user(data["event_from_user"].id)
        return await handler(event, data)
```

### ۴) از فیلتر

فیلتر با برگرداندن `dict` داده اضافه می‌کند (مثل `command`). در درس [فیلتر کاستوم](/guide/custom-filters).

## آرگومان اول و نام `event`

- اولین آرگومان تابع، **رویداد** را می‌گیرد (به هر نامی: `message`، `m`، `query`).
- اگر نام اولین آرگومان خودش یکی از نام‌های داده باشد (مثلاً `bot`)، رویداد به آن داده **نمی‌شود**.
- آرگومانی با نام `event` **همیشه** رویداد را می‌گیرد (حتی اگر اول نباشد).

```python
@dp.message()
async def a(message): ...                  # رویداد = message
@dp.message()
async def b(bot, message): ...             # bot از داده؛ message ??? ← نمی‌رسد!
@dp.message()
async def c(bot, event): ...               # درست: event همیشه رویداد است
@dp.message()
async def d(message, bot): ...             # درست
```

::: warn تله‌ی ترتیب آرگومان‌ها
در مثال `b` چون اولین آرگومان `bot` نام داده است، رویداد به آن نمی‌رسد و `message` هم نامی نیست که در داده باشد؛ نتیجه خطای «missing argument» است. همیشه **رویداد را اول** بنویسید.
:::

## آرگومان پیش‌فرض و **kwargs

```python
@dp.message()
async def h(message: Message, db=None): ...    # اگر db نبود، None

@dp.message()
async def all_data(message: Message, **data):  # همه‌ی داده را بگیر
    print(sorted(data))
```

## کجا کار می‌کند؟

تزریق با همین قانون در **هندلر**، **فیلتر**، **فیلتر سطح Router**، **callbackهای on_startup/on_shutdown** و **هندلر خطا** فعال است.

```python
@dp.on_startup
async def started(bot: Bot, db):                 # همان داده‌ها
    await db.connect()
```

## مثال کامل: لایه‌ی کاربر

```python
class UserMiddleware(BaseMiddleware):
    def __init__(self, repo):
        self.repo = repo

    async def __call__(self, handler, event, data):
        tg_user = data.get("event_from_user")
        if tg_user:
            data["user"] = await self.repo.get_or_create(tg_user.id, tg_user.full_name)
        return await handler(event, data)


dp = Dispatcher(repo=UserRepository())
dp.message.outer_middleware(UserMiddleware(dp["repo"]))


@dp.message(Command("profile"))
async def profile(message: Message, user):
    await message.answer(f"👤 {user.name}\n⭐ امتیاز: {user.points}")
```

## خلاصه

- تزریق با **نام**، نه نوع.
- منابع: Dispatcher، start_polling، میدلور، فیلتر.
- رویداد را اولین آرگومان بنویسید یا از نام `event` استفاده کنید.
- بعدی: [ماشین حالت (FSM)](/guide/fsm).

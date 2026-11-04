---
title: پرسش‌های پرتکرار
lead: مشکلات رایج و راه‌حل‌شان؛ به‌علاوه‌ی راهنمای مهاجرت از aiogram.
---

## ربات جواب نمی‌دهد

::: steps
1. برنامه هنوز در حال اجراست؟ ترمینال را ببینید.
2. توکن درست است؟ (`401 Unauthorized` یعنی نه.)
3. اول `/start` را به ربات فرستاده‌اید؟
4. هندلرتان واقعاً مطابق است؟ [ترتیب هندلرها](/start/install) مهم است؛ یک هندلر عمومی قبل از بقیه همه چیز را می‌خورد.
5. لاگ را فعال کنید: `logging.basicConfig(level=logging.INFO)`.
:::

## چرا هندلر من اجرا نمی‌شود؟

- **ترتیب ثبت**: اولین هندلرِ مطابق برنده است. هندلر عمومی (`F.text`) را آخر بگذارید.
- **Router وصل نشده**: بعد از ساخت `Router` باید `dp.include_router(router)` را صدا بزنید.
- **فیلتر نادرست**: با `F.text == "..."` متن باید *دقیقاً* برابر باشد؛ از `.lower()` یا `.contains()` کمک بگیرید.
- **در حالت FSM هستید**: اگر هندلر `default_state` می‌خواهد ولی کاربر در یک حالت است، اجرا نمی‌شود (`/cancel` بزنید).
- **خطا در فیلتر**: یک خطا داخل فیلتر کل رویداد را متوقف می‌کند؛ لاگ را ببینید.

## خطای `403 permission_denied`

ربات اجازه‌ی نوشتن ندارد: کاربر بلاکش کرده، هنوز `/start` نزده، یا ربات در گروه محدود است. با `except BaleForbidden` بگیرید و آن کاربر را کنار بگذارید. ([خطاها](/guide/errors))

## خطای `429 Too Many Requests`

به سقف نرخ رسیده‌اید. balegram خودکار صبر می‌کند؛ اگر زیاد می‌بینید:
- `skip_updates=True` بگذارید (صف قدیمی را رد کند).
- `ThrottlingMiddleware` اضافه کنید.
- ارسال انبوه را با [Business API](/guide/business) انجام دهید.

## خطای `400 chat id is empty`

با نسخه‌های قدیمی کتابخانه روی `sendChatAction` رخ می‌داد (بله `chat_id` عددی را نمی‌پذیرفت). کتابخانه را به‌روز کنید:

```bash
pip install --upgrade --force-reinstall --no-deps git+https://github.com/rezamardani01/balegram.git
```

## خطای `400 message is not modified`

متن و کیبورد جدید با قبلی یکی است. بررسی کنید قبل از ویرایش چیزی عوض شده، یا بگیرید:

```python
from balegram.exceptions import BaleBadRequest
try:
    await message.edit_text(text, reply_markup=kb)
except BaleBadRequest:
    pass
```

## خطای `unsupported peer type`

متد مخصوص گروه (`getChatMember`، `getChatAdministrators`، `getChatMembersCount`) را روی چت خصوصی صدا زده‌اید. ابتدا نوع چت را چک کنید.

## `RuntimeError: ... is not bound to a Bot instance`

شیء `Message` بدون Bot ساخته شده (معمولاً در تست). `Update.model_validate(raw, context={"bot": bot})`. ([تست](/guide/testing))

## `TypeError: MagicFilter cannot be used as a boolean`

از `and`/`or`/`not` روی `F` استفاده کرده‌اید. به‌جایش `&` `|` `~` و پرانتز. ([F](/guide/magic-filter))

## دکمه همیشه در حال «بارگذاری» می‌ماند

به `callback_query` پاسخ نداده‌اید. `await query.answer()` را اضافه کنید یا `CallbackAnswerMiddleware` را فعال کنید.

## با Ctrl+C یک Traceback می‌بینم

رفتار عادی `asyncio.run` است. از `dp.run_polling(bot)` استفاده کنید یا `asyncio.run` را در `try/except KeyboardInterrupt` بگذارید. ([اجرا](/guide/running))

## وب‌هوک آپدیت نمی‌گیرد

- آدرس **HTTPS** و پورت **۴۴۳ یا ۸۸** است؟
- `set_webhook` موفق بود؟ (`get_webhook_info()` را ببینید)
- گواهی معتبر است (نه self-signed)؟
- مسیر در `register(app, PATH)` دقیقاً همان است که در `set_webhook` دادید؟

## شناسه‌ی عددی خودم را از کجا بگیرم؟

```python
@dp.message(Command("myid"))
async def myid(message: Message):
    await message.answer(str(message.from_user.id))
```

## چطور به کانال پیام بفرستم؟

ربات را ادمین کانال کنید و `chat_id` را `@username_channel` یا شناسه‌ی عددی (منفی) بدهید: `await bot.send_message("@my_channel", "سلام")`.

## چند ربات را با هم اجرا کنم؟

`await dp.start_polling(bot1, bot2)`؛ در هندلر با آرگومان `bot` می‌فهمید کدام ربات پیام گرفته. ([اجرا](/guide/running))

---

## مهاجرت از aiogram

اگر aiogram بلدید، تقریباً همه‌چیز آشناست:

| aiogram | balegram |
|---|---|
| `Dispatcher()`، `Router()` | همان |
| `@router.message(F.text)` | همان |
| `Command("start")`، `CommandStart()` | همان |
| `FSMContext`، `StatesGroup`، `State` | همان؛ از `balegram.fsm` |
| `CallbackData` با `prefix` | همان؛ از `balegram.filters` |
| `InlineKeyboardBuilder` | همان؛ از `balegram.utils`؛ با `style=` رنگی |
| `BaseMiddleware` | همان؛ `dp.update/message.outer_middleware` |
| `await bot.send_message(...)` | همان |
| `Bot(token, default=DefaultBotProperties(parse_mode=...))` | `Bot(token)`؛ بله `parse_mode` ندارد |
| `dp.start_polling(bot)` | همان + `skip_updates`، `run_polling` |
| `message.answer(...)` | همان |
| `allowed_updates` | وجود ندارد |
| وب‌هوک با `secret_token` | وجود ندارد؛ `secret_path()` |
| `aiogram.utils.keyboard`, `deep_linking` | `balegram.utils` (`create_start_link` ...) |

**تفاوت‌های مهم:** نام ماژول‌ها (`balegram.*`)، نبودن `parse_mode`، نبودن Scenes و i18n داخلی، و امکانات مخصوص بله (دکمه رنگی، Business API، `IsMember`).

## هنوز مشکل دارید؟

[یک Issue در گیت‌هاب](https://github.com/rezamardani01/balegram/issues) باز کنید و این‌ها را بنویسید: نسخه‌ی پایتون و balegram، کد کوتاه، و **متن کامل خطا**. توکن را هرگز ننویسید.

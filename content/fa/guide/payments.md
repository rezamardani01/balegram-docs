---
title: پرداخت
lead: دریافت پول با کیف پول بله: ارسال فاکتور، تایید پیش از پرداخت، تشخیص پرداخت موفق و استعلام تراکنش.
---

## نمای کلی

پرداخت در بله با **کیف پول الکترونیکی بله** انجام می‌شود (پرداخت کارت‌به‌کارت حذف شده است). مراحل:

::: steps
1. ربات یک **فاکتور** می‌فرستد (`send_invoice`) یا **لینک پرداخت** می‌سازد (`create_invoice_link`).
2. کاربر دکمه‌ی پرداخت را می‌زند. بله یک **`pre_checkout_query`** می‌فرستد.
3. ربات باید **ظرف ۱۰ ثانیه** آن را با `answer_pre_checkout_query` تایید کند (وگرنه پرداخت لغو می‌شود).
4. پس از پرداخت، پیامی با فیلد **`successful_payment`** می‌آید.
5. اگر لازم بود، با `inquire_transaction` وضعیت تراکنش را استعلام کنید.
:::

::: note مبلغ‌ها به ریال
`LabeledPrice.amount` به **ریال** است: `10000` یعنی ۱۰ هزار ریال (هزار تومان).
:::

## توکن تست

برای تست از توکن آزمایشی کیف پول استفاده کنید؛ هیچ پول واقعی جابه‌جا نمی‌شود:

```text
WALLET-TEST-1111111111111111
```

برای پرداخت واقعی، توکن ارائه‌دهنده را از پشتیبانی بله بگیرید.

## ارسال فاکتور

```python
from balegram.filters import Command
from balegram.types import LabeledPrice, Message

PROVIDER_TOKEN = "WALLET-TEST-1111111111111111"


@dp.message(Command("buy"))
async def buy(message: Message, bot: Bot):
    await bot.send_invoice(
        chat_id=message.chat.id,
        title="قهوه‌ی مجازی ☕",                       # ۱ تا ۳۲ نویسه
        description="یک فنجان قهوه‌ی آزمایشی",          # ۱ تا ۲۵۵ نویسه
        payload=f"coffee-{message.message_id}",         # ۱ تا ۱۲۸ بایت؛ برای شناسایی سفارش
        provider_token=PROVIDER_TOKEN,
        prices=[LabeledPrice(label="قهوه", amount=10000)],
        photo_url="https://example.com/coffee.jpg",     # اختیاری
    )
```

| پارامتر | قانون |
|---|---|
| `title` | ۱ تا ۳۲ نویسه |
| `description` | ۱ تا ۲۵۵ نویسه |
| `payload` | ۱ تا ۱۲۸ **بایت**؛ مخصوص خودتان (شناسه‌ی سفارش) |
| `provider_token` | توکن کیف پول |
| `prices` | لیست `LabeledPrice(label, amount)` به ریال |

## لینک پرداخت

برای مینی‌اپ یا اشتراک‌گذاری، به‌جای فاکتور داخل چت یک لینک بسازید:

```python
link = await bot.create_invoice_link(
    title="اشتراک ماهانه",
    description="دسترسی کامل ۳۰ روزه",
    payload="sub-30",
    provider_token=PROVIDER_TOKEN,
    prices=[LabeledPrice(label="اشتراک", amount=50000)],
)
await message.answer(f"برای پرداخت اینجا بزنید:\n{link}")
```

## تایید پیش از پرداخت (۱۰ ثانیه!)

```python
from balegram.types import PreCheckoutQuery


@dp.pre_checkout_query()
async def checkout(query: PreCheckoutQuery):
    # اینجا موجودی انبار، اعتبار سفارش و ... را چک کنید
    if query.invoice_payload.startswith("coffee-"):
        await query.answer(ok=True)
    else:
        await query.answer(ok=False, error_message="این سفارش دیگر معتبر نیست")
```

::: danger سریع جواب بدهید
اگر ظرف ۱۰ ثانیه پاسخ ندهید، پرداخت لغو می‌شود. کارهای کند را **قبل** از فاکتور انجام دهید، نه اینجا.
:::

`PreCheckoutQuery` این فیلدها را دارد: `id`، `from_user`، `currency` (`IRR`)، `total_amount`، `invoice_payload`.

## تشخیص پرداخت موفق

```python
@dp.message(F.successful_payment)
async def paid(message: Message):
    pay = message.successful_payment
    await message.answer(
        f"✅ پرداخت موفق\n"
        f"مبلغ: {pay.total_amount:,} {pay.currency}\n"
        f"سفارش: {pay.invoice_payload}\n"
        f"پیگیری: {pay.provider_payment_charge_id}"
    )
    # اینجا سفارش را «پرداخت‌شده» ثبت و کالا را تحویل بدهید
```

## استعلام تراکنش

```python
@dp.message(Command("tx"))
async def tx(message: Message, command: CommandObject, bot: Bot):
    t = await bot.inquire_transaction(command.args)
    await message.answer(f"وضعیت: {t.status}\nمبلغ: {t.amount}")
```

`Transaction` این فیلدها را دارد: `id`، `status` (یکی از `pending`، `paid`، `failed`، `rejected`)، `userID`، `amount`، `createdAt`.

## مثال کامل: فروشگاه ساده

```python
import asyncio
from balegram import Bot, Dispatcher, F
from balegram.filters import Command
from balegram.types import LabeledPrice, Message, PreCheckoutQuery

TOKEN = "YOUR_BOT_TOKEN"
PROVIDER_TOKEN = "WALLET-TEST-1111111111111111"

dp = Dispatcher()
ORDERS: dict[str, str] = {}           # payload -> وضعیت (در عمل: دیتابیس)


@dp.message(Command("buy"))
async def buy(message: Message, bot: Bot):
    payload = f"order-{message.message_id}"
    ORDERS[payload] = "pending"
    await bot.send_invoice(
        message.chat.id, "کتاب پایتون", "نسخه‌ی دیجیتال", payload, PROVIDER_TOKEN,
        [LabeledPrice(label="کتاب", amount=120000)],
    )


@dp.pre_checkout_query()
async def checkout(query: PreCheckoutQuery):
    ok = ORDERS.get(query.invoice_payload) == "pending"
    await query.answer(ok=ok, error_message=None if ok else "سفارش نامعتبر")


@dp.message(F.successful_payment)
async def paid(message: Message):
    ORDERS[message.successful_payment.invoice_payload] = "paid"
    await message.answer("🎉 پرداخت انجام شد! فایل کتاب به‌زودی ارسال می‌شود.")


asyncio.run(dp.start_polling(Bot(TOKEN), skip_updates=True))
```

## خلاصه

- `send_invoice` / `create_invoice_link` → `pre_checkout_query` (≤۱۰ ثانیه) → `successful_payment`.
- مبلغ به ریال؛ توکن تست `WALLET-TEST-1111111111111111`.
- همیشه `payload` را برای تطبیق سفارش بگذارید.
- بعدی: [Business API](/guide/business).

---
title: متدها: پرداخت
lead: فاکتور، لینک پرداخت، تایید پیش از پرداخت و استعلام تراکنش.
---

## فهرست متدها

| متد | نام در Bot API | کار |
|---|---|---|
| [`send_invoice`](/reference/methods-payments?s=send_invoice) | `sendInvoice` | یک فاکتور پرداخت (کیف پول بله) به چت می‌فرستد. |
| [`create_invoice_link`](/reference/methods-payments?s=create_invoice_link) | `createInvoiceLink` | به‌جای فاکتور داخل چت، یک لینک پرداخت می‌سازد (مناسب مینی‌اپ). |
| [`answer_pre_checkout_query`](/reference/methods-payments?s=answer_pre_checkout_query) | `answerPreCheckoutQuery` | پرداخت را پیش از انجام تایید یا رد می‌کند. |
| [`inquire_transaction`](/reference/methods-payments?s=inquire_transaction) | `inquireTransaction` | وضعیت یک تراکنش را استعلام می‌کند: `pending`، `paid`، `failed` یا `rejected`. |

::: method
## send_invoice {#send_invoice}
::: head sendInvoice | Message
:::
::: sig
await bot.send_invoice(chat_id, title, description, payload, provider_token, prices,
    photo_url=None, reply_to_message_id=None)
:::

یک فاکتور پرداخت (کیف پول بله) به چت می‌فرستد.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | شناسه‌ی چت (عدد) یا نام‌کاربری کانال به شکل `@name` |
| `title` | `str` | {req} | عنوان؛ ۱ تا ۳۲ نویسه |
| `description` | `str` | {req} | توضیح؛ ۱ تا ۲۵۵ نویسه |
| `payload` | `str` | {req} | رشته‌ی دلخواه شما (مثلاً شناسه‌ی سفارش)؛ ۱ تا ۱۲۸ بایت |
| `provider_token` | `str` | {req} | توکن کیف پول (برای تست `WALLET-TEST-1111111111111111`) |
| `prices` | `list[LabeledPrice]` | {req} | لیست `LabeledPrice(label, amount)`؛ مبلغ به ریال |
| `photo_url` | `str` | {opt} | عکس فاکتور |
| `reply_to_message_id` | `int` | {opt} | شناسه‌ی پیامی که این پیام روی آن ریپلای می‌شود |

**خروجی:** `Message`

#### مثال

```python
from baleropy.types import LabeledPrice

await bot.send_invoice(
    12345, "قهوه ☕", "یک فنجان قهوه", "order-1",
    "WALLET-TEST-1111111111111111", [LabeledPrice(label="قهوه", amount=10000)],
)
```

::: tip
ماجرای کامل پرداخت در درس [پرداخت](/guide/payments).
:::

:::

::: method
## create_invoice_link {#create_invoice_link}
::: head createInvoiceLink | str
:::
::: sig
await bot.create_invoice_link(title, description, payload, provider_token, prices)
:::

به‌جای فاکتور داخل چت، یک لینک پرداخت می‌سازد (مناسب مینی‌اپ).

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `title` | `str` | {req} | عنوان |
| `description` | `str` | {req} | توضیح |
| `payload` | `str` | {req} | رشته‌ی دلخواه شما (مثلاً شناسه‌ی سفارش)؛ ۱ تا ۱۲۸ بایت |
| `provider_token` | `str` | {req} | توکن کیف پول (برای تست `WALLET-TEST-1111111111111111`) |
| `prices` | `list[LabeledPrice]` | {req} | لیست `LabeledPrice(label, amount)`؛ مبلغ به ریال |

**خروجی:** `str`

#### مثال

```python
link = await bot.create_invoice_link("اشتراک", "30 روزه", "sub-30",
                                       "WALLET-TEST-1111111111111111", [LabeledPrice(label="اشتراک", amount=50000)])
```

:::

::: method
## answer_pre_checkout_query {#answer_pre_checkout_query}
::: head answerPreCheckoutQuery | bool
:::
::: sig
await bot.answer_pre_checkout_query(pre_checkout_query_id, ok, error_message=None)
:::

پرداخت را پیش از انجام تایید یا رد می‌کند. باید **ظرف ۱۰ ثانیه** صدا زده شود.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `pre_checkout_query_id` | `str` | {req} |  |
| `ok` | `bool` | {req} | `True` = ادامه‌ی پرداخت |
| `error_message` | `str` | {opt} | دلیل رد؛ وقتی `ok=False` الزامی است |

**خروجی:** `bool`

#### مثال

```python
@dp.pre_checkout_query()
async def checkout(query: PreCheckoutQuery):
    await query.answer(ok=True)
```

**میانبر:**

```python
await query.answer(ok, error_message=None)
```

:::

::: method
## inquire_transaction {#inquire_transaction}
::: head inquireTransaction | Transaction
:::
::: sig
await bot.inquire_transaction(transaction_id)
:::

وضعیت یک تراکنش را استعلام می‌کند: `pending`، `paid`، `failed` یا `rejected`.

#### پارامترها

| پارامتر | نوع | الزامی | توضیح |
|---|---|---|---|
| `transaction_id` | `str` | {req} |  |

**خروجی:** `Transaction`

#### مثال

```python
tx = await bot.inquire_transaction("tx-123")
print(tx.status, tx.amount)
```

:::

---
title: Payments
lead: Take money with the Bale wallet: send an invoice, confirm before payment, detect a successful payment and query a transaction.
---

## Overview

Payments in Bale use the **Bale e-wallet** (card-to-card payments were removed). The flow:

::: steps
1. The bot sends an **invoice** (`send_invoice`) or creates a **payment link** (`create_invoice_link`).
2. The user presses the pay button. Bale sends a **`pre_checkout_query`**.
3. The bot must confirm it **within 10 seconds** with `answer_pre_checkout_query` (otherwise the payment is cancelled).
4. After payment a message with the **`successful_payment`** field arrives.
5. If needed, query the transaction with `inquire_transaction`.
:::

::: note Amounts are in rial
`LabeledPrice.amount` is in **rial**: `10000` means 10,000 rial.
:::

## The test token

For tests use the wallet's test token; no real money moves:

```text
WALLET-TEST-1111111111111111
```

For real payments get the provider token from Bale support.

## Sending an invoice

```python
from balegram.filters import Command
from balegram.types import LabeledPrice, Message

PROVIDER_TOKEN = "WALLET-TEST-1111111111111111"


@dp.message(Command("buy"))
async def buy(message: Message, bot: Bot):
    await bot.send_invoice(
        chat_id=message.chat.id,
        title="Virtual coffee ☕",                      # 1 to 32 characters
        description="A cup of test coffee",              # 1 to 255 characters
        payload=f"coffee-{message.message_id}",          # 1 to 128 bytes; to identify the order
        provider_token=PROVIDER_TOKEN,
        prices=[LabeledPrice(label="Coffee", amount=10000)],
        photo_url="https://example.com/coffee.jpg",      # optional
    )
```

| Parameter | Rule |
|---|---|
| `title` | 1 to 32 characters |
| `description` | 1 to 255 characters |
| `payload` | 1 to 128 **bytes**; yours (an order id) |
| `provider_token` | the wallet token |
| `prices` | a list of `LabeledPrice(label, amount)` in rial |

## A payment link

For a mini app or sharing, create a link instead of an in-chat invoice:

```python
link = await bot.create_invoice_link(
    title="Monthly subscription",
    description="Full access for 30 days",
    payload="sub-30",
    provider_token=PROVIDER_TOKEN,
    prices=[LabeledPrice(label="Subscription", amount=50000)],
)
await message.answer(f"Pay here:\n{link}")
```

## Pre-checkout confirmation (10 seconds!)

```python
from balegram.types import PreCheckoutQuery


@dp.pre_checkout_query()
async def checkout(query: PreCheckoutQuery):
    # check stock, order validity and so on here
    if query.invoice_payload.startswith("coffee-"):
        await query.answer(ok=True)
    else:
        await query.answer(ok=False, error_message="This order is no longer valid")
```

::: danger Answer fast
If you do not answer within 10 seconds the payment is cancelled. Do slow work **before** the invoice, not here.
:::

`PreCheckoutQuery` has these fields: `id`, `from_user`, `currency` (`IRR`), `total_amount`, `invoice_payload`.

## Detecting a successful payment

```python
@dp.message(F.successful_payment)
async def paid(message: Message):
    pay = message.successful_payment
    await message.answer(
        f"✅ Payment successful\n"
        f"Amount: {pay.total_amount:,} {pay.currency}\n"
        f"Order: {pay.invoice_payload}\n"
        f"Reference: {pay.provider_payment_charge_id}"
    )
    # mark the order as paid and deliver the goods here
```

## Querying a transaction

```python
@dp.message(Command("tx"))
async def tx(message: Message, command: CommandObject, bot: Bot):
    t = await bot.inquire_transaction(command.args)
    await message.answer(f"Status: {t.status}\nAmount: {t.amount}")
```

`Transaction` has these fields: `id`, `status` (one of `pending`, `paid`, `failed`, `rejected`), `userID`, `amount`, `createdAt`.

## Full example: a simple shop

```python
import asyncio
from balegram import Bot, Dispatcher, F
from balegram.filters import Command
from balegram.types import LabeledPrice, Message, PreCheckoutQuery

TOKEN = "YOUR_BOT_TOKEN"
PROVIDER_TOKEN = "WALLET-TEST-1111111111111111"

dp = Dispatcher()
ORDERS: dict[str, str] = {}           # payload -> status (use a database in practice)


@dp.message(Command("buy"))
async def buy(message: Message, bot: Bot):
    payload = f"order-{message.message_id}"
    ORDERS[payload] = "pending"
    await bot.send_invoice(
        message.chat.id, "Python book", "Digital edition", payload, PROVIDER_TOKEN,
        [LabeledPrice(label="Book", amount=120000)],
    )


@dp.pre_checkout_query()
async def checkout(query: PreCheckoutQuery):
    ok = ORDERS.get(query.invoice_payload) == "pending"
    await query.answer(ok=ok, error_message=None if ok else "Invalid order")


@dp.message(F.successful_payment)
async def paid(message: Message):
    ORDERS[message.successful_payment.invoice_payload] = "paid"
    await message.answer("🎉 Payment done! The book file will be sent shortly.")


asyncio.run(dp.start_polling(Bot(TOKEN), skip_updates=True))
```

## Summary

- `send_invoice` / `create_invoice_link` → `pre_checkout_query` (≤10 s) → `successful_payment`.
- Amounts in rial; test token `WALLET-TEST-1111111111111111`.
- Always set a `payload` to match the order.
- Next: [Business API](/guide/business).

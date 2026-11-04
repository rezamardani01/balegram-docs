---
title: Methods: payments
lead: Invoices, payment links, pre-checkout confirmation and transaction queries.
---

## Methods at a glance

| Method | Bot API name | What it does |
|---|---|---|
| [`send_invoice`](/reference/methods-payments?s=send_invoice) | `sendInvoice` | Sends a payment invoice (Bale wallet) to the chat. |
| [`create_invoice_link`](/reference/methods-payments?s=create_invoice_link) | `createInvoiceLink` | Creates a payment link instead of an in-chat invoice (good for mini apps). |
| [`answer_pre_checkout_query`](/reference/methods-payments?s=answer_pre_checkout_query) | `answerPreCheckoutQuery` | Confirms or rejects a payment before it happens. |
| [`inquire_transaction`](/reference/methods-payments?s=inquire_transaction) | `inquireTransaction` | Queries a transaction's status: `pending`, `paid`, `failed` or `rejected`. |

::: method
## send_invoice {#send_invoice}
::: head sendInvoice | Message
:::
::: sig
await bot.send_invoice(chat_id, title, description, payload, provider_token, prices,
    photo_url=None, reply_to_message_id=None)
:::

Sends a payment invoice (Bale wallet) to the chat.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `chat_id` | `int \| str` | {req} | Chat id (number) or a channel username like `@name` |
| `title` | `str` | {req} | Title; 1 to 32 characters |
| `description` | `str` | {req} | Description; 1 to 255 characters |
| `payload` | `str` | {req} | Your own string (e.g. an order id); 1 to 128 bytes |
| `provider_token` | `str` | {req} | The wallet token (for tests `WALLET-TEST-1111111111111111`) |
| `prices` | `list[LabeledPrice]` | {req} | A list of `LabeledPrice(label, amount)`; amount in rial |
| `photo_url` | `str` | {opt} | An invoice photo |
| `reply_to_message_id` | `int` | {opt} | Id of the message this one replies to |

**Returns:** `Message`

#### Example

```python
from balegram.types import LabeledPrice

await bot.send_invoice(
    12345, "Coffee ☕", "A cup of coffee", "order-1",
    "WALLET-TEST-1111111111111111", [LabeledPrice(label="Coffee", amount=10000)],
)
```

::: tip
The full payment story is in the [Payments](/guide/payments) lesson.
:::

:::

::: method
## create_invoice_link {#create_invoice_link}
::: head createInvoiceLink | str
:::
::: sig
await bot.create_invoice_link(title, description, payload, provider_token, prices)
:::

Creates a payment link instead of an in-chat invoice (good for mini apps).

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `title` | `str` | {req} | Title |
| `description` | `str` | {req} | Description |
| `payload` | `str` | {req} | Your own string (e.g. an order id); 1 to 128 bytes |
| `provider_token` | `str` | {req} | The wallet token (for tests `WALLET-TEST-1111111111111111`) |
| `prices` | `list[LabeledPrice]` | {req} | A list of `LabeledPrice(label, amount)`; amount in rial |

**Returns:** `str`

#### Example

```python
link = await bot.create_invoice_link("Subscription", "30 days", "sub-30",
                                       "WALLET-TEST-1111111111111111", [LabeledPrice(label="Plan", amount=50000)])
```

:::

::: method
## answer_pre_checkout_query {#answer_pre_checkout_query}
::: head answerPreCheckoutQuery | bool
:::
::: sig
await bot.answer_pre_checkout_query(pre_checkout_query_id, ok, error_message=None)
:::

Confirms or rejects a payment before it happens. It must be called **within 10 seconds**.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pre_checkout_query_id` | `str` | {req} |  |
| `ok` | `bool` | {req} | `True` = continue the payment |
| `error_message` | `str` | {opt} | The reason for rejection; required when `ok=False` |

**Returns:** `bool`

#### Example

```python
@dp.pre_checkout_query()
async def checkout(query: PreCheckoutQuery):
    await query.answer(ok=True)
```

**Shortcut:**

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

Queries a transaction's status: `pending`, `paid`, `failed` or `rejected`.

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `transaction_id` | `str` | {req} |  |

**Returns:** `Transaction`

#### Example

```python
tx = await bot.inquire_transaction("tx-123")
print(tx.status, tx.amount)
```

:::

---
title: Shop bot
lead: A product catalog, a cart with the FSM, a Bale wallet invoice and delivery after payment; the full path of a shop.
---

## What are we building?

::: steps
1. `/shop` shows the catalog with buttons.
2. The user adds products to the **cart** (in FSM data).
3. `🧾 Pay` sends an **invoice**.
4. Bale sends a `pre_checkout_query`; we check stock and confirm.
5. On `successful_payment` we record the order and deliver the goods.
:::

Concepts: [Payments](/guide/payments), [FSM](/guide/fsm), [CallbackData](/guide/callback-data).

::: note Test mode
The code works with the test token `WALLET-TEST-1111111111111111`; no real money moves.
:::

## The full code

```python title="shop_bot.py"
import asyncio
import uuid

from baleropy import Bot, Dispatcher, F
from baleropy.filters import CallbackData, Command
from baleropy.fsm import FSMContext
from baleropy.types import CallbackQuery, LabeledPrice, Message, PreCheckoutQuery
from baleropy.utils import InlineKeyboardBuilder

TOKEN = "YOUR_BOT_TOKEN"
PROVIDER_TOKEN = "WALLET-TEST-1111111111111111"

PRODUCTS = {
    1: ("☕ Coffee", 50_000),
    2: ("🍰 Cake", 80_000),
    3: ("🥤 Drink", 30_000),
}                                                   # id -> (name, price in rial)

ORDERS: dict[str, dict] = {}                        # order id -> info (use a database in practice)

dp = Dispatcher()


class ProductCb(CallbackData, prefix="prod"):
    id: int


class CartCb(CallbackData, prefix="cart"):
    action: str                                     # "pay" | "clear"


def money(rial: int) -> str:
    return f"{rial:,} rial"


def catalog_markup(cart: dict[int, int]):
    kb = InlineKeyboardBuilder()
    for pid, (name, price) in PRODUCTS.items():
        count = cart.get(pid, 0)
        label = f"{name} — {money(price)}" + (f"  ×{count}" if count else "")
        kb.button(text=label, callback_data=ProductCb(id=pid))
    kb.adjust(1)
    if cart:
        kb.button(text="🧾 Pay", callback_data=CartCb(action="pay"), style="success")
        kb.button(text="🗑 Empty the cart", callback_data=CartCb(action="clear"), style="danger")
        kb.adjust(1, 1, 1, 2)
    return kb.as_markup()


def cart_total(cart: dict[int, int]) -> int:
    return sum(PRODUCTS[pid][1] * n for pid, n in cart.items())


@dp.message(Command("shop"))
async def shop(message: Message, state: FSMContext):
    await state.update_data(cart={})
    await message.answer("🛍 Shop — choose a product:", reply_markup=catalog_markup({}))


@dp.callback_query(ProductCb.filter())
async def add_to_cart(query: CallbackQuery, callback_data: ProductCb, state: FSMContext):
    data = await state.get_data()
    cart = {int(k): v for k, v in data.get("cart", {}).items()}      # JSON turns keys into strings
    cart[callback_data.id] = cart.get(callback_data.id, 0) + 1
    await state.update_data(cart=cart)
    await query.message.edit_text(
        f"🛒 Cart: {money(cart_total(cart))}", reply_markup=catalog_markup(cart)
    )
    await query.answer("Added ✅")


@dp.callback_query(CartCb.filter(F.action == "clear"))
async def clear_cart(query: CallbackQuery, state: FSMContext):
    await state.update_data(cart={})
    await query.message.edit_text("The cart is empty.", reply_markup=catalog_markup({}))
    await query.answer()


@dp.callback_query(CartCb.filter(F.action == "pay"))
async def pay(query: CallbackQuery, state: FSMContext, bot: Bot):
    data = await state.get_data()
    cart = {int(k): v for k, v in data.get("cart", {}).items()}
    if not cart:
        await query.answer("The cart is empty!", show_alert=True)
        return

    order_id = uuid.uuid4().hex[:12]
    ORDERS[order_id] = {"user": query.from_user.id, "cart": cart, "status": "pending"}
    prices = [LabeledPrice(label=f"{PRODUCTS[pid][0]} ×{n}", amount=PRODUCTS[pid][1] * n) for pid, n in cart.items()]

    await bot.send_invoice(
        query.message.chat.id,
        title="Shop order",
        description=f"{len(cart)} kinds of products",
        payload=order_id,                           # to identify the order in later steps
        provider_token=PROVIDER_TOKEN,
        prices=prices,
    )
    await query.answer()


@dp.pre_checkout_query()
async def checkout(query: PreCheckoutQuery):
    order = ORDERS.get(query.invoice_payload)
    ok = order is not None and order["status"] == "pending"
    await query.answer(ok=ok, error_message=None if ok else "This order is not valid")


@dp.message(F.successful_payment)
async def paid(message: Message, state: FSMContext):
    payment = message.successful_payment
    order = ORDERS.get(payment.invoice_payload)
    if order:
        order["status"] = "paid"
    await state.update_data(cart={})
    await message.answer(
        f"🎉 Payment successful!\nAmount: {money(payment.total_amount)}\n"
        f"Reference: {payment.provider_payment_charge_id}\n\nYour order is being prepared."
    )


if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## Important notes

::: warn JSON keys become strings
With `RedisStorage`, numeric dict keys (`{1: 2}`) become strings (`{"1": 2}`) when stored. That is why we read with `int(k)`; it is harmless with `MemoryStorage` too.
:::

::: danger Take prices from the server
Never put the price into `callback_data` (the user could tamper with it). Send only the **product id** and read the price from `PRODUCTS` — as done here.
:::

::: tip 10 seconds to confirm
In `pre_checkout_query` do only quick checks. Do slow work (reserving stock) when building the invoice.
:::

## Ideas to extend it

- Stock counts decreasing after payment.
- A "remove one" button for each product.
- Send a digital file after payment with [`send_document`](/reference/methods-media).
- Order history with `/orders`.

Next: [Mandatory membership](/cookbook/mandatory-membership).

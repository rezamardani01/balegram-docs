---
title: ربات فروشگاه
lead: کاتالوگ محصولات، سبد خرید با FSM، فاکتور کیف پول بله و تحویل پس از پرداخت؛ مسیر کامل یک فروشگاه.
---

## چه می‌سازیم؟

::: steps
1. `/shop` کاتالوگ را با دکمه نشان می‌دهد.
2. کاربر محصول را به **سبد** اضافه می‌کند (در داده‌ی FSM).
3. `🧾 پرداخت` یک **فاکتور** می‌فرستد.
4. بله `pre_checkout_query` می‌فرستد؛ ما موجودی را چک و تایید می‌کنیم.
5. با `successful_payment` سفارش را ثبت و کالا را تحویل می‌دهیم.
:::

مفاهیم: [پرداخت](/guide/payments)، [FSM](/guide/fsm)، [CallbackData](/guide/callback-data).

::: note حالت تست
کد با توکن آزمایشی `WALLET-TEST-1111111111111111` کار می‌کند و پول واقعی جابه‌جا نمی‌شود.
:::

## کد کامل

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
    1: ("☕ قهوه", 50_000),
    2: ("🍰 کیک", 80_000),
    3: ("🥤 نوشیدنی", 30_000),
}                                                   # شناسه -> (نام، قیمت به ریال)

ORDERS: dict[str, dict] = {}                        # شناسه‌ی سفارش -> اطلاعات (در عمل: دیتابیس)

dp = Dispatcher()


class ProductCb(CallbackData, prefix="prod"):
    id: int


class CartCb(CallbackData, prefix="cart"):
    action: str                                     # "pay" | "clear"


def money(rial: int) -> str:
    return f"{rial:,} ریال"


def catalog_markup(cart: dict[int, int]):
    kb = InlineKeyboardBuilder()
    for pid, (name, price) in PRODUCTS.items():
        count = cart.get(pid, 0)
        label = f"{name} — {money(price)}" + (f"  ×{count}" if count else "")
        kb.button(text=label, callback_data=ProductCb(id=pid))
    kb.adjust(1)
    if cart:
        kb.button(text="🧾 پرداخت", callback_data=CartCb(action="pay"), style="success")
        kb.button(text="🗑 خالی کردن سبد", callback_data=CartCb(action="clear"), style="danger")
        kb.adjust(1, 1, 1, 2)
    return kb.as_markup()


def cart_total(cart: dict[int, int]) -> int:
    return sum(PRODUCTS[pid][1] * n for pid, n in cart.items())


@dp.message(Command("shop"))
async def shop(message: Message, state: FSMContext):
    await state.update_data(cart={})
    await message.answer("🛍 فروشگاه — محصول مورد نظر را انتخاب کنید:", reply_markup=catalog_markup({}))


@dp.callback_query(ProductCb.filter())
async def add_to_cart(query: CallbackQuery, callback_data: ProductCb, state: FSMContext):
    data = await state.get_data()
    cart = {int(k): v for k, v in data.get("cart", {}).items()}      # JSON کلیدها را رشته می‌کند
    cart[callback_data.id] = cart.get(callback_data.id, 0) + 1
    await state.update_data(cart=cart)
    await query.message.edit_text(
        f"🛒 سبد: {money(cart_total(cart))}", reply_markup=catalog_markup(cart)
    )
    await query.answer("اضافه شد ✅")


@dp.callback_query(CartCb.filter(F.action == "clear"))
async def clear_cart(query: CallbackQuery, state: FSMContext):
    await state.update_data(cart={})
    await query.message.edit_text("سبد خالی شد.", reply_markup=catalog_markup({}))
    await query.answer()


@dp.callback_query(CartCb.filter(F.action == "pay"))
async def pay(query: CallbackQuery, state: FSMContext, bot: Bot):
    data = await state.get_data()
    cart = {int(k): v for k, v in data.get("cart", {}).items()}
    if not cart:
        await query.answer("سبد خالی است!", show_alert=True)
        return

    order_id = uuid.uuid4().hex[:12]
    ORDERS[order_id] = {"user": query.from_user.id, "cart": cart, "status": "pending"}
    prices = [LabeledPrice(label=f"{PRODUCTS[pid][0]} ×{n}", amount=PRODUCTS[pid][1] * n) for pid, n in cart.items()]

    await bot.send_invoice(
        query.message.chat.id,
        title="سفارش فروشگاه",
        description=f"{len(cart)} نوع محصول",
        payload=order_id,                           # برای شناسایی سفارش در مراحل بعد
        provider_token=PROVIDER_TOKEN,
        prices=prices,
    )
    await query.answer()


@dp.pre_checkout_query()
async def checkout(query: PreCheckoutQuery):
    order = ORDERS.get(query.invoice_payload)
    ok = order is not None and order["status"] == "pending"
    await query.answer(ok=ok, error_message=None if ok else "این سفارش معتبر نیست")


@dp.message(F.successful_payment)
async def paid(message: Message, state: FSMContext):
    payment = message.successful_payment
    order = ORDERS.get(payment.invoice_payload)
    if order:
        order["status"] = "paid"
    await state.update_data(cart={})
    await message.answer(
        f"🎉 پرداخت موفق!\nمبلغ: {money(payment.total_amount)}\n"
        f"کد پیگیری: {payment.provider_payment_charge_id}\n\nسفارش شما در حال آماده‌سازی است."
    )


if __name__ == "__main__":
    dp.run_polling(Bot(TOKEN), skip_updates=True)
```

## نکات مهم

::: warn کلیدهای JSON رشته می‌شوند
اگر از `RedisStorage` استفاده کنید، کلیدهای عددی دیکشنری (`{1: 2}`) هنگام ذخیره به رشته (`{"1": 2}`) تبدیل می‌شوند. به همین دلیل هنگام خواندن `int(k)` گذاشتیم؛ با `MemoryStorage` هم بی‌ضرر است.
:::

::: danger قیمت را از سرور بگیرید
هرگز قیمت را داخل `callback_data` نگذارید (کاربر می‌تواند دستکاری کند). فقط **شناسه‌ی محصول** بفرستید و قیمت را از `PRODUCTS` بخوانید — همان‌طور که اینجا شده.
:::

::: tip ۱۰ ثانیه برای تایید
در `pre_checkout_query` فقط چک‌های سریع انجام دهید. کارهای کند (رزرو انبار) را موقع ساخت فاکتور انجام دهید.
:::

## ایده‌های توسعه

- تعداد موجودی و کاهش آن بعد از پرداخت.
- دکمه‌ی «حذف یک عدد» برای هر محصول.
- ارسال فایل دیجیتال بعد از پرداخت با [`send_document`](/reference/methods-media).
- تاریخچه‌ی سفارش‌ها با `/orders`.

بعدی: [عضویت اجباری](/cookbook/mandatory-membership).

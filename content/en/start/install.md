---
title: Install & first bot
lead: In this lesson we install baleropy, get a token and run your first bot in under 5 minutes.
---

## Requirements

- **Python 3.10 or newer** (check with `python --version`).
- An account in the **Bale** messenger.

## 1. Install

Create a virtual environment for each project to keep its dependencies separate:

```bash
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Linux / macOS
source .venv/bin/activate
```

Then install baleropy:

```bash
pip install baleropy
```

::: note The package name vs the import name
The package on PyPI is called **`baleropy`**, but in your code you write `import baleropy` (and `from baleropy import Bot`).
:::

::: tip Install with Redis
To keep the FSM state in Redis, install the redis extra as well:

```bash
pip install "baleropy[redis]"
```
:::

Check the installation:

```python
import baleropy
print(baleropy.__version__)
```

## 2. Get a bot token

::: steps
1. Open a chat with **@botfather** ([ble.ir/botfather](https://ble.ir/botfather)) in Bale.
2. Send the command to create a new bot and choose a name and a username.
3. BotFather gives you a **token** like `123456789:AbCdEf...`. Copy it.
:::

::: danger Keep the token secret
Anyone who has the token can control your bot. Never publish it on GitHub or in public groups. If it leaks, get a new one from BotFather.
:::

## 3. Your first bot

Create a file named `bot.py`:

```python title="bot.py"
import asyncio

from baleropy import Bot, Dispatcher, F
from baleropy.filters import CommandStart
from baleropy.types import Message

# Get a token from @botfather and paste it here
TOKEN = "YOUR_BOT_TOKEN"

dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message):
    name = message.from_user.full_name if message.from_user else "friend"
    await message.answer(f"Hello {name}! 👋")


@dp.message(F.text)
async def echo(message: Message):
    await message.reply(message.text)


async def main():
    bot = Bot(TOKEN)
    await dp.start_polling(bot, skip_updates=True)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass  # Ctrl+C stops the bot without a traceback
```

Run it:

```bash
python bot.py
```

Now send `/start` to your bot in Bale and you get a greeting. Send any other text and it echoes it back.

## The code, line by line

| Part | Explanation |
|---|---|
| `Dispatcher()` | The command center; receives messages and routes them to the right handler. |
| `@dp.message(...)` | Registers a **handler** for messages. The arguments are **filters**. |
| `CommandStart()` | True only when the message is `/start`. |
| `F.text` | True only when the message has text (the magic filter). |
| `message.answer(...)` | Sends a new message to the same chat. |
| `message.reply(...)` | Like answer, but replies to the user's message. |
| `start_polling(bot)` | Continuously fetches updates from Bale and processes them. |
| `skip_updates=True` | Skips old messages that arrived while the bot was offline. |

::: note Handler order matters
Handlers are checked in registration order and **the first one whose filters pass** runs. Because `/start` is also text, the `start` handler must come *before* `echo`; otherwise `echo` swallows it.
:::

## If it does not work

- `ModuleNotFoundError: baleropy` ← install into the same Python you run with (`python -m pip install ...`).
- `Token has an invalid format` ← the token must look like `number:text`, with no spaces or extra quotes.
- `401 Unauthorized` ← the token is wrong or revoked.
- The bot does not answer ← send `/start` first and make sure the program is still running.

More in the [FAQ](/more/faq).

## Next step

Your bot runs; now let's understand **how it works**: [Concepts & architecture](/start/concepts).

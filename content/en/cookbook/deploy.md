---
title: Deploying
lead: Run the bot 24/7 on a Linux server: a virtual environment, systemd, Docker and security tips.
---

## Before deploying

::: steps
1. Keep the token **outside the code** (an environment variable or a `.env` file). In tutorial examples it was inside the code for simplicity, but do not do that on a server/GitHub.
2. Enable `skip_updates=True` and [logging](/guide/errors).
3. Move the FSM storage from `MemoryStorage` to `RedisStorage` (so states survive restarts).
4. Decide: [polling or webhook](/guide/running).
:::

## Reading the token from the environment

```python title="config.py"
import os

TOKEN = os.environ["BALE_TOKEN"]                      # a clear KeyError if missing
ADMINS = {int(x) for x in os.environ.get("ADMINS", "").split(",") if x}
```

```python title="bot.py"
from config import TOKEN
dp.run_polling(Bot(TOKEN), skip_updates=True)
```

::: danger Do not commit the .env file
Write `.env` in `.gitignore`, and keep a `.env.example` without real values in the repository.
:::

## Approach 1: virtual environment + systemd

```bash
sudo apt update && sudo apt install -y python3-venv git
git clone https://github.com/you/my-bot.git /opt/my-bot
cd /opt/my-bot
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

Create a service file:

```ini title="/etc/systemd/system/my-bot.service"
[Unit]
Description=My Bale bot
After=network-online.target
Wants=network-online.target

[Service]
WorkingDirectory=/opt/my-bot
EnvironmentFile=/opt/my-bot/.env
ExecStart=/opt/my-bot/.venv/bin/python bot.py
Restart=always
RestartSec=5
User=botuser

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now my-bot
sudo systemctl status my-bot
journalctl -u my-bot -f            # live log
```

`Restart=always` means that if the bot crashes it comes back 5 seconds later.

## Approach 2: Docker

```dockerfile title="Dockerfile"
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "bot.py"]
```

```yaml title="docker-compose.yml"
services:
  bot:
    build: .
    restart: unless-stopped
    env_file: .env
    depends_on: [redis]
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
volumes:
  redis-data:
```

```bash
docker compose up -d --build
docker compose logs -f bot
```

And in code: `RedisStorage.from_url("redis://redis:6379/0")`.

## The requirements.txt file

```text
balegram-api
redis>=5
```

For reproducibility pin a specific **version**: `balegram-api==0.2.0`.

## Webhook behind nginx

If you want a webhook, see the [running lesson](/guide/running); in short: a domain + HTTPS (port 443 or 88) + a secret path + `setup_application`.

## Production checklist

| Item | Status |
|---|---|
| token in an environment variable | ☐ |
| `skip_updates=True` | ☐ |
| logs to a file/journal | ☐ |
| `Restart=always` or `restart: unless-stopped` | ☐ |
| FSM on Redis | ☐ |
| a global error handler | ☐ |
| rate limiting (`ThrottlingMiddleware`) | ☐ |
| database backups | ☐ |

## Simple monitoring

```python
@dp.on_startup
async def notify_admin(bot: Bot):
    for admin in ADMINS:
        await bot.send_message(admin, "✅ The bot is up")

@dp.error()
async def report(event: ErrorEvent, exception: Exception, bot: Bot):
    for admin in ADMINS:
        await bot.send_message(admin, f"🚨 Error: {type(exception).__name__}: {exception}")
    return True
```

Back to the [cookbook list](/cookbook/quiz-bot).

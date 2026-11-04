---
title: استقرار روی سرور
lead: ربات را ۲۴ ساعته روی یک سرور لینوکسی اجرا کنید: محیط مجازی، systemd، Docker و نکات امنیتی.
---

## قبل از استقرار

::: steps
1. توکن را **بیرون از کد** نگه دارید (متغیر محیطی یا فایل `.env`). در مثال‌های آموزشی برای سادگی داخل کد بود، ولی روی سرور/گیت‌هاب این کار را نکنید.
2. `skip_updates=True` و [Logging](/guide/errors) را فعال کنید.
3. ذخیره‌ساز FSM را از `MemoryStorage` به `RedisStorage` ببرید (تا با ری‌استارت حالت‌ها نپرند).
4. تصمیم بگیرید: [Polling یا Webhook](/guide/running).
:::

## خواندن توکن از محیط

```python title="config.py"
import os

TOKEN = os.environ["BALE_TOKEN"]                      # اگر نبود، KeyError واضح
ADMINS = {int(x) for x in os.environ.get("ADMINS", "").split(",") if x}
```

```python title="bot.py"
from config import TOKEN
dp.run_polling(Bot(TOKEN), skip_updates=True)
```

::: danger فایل .env را کامیت نکنید
در `.gitignore` بنویسید: `.env`. و یک `.env.example` بدون مقدار واقعی در مخزن بگذارید.
:::

## روش ۱: محیط مجازی + systemd

```bash
sudo apt update && sudo apt install -y python3-venv git
git clone https://github.com/you/my-bot.git /opt/my-bot
cd /opt/my-bot
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

یک فایل سرویس بسازید:

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
journalctl -u my-bot -f            # دیدن لاگ زنده
```

`Restart=always` یعنی اگر ربات کرش کرد، ۵ ثانیه بعد خودکار بالا می‌آید.

## روش ۲: Docker

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

و در کد: `RedisStorage.from_url("redis://redis:6379/0")`.

## فایل requirements.txt

```text
baleropy
redis>=5
```

برای تکرارپذیری، یک **نسخه‌ی مشخص** پین کنید: `baleropy==0.2.0`.

## Webhook پشت nginx

اگر وب‌هوک می‌خواهید، به [درس اجرا](/guide/running) بروید؛ خلاصه: دامنه + HTTPS (پورت ۴۴۳ یا ۸۸) + مسیر مخفی + `setup_application`.

## چک‌لیست تولید

| مورد | وضعیت |
|---|---|
| توکن در متغیر محیطی | ☐ |
| `skip_updates=True` | ☐ |
| لاگ به فایل/journal | ☐ |
| `Restart=always` یا `restart: unless-stopped` | ☐ |
| FSM روی Redis | ☐ |
| هندلر خطای سراسری | ☐ |
| محدودیت نرخ (`ThrottlingMiddleware`) | ☐ |
| بکاپ دیتابیس | ☐ |

## مانیتورینگ ساده

```python
@dp.on_startup
async def notify_admin(bot: Bot):
    for admin in ADMINS:
        await bot.send_message(admin, "✅ ربات روشن شد")

@dp.error()
async def report(event: ErrorEvent, exception: Exception, bot: Bot):
    for admin in ADMINS:
        await bot.send_message(admin, f"🚨 خطا: {type(exception).__name__}: {exception}")
    return True
```

برگشت به [فهرست دستور پخت](/cookbook/quiz-bot).

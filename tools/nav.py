"""Navigation tree of the site: group -> pages. Titles are (fa, en)."""

NAV = [
    {
        "id": "start", "icon": "🚀", "title": ("شروع کنید", "Getting started"),
        "items": [
            ("start/intro", "معرفی", "Introduction"),
            ("start/install", "نصب و اولین ربات", "Install & first bot"),
            ("start/concepts", "مفاهیم و معماری", "Concepts & architecture"),
        ],
    },
    {
        "id": "guide", "icon": "📘", "title": ("آموزش درس‌به‌درس", "Step-by-step guide"),
        "items": [
            ("guide/handlers", "هندلرها و رویدادها", "Handlers & events"),
            ("guide/routers", "روترها", "Routers"),
            ("guide/filters", "فیلترها", "Filters"),
            ("guide/magic-filter", "فیلتر جادویی F", "The magic F filter"),
            ("guide/custom-filters", "فیلتر کاستوم", "Custom filters"),
            ("guide/middlewares", "میدلورها", "Middlewares"),
            ("guide/dependency-injection", "تزریق وابستگی", "Dependency injection"),
            ("guide/fsm", "ماشین حالت (FSM)", "State machine (FSM)"),
            ("guide/keyboards", "کیبورد و دکمه رنگی", "Keyboards & colored buttons"),
            ("guide/callback-data", "CallbackData", "CallbackData"),
            ("guide/files", "ارسال و دریافت فایل", "Sending & receiving files"),
            ("guide/running", "اجرا: Polling و Webhook", "Running: polling & webhook"),
            ("guide/errors", "خطاها و محدودیت نرخ", "Errors & rate limits"),
            ("guide/payments", "پرداخت", "Payments"),
            ("guide/business", "Business API", "Business API"),
            ("guide/utils", "ابزارهای کمکی", "Helper utilities"),
            ("guide/testing", "تست کردن ربات", "Testing your bot"),
        ],
    },
    {
        "id": "reference", "icon": "📚", "title": ("مرجع", "Reference"),
        "items": [
            ("reference/methods-messages", "متدها: ارسال پیام", "Methods: sending"),
            ("reference/methods-media", "متدها: رسانه", "Methods: media"),
            ("reference/methods-editing", "متدها: ویرایش و حذف", "Methods: editing"),
            ("reference/methods-chats", "متدها: چت و گروه", "Methods: chats & groups"),
            ("reference/methods-files-stickers", "متدها: فایل و استیکر", "Methods: files & stickers"),
            ("reference/methods-payments", "متدها: پرداخت", "Methods: payments"),
            ("reference/methods-updates", "متدها: آپدیت و ربات", "Methods: updates & bot"),
            ("reference/types", "تایپ‌ها", "Types"),
            ("reference/shortcuts", "میانبرهای Message", "Message shortcuts"),
            ("reference/filters-ref", "مرجع فیلترها", "Filters reference"),
            ("reference/middlewares-ref", "مرجع میدلورها", "Middlewares reference"),
            ("reference/exceptions", "استثناها", "Exceptions"),
        ],
    },
    {
        "id": "cookbook", "icon": "🍳", "title": ("دستور پخت", "Cookbook"),
        "items": [
            ("cookbook/quiz-bot", "ربات مسابقه", "Quiz bot"),
            ("cookbook/poll-bot", "ربات نظرسنجی", "Poll bot"),
            ("cookbook/admin-bot", "مدیریت گروه", "Group admin bot"),
            ("cookbook/shop-bot", "ربات فروشگاه", "Shop bot"),
            ("cookbook/mandatory-membership", "عضویت اجباری", "Mandatory membership"),
            ("cookbook/deploy", "استقرار روی سرور", "Deploying"),
        ],
    },
    {
        "id": "more", "icon": "💡", "title": ("بیشتر", "More"),
        "items": [
            ("more/bale-notes", "نکات و محدودیت‌های بله", "Bale notes & limits"),
            ("more/faq", "پرسش‌های پرتکرار", "FAQ & troubleshooting"),
            ("more/changelog", "تغییرات نسخه‌ها", "Changelog"),
        ],
    },
]

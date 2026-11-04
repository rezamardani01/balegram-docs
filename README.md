# مستندات balegram / balegram docs

سایت مستندات کامل [balegram](https://github.com/rezamardani01/balegram) — فریم‌ورک async برای ساخت ربات در پیام‌رسان بله.
The complete documentation site of [balegram](https://github.com/rezamardani01/balegram), an async framework for Bale bots.

- زبان پیش‌فرض فارسی (فونت وزیرمتن)، با گزینه‌ی انگلیسی / Persian by default, English available
- بدون بیلد و وابستگی: HTML + CSS + JS خالص / plain HTML, CSS and JS, no framework
- منتشر شده با GitHub Pages

## اجرای محلی / Run locally

```bash
python -m http.server 8000
# http://localhost:8000
```

## ساختار / Structure

```
index.html          پوسته‌ی سایت
assets/css          استایل‌ها
assets/js           روتر، رندر مارک‌داون، هایلایتر، ویجت‌ها و content.js (تولیدشده)
content/fa|en       درس‌ها به صورت Markdown
tools/build.py      ساخت assets/js/content.js از content/ و داده‌های مرجع
```

بعد از ویرایش فایل‌های `content/` یا `tools/`، دستور `python tools/build.py` را اجرا کنید.

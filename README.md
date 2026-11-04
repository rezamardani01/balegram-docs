# مستندات balegram / balegram docs

سایت مستندات کامل [balegram](https://github.com/rezamardani01/balegram) — فریم‌ورک async و تایپ‌دار برای ساخت ربات در پیام‌رسان بله.
The complete documentation site of [balegram](https://github.com/rezamardani01/balegram), an async, typed framework for Bale bots.

- 🇮🇷 **زبان پیش‌فرض فارسی** با فونت وزیرمتن، و گزینه‌ی **English** در سربرگ / Persian by default (Vazirmatn font), English one click away
- 📘 ۴۱ صفحه در هر زبان: آموزش درس‌به‌درس، مرجع همه‌ی ۵۳ متد، تایپ‌ها، فیلترها، میدلورها، دستور پخت (پروژه‌های کامل) و پرسش‌های پرتکرار
- ✨ انیمیشن‌ها: دموی گفتگو، نمودار مسیر آپدیت، دکمه‌های رنگی زنده، شبیه‌ساز فیلتر، پیشرفت مطالعه، تم روشن/تاریک
- 🔎 جستجوی فوری (`Ctrl K`)، فهرست «در این صفحه»، دکمه‌ی کپی روی کدها
- 🪶 بدون بیلد و بدون وابستگی: HTML + CSS + JS خالص / no framework, no build step

## اجرای محلی / Run locally

```bash
python -m http.server 8000
# http://localhost:8000
```

## انتشار با GitHub Pages / Publish with GitHub Pages

Settings → Pages → *Deploy from a branch* → `main` / `(root)`. فایل `.nojekyll` از قبل هست.

## ساختار / Structure

```
index.html            پوسته‌ی سایت / the site shell
assets/css            استایل‌ها / styles
assets/js             روتر، رندر مارک‌داون، هایلایتر، ویجت‌ها، صفحه‌ی اصلی و content.js (تولیدشده)
content/fa | en       درس‌ها به صورت Markdown / lessons in Markdown
tools/nav.py          فهرست منوی کناری / the sidebar tree
tools/ref_data.py     داده‌ی مرجع متدها / structured method data
tools/ref_types.py    داده‌ی مرجع تایپ‌ها / structured type data
tools/gen_reference   تولید صفحه‌های مرجع / generates the reference pages
tools/build.py        ساخت assets/js/content.js
```

## نوشتن یا ویرایش صفحه / Editing

1. فایل‌های `content/fa/...` و `content/en/...` را ویرایش کنید (هر صفحه در هر دو زبان).
2. اجرا کنید: `python tools/build.py`
3. صفحه‌ی جدید را در `tools/nav.py` به منو اضافه کنید.

صفحه‌های `content/*/reference/methods-*.md` و `types.md` **تولیدشده** هستند؛ به‌جای آن‌ها `tools/ref_data.py` و `tools/ref_types.py` را ویرایش کنید.

### افزونه‌های مارک‌داون / Markdown extras

| سینتکس | نتیجه |
|---|---|
| `::: tip عنوان` … `:::` | کادر نکته (`note`، `warn`، `danger` هم هست) |
| `::: steps` + لیست شماره‌دار | خط زمانی مرحله‌ها |
| `::: cards` + `- 🚀 \| عنوان \| توضیح \| /مسیر` | کارت‌های لینک‌دار |
| `::: widget flow` / `buttons` / `playground` | ویجت‌های تعاملی |
| ` ```python title="bot.py" ` | کد با عنوان و دکمه‌ی کپی |

## مجوز / License

MIT

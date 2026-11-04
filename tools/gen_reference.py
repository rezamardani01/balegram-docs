"""Generate content/<lang>/reference/methods-*.md from tools/ref_data.py."""

from __future__ import annotations

import re
from pathlib import Path

from ref_data import METHODS, PAGES, SHARED
from ref_types import TYPES

ROOT = Path(__file__).resolve().parent.parent

L = {
    "fa": {
        "params": "پارامترها", "none": "این متد پارامتری ندارد.", "name": "پارامتر", "type": "نوع", "req": "الزامی", "desc": "توضیح",
        "returns": "خروجی", "example": "مثال", "short": "میانبر", "index": "فهرست متدها", "method": "متد", "what": "کار",
        "yes": "✱", "no": "اختیاری", "api": "نام در Bot API",
    },
    "en": {
        "params": "Parameters", "none": "This method has no parameters.", "name": "Parameter", "type": "Type", "req": "Required", "desc": "Description",
        "returns": "Returns", "example": "Example", "short": "Shortcut", "index": "Methods at a glance", "method": "Method", "what": "What it does",
        "yes": "✱", "no": "optional", "api": "Bot API name",
    },
}

EXTRA = {
    "reference/methods-media": (
        "همه‌ی مثال‌های این صفحه فرض می‌کنند این importها را دارید:\n\n```python\nfrom balegram.types import FSInputFile, BufferedInputFile\n```\n\n"
        "آرگومان فایل سه شکل می‌پذیرد: `file_id`، لینک HTTP یا `InputFile` برای آپلود. جزئیات در درس [ارسال و دریافت فایل](/guide/files).",
        "All examples on this page assume these imports:\n\n```python\nfrom balegram.types import FSInputFile, BufferedInputFile\n```\n\n"
        "A file argument takes three forms: a `file_id`, an HTTP URL or an `InputFile` for uploads. Details in the lesson [Sending & receiving files](/guide/files).",
    ),
    "reference/methods-chats": (
        "بیشتر متدهای این صفحه **فقط برای گروه و کانال** هستند و روی چت خصوصی `unsupported peer type` می‌دهند. ربات برای مدیریت (بن، پین، تغییر عنوان ...) باید **ادمین** باشد.",
        "Most methods on this page are **for groups and channels only** and return `unsupported peer type` on a private chat. To manage (ban, pin, change title...) the bot must be an **admin**.",
    ),
    "reference/methods-updates": (
        "برای ساخت ربات معمولاً لازم نیست این متدها را مستقیم صدا بزنید: `start_polling` و `SimpleRequestHandler` آن‌ها را مدیریت می‌کنند. ([اجرا: Polling و Webhook](/guide/running))",
        "To build a bot you usually do not call these directly: `start_polling` and `SimpleRequestHandler` manage them. ([Running: polling & webhook](/guide/running))",
    ),
}


def pick(text: str, lang: str) -> str:
    return re.sub(r"\{\{(.*?)\|(.*?)\}\}", lambda m: m.group(1 if lang == "fa" else 2), text)


def esc_cell(text: str) -> str:
    return text.replace("|", "\\|")


def render_method(key: str, lang: str) -> str:
    m, t = METHODS[key], L[lang]
    i = 0 if lang == "fa" else 1
    out = ["::: method", f"## {key} {{#{key}}}", f"::: head {m['api']} | {m['ret']}", ":::", "::: sig", pick(m["sig"], lang), ":::", "", m[lang], ""]
    out.append(f"#### {t['params']}")
    if m["params"]:
        out += ["", f"| {t['name']} | {t['type']} | {t['req']} | {t['desc']} |", "|---|---|---|---|"]
        for p in m["params"]:
            name, typ, req = p[0], p[1], p[2]
            override = p[3] if len(p) > 3 else None
            if override:
                desc = override[i]
            elif typ.startswith("InputFile"):
                desc = SHARED["file"][i]
            else:
                desc = SHARED.get(name, ("", ""))[i]
            out.append(f"| `{name}` | `{esc_cell(typ)}` | {'{req}' if req else '{opt}'} | {desc} |")
    else:
        out += ["", t["none"]]
    out += ["", f"**{t['returns']}:** `{m['ret']}`", "", f"#### {t['example']}", "", "```python", pick(m["ex"], lang), "```", ""]
    if m.get("short"):
        out += [f"**{t['short']}:**", "", "```python", pick(m["short"], lang), "```", ""]
    for kind, fa, en in m.get("notes", []):
        out += [f"::: {kind}", fa if lang == "fa" else en, ":::", ""]
    out.append(":::")
    return "\n".join(out)


def render_page(path: str, title: tuple[str, str], lead: tuple[str, str], keys: list[str], lang: str) -> str:
    i = 0 if lang == "fa" else 1
    t = L[lang]
    out = ["---", f"title: {title[i]}", f"lead: {lead[i]}", "---", ""]
    if path in EXTRA:
        out += [EXTRA[path][i], ""]
    out += [f"## {t['index']}", "", f"| {t['method']} | {t['api']} | {t['what']} |", "|---|---|---|"]
    for k in keys:
        m = METHODS[k]
        first = re.split(r"(?<=[.。])\s", m[lang])[0].replace("|", "\\|")
        out.append(f"| [`{k}`](/{path}?s={k}) | `{m['api']}` | {first} |")
    out.append("")
    for k in keys:
        out += [render_method(k, lang), ""]
    return "\n".join(out)


def render_types(lang: str) -> str:
    i = 2 if lang == "fa" else 3
    heads = {"fa": ("فیلد", "نوع", "توضیح", "تایپ‌ها", "همه‌ی تایپ‌ها از `balegram.types` import می‌شوند. فیلدهای اختیاری با `?` مشخص شده‌اند و می‌توانند `None` باشند. فیلدهای ناشناخته‌ی بله نادیده گرفته نمی‌شوند و حفظ می‌شوند؛ پس اضافه‌شدن فیلد جدید در API چیزی را خراب نمی‌کند.", "از `types.Update` تا `types.InputFile`"),
             "en": ("Field", "Type", "Description", "Types", "All types are imported from `balegram.types`. Optional fields are marked with `?` and can be `None`. Unknown fields from Bale are kept, not dropped, so a new API field never breaks anything.", "")}[lang]
    title = {"fa": "تایپ‌ها", "en": "Types"}[lang]
    out = ["---", f"title: {title}", f"lead: {'همه‌ی شیءهای بله به‌صورت مدل‌های pydantic: فیلدها، نوع‌ها و میانبرها.' if lang == 'fa' else 'Every Bale object as a pydantic model: fields, types and shortcuts.'}", "---", "", heads[4], ""]
    out += ["```python", "from balegram.types import Message, User, Chat, Update, CallbackQuery", "```", ""]
    for name, fa, en, fields in TYPES:
        out += [f"## {name}", "", fa if lang == "fa" else en, "", f"| {heads[0]} | {heads[1]} | {heads[2]} |", "|---|---|---|"]
        for f in fields:
            out.append(f"| `{f[0]}` | `{esc_cell(f[1])}` | {f[i].replace('|', chr(92) + '|')} |")
        out.append("")
    return "\n".join(out)


def main() -> int:
    count = 0
    for path, title, lead, keys in PAGES:
        for lang in ("fa", "en"):
            file = ROOT / "content" / lang / (path + ".md")
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(render_page(path, title, lead, keys, lang), encoding="utf-8")
            count += 1
    for lang in ("fa", "en"):
        (ROOT / "content" / lang / "reference" / "types.md").write_text(render_types(lang), encoding="utf-8")
        count += 1
    methods = {k for _, _, _, ks in PAGES for k in ks}
    missing = set(METHODS) - methods
    if missing:
        print("WARNING: methods without a page:", sorted(missing))
    print(f"generated {count} reference pages for {len(methods)} methods")
    return 0


if __name__ == "__main__":
    main()

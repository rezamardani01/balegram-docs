"""Pack content/<lang>/**/*.md and the navigation into assets/js/content.js.

    python tools/build.py

Each markdown file may start with a front matter block:

    ---
    title: Page title
    lead: One-sentence summary shown under the title
    ---
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from nav import NAV  # noqa: E402


def parse(text: str) -> dict[str, str]:
    meta: dict[str, str] = {}
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text.replace("\r\n", "\n"), re.S)
    body = text
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        body = m.group(2)
    return {"title": meta.get("title", ""), "lead": meta.get("lead", ""), "md": body.strip() + "\n"}


def main() -> None:
    try:  # reference pages are generated from structured data
        import gen_reference

        gen_reference.main()
    except ModuleNotFoundError:
        pass

    pages: dict[str, dict[str, dict[str, str]]] = {"fa": {}, "en": {}}
    for lang in pages:
        for file in sorted((ROOT / "content" / lang).rglob("*.md")):
            key = file.relative_to(ROOT / "content" / lang).with_suffix("").as_posix()
            pages[lang][key] = parse(file.read_text(encoding="utf-8"))

    nav = [
        {
            "id": g["id"], "icon": g["icon"], "title": {"fa": g["title"][0], "en": g["title"][1]},
            "items": [{"path": p, "title": {"fa": fa, "en": en}} for p, fa, en in g["items"]],
        }
        for g in NAV
    ]
    missing = [(lang, p) for g in NAV for p, *_ in g["items"] for lang in pages if p not in pages[lang]]
    data = {"nav": nav, "pages": pages}
    out = ROOT / "assets" / "js" / "content.js"
    out.write_text("window.DOCS = " + json.dumps(data, ensure_ascii=False, indent=None) + ";\n", encoding="utf-8")
    total = sum(len(v) for v in pages.values())
    print(f"built {out.relative_to(ROOT)}: {total} pages ({len(pages['fa'])} fa, {len(pages['en'])} en)")
    if missing:
        print("pages listed in nav but missing content:")
        for lang, p in missing:
            print(f"  [{lang}] {p}")


if __name__ == "__main__":
    main()

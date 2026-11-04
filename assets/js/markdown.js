/* Small Markdown renderer tailored to this site. No dependencies.
   Supports: headings (with ids), paragraphs, **bold**, *italic*, `code`, [links](url), lists (nested by 2 spaces),
   tables, blockquotes, hr, fenced code (```lang title="x.py"), and containers:
     ::: tip|note|warn|danger [Title]   ...   :::
     ::: steps    (an ordered list rendered as a timeline)
     ::: cards    (lines:  - 🚀 | Title | description | /path)
     ::: widget name
   Internal links start with "/" and become #/<lang>/<path>.                                                */
(function () {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "") || "section";

  function inline(text, ctx) {
    const codes = [];
    text = text.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    text = esc(text);
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
      u = u.replace(/&amp;/g, "&");
      if (u.startsWith("/")) return `<a href="#/${ctx.lang}${u}">${t}</a>`;
      if (u.startsWith("#")) return `<a href="${u}">${t}</a>`;
      return `<a href="${esc(u)}" target="_blank" rel="noopener">${t}</a>`;
    });
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s).,،؛:!?]|$)/g, "$1<em>$2</em>");
    text = text.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
    return text;
  }

  function codeBlock(code, info) {
    const m = (info || "").match(/^(\S*)\s*(?:title="([^"]*)")?\s*(out)?/);
    const lang = m && m[1] || "text";
    const title = m && m[2] || (lang === "text" ? "" : lang);
    const isOut = lang === "output" || (m && m[3]);
    const html = window.highlight(code.replace(/\n$/, ""), isOut ? "text" : lang);
    return `<div class="code${isOut ? " out" : ""}"><div class="code-bar"><span class="dots"><i></i><i></i><i></i></span>` +
      `<span class="code-title">${esc(isOut ? "output" : title)}</span><button class="copy" data-copy>Copy</button></div>` +
      `<pre><code>${html}</code></pre></div>`;
  }

  function parseTable(rows, ctx) {
    const cells = (r) => r.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
    const head = cells(rows[0]);
    const body = rows.slice(2).map(cells);
    const td = (c) => inline(c, ctx).replace(/\{req\}/g, '<span class="req">*</span>').replace(/\{opt\}/g, '<span class="opt">opt</span>');
    return `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${inline(h, ctx)}</th>`).join("")}</tr></thead><tbody>` +
      body.map((r) => `<tr>${r.map((c) => `<td>${td(c)}</td>`).join("")}</tr>`).join("") + "</tbody></table></div>";
  }

  function renderList(lines, ctx) {
    // lines: array of raw list lines (with indentation). Builds nested lists by 2-space indents.
    const items = [];
    for (const raw of lines) {
      const m = raw.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
      if (m) items.push({ indent: Math.floor(m[1].length / 2), ordered: /\d/.test(m[2]), text: m[3], kids: [] });
      else if (items.length) items[items.length - 1].text += " " + raw.trim();
    }
    function build(idx, level) {
      let html = "", i = idx;
      const tag = items[i].ordered ? "ol" : "ul";
      html += `<${tag}>`;
      while (i < items.length && items[i].indent >= level) {
        if (items[i].indent > level) {
          const [sub, next] = build(i, items[i].indent);
          html = html.replace(/<\/li>$/, sub + "</li>");
          i = next; continue;
        }
        html += `<li>${inline(items[i].text, ctx)}</li>`;
        i++;
      }
      return [html + `</${tag}>`, i];
    }
    return build(0, items[0].indent)[0];
  }

  function render(md, ctx) {
    const toc = [];
    const lines = md.replace(/\r\n?/g, "\n").split("\n");
    const html = block(lines, ctx, toc);
    return { html, toc };
  }

  function block(lines, ctx, toc) {
    let out = "", i = 0;
    const isBlank = (l) => /^\s*$/.test(l);
    while (i < lines.length) {
      const line = lines[i];
      if (isBlank(line)) { i++; continue; }

      // fenced code
      let m = line.match(/^```(.*)$/);
      if (m) {
        const buf = []; i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
        i++;
        out += codeBlock(buf.join("\n"), m[1].trim());
        continue;
      }
      // containers
      m = line.match(/^:::\s*(\w+)\s*(.*)$/);
      if (m) {
        const kind = m[1], title = m[2].trim(); const buf = []; i++;
        let depth = 1;
        while (i < lines.length) {
          if (/^:::\s*\w+/.test(lines[i])) depth++;
          else if (/^:::\s*$/.test(lines[i])) { depth--; if (!depth) break; }
          buf.push(lines[i++]);
        }
        i++;
        out += container(kind, title, buf, ctx, toc);
        continue;
      }
      // headings
      m = line.match(/^(#{1,4})\s+(.*)$/);
      if (m) {
        const level = m[1].length; let text = m[2].trim();
        const explicit = text.match(/\s\{#([\w-]+)\}$/);
        if (explicit) text = text.replace(/\s\{#[\w-]+\}$/, "");
        const id = explicit ? explicit[1] : slug(text);
        const plain = text.replace(/`/g, "");
        if (level === 2 || level === 3) toc.push({ level, id, text: plain });
        out += `<h${level} id="${id}">${inline(text, ctx)}${level > 1 ? `<a class="anchor" href="#/${ctx.lang}/${ctx.path}?s=${id}" data-anchor="${id}">#</a>` : ""}</h${level}>`;
        i++; continue;
      }
      if (/^(-{3,}|\*{3,})\s*$/.test(line)) { out += "<hr>"; i++; continue; }
      // table
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        const rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++]);
        out += parseTable(rows, ctx); continue;
      }
      // blockquote
      if (/^>/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
        out += `<blockquote>${block(buf, ctx, toc)}</blockquote>`; continue;
      }
      // list
      if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
        const buf = [];
        while (i < lines.length && !isBlank(lines[i]) && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) buf.push(lines[i++]);
        out += renderList(buf, ctx); continue;
      }
      // paragraph
      const buf = [];
      while (i < lines.length && !isBlank(lines[i]) && !/^(```|:::|#{1,4}\s|>|\s*\|)/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s+/.test(lines[i])) buf.push(lines[i++]);
      if (!buf.length) { buf.push(lines[i++]); }
      out += `<p>${inline(buf.join(" "), ctx)}</p>`;
    }
    return out;
  }

  const ICONS = { tip: "✓", note: "i", warn: "!", danger: "✕" };
  const TITLES = {
    fa: { tip: "نکته", note: "توجه", warn: "هشدار", danger: "خطر" },
    en: { tip: "Tip", note: "Note", warn: "Warning", danger: "Danger" },
  };

  function container(kind, title, buf, ctx, toc) {
    if (ICONS[kind]) {
      const t = title || TITLES[ctx.lang][kind];
      return `<div class="callout ${kind}"><span class="ico">${ICONS[kind]}</span><div class="body"><p class="ttl">${inline(t, ctx)}</p>${block(buf, ctx, toc)}</div></div>`;
    }
    if (kind === "steps") return `<div class="steps-wrap">${block(buf, ctx, toc).replace(/^<ol>/, '<ol class="steps">')}</div>`;
    if (kind === "cards") {
      const cards = buf.filter((l) => /^\s*-\s/.test(l)).map((l) => {
        const [em, t, d, p] = l.replace(/^\s*-\s*/, "").split("|").map((s) => s.trim());
        const href = p && p.startsWith("/") ? `#/${ctx.lang}${p}` : p || "#";
        return `<a class="card reveal" href="${href}"><span class="em">${em}</span><b>${inline(t, ctx)}</b><span>${inline(d || "", ctx)}</span></a>`;
      });
      return `<div class="cards">${cards.join("")}</div>`;
    }
    if (kind === "widget") return `<div data-widget="${title}"></div>`;
    return block(buf, ctx, toc);
  }

  window.renderMarkdown = render;
  window.mdInline = inline;
  window.mdSlug = slug;
  window.mdEscape = esc;
})();

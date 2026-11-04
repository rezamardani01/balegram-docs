/* Tiny syntax highlighter (Python, shell, JSON). No dependencies. */
(function () {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const span = (cls, s) => `<span class="t-${cls}">${esc(s)}</span>`;

  const PY_KW = new Set(("and as assert async await break class continue def del elif else except finally for from global if import in is lambda " +
    "nonlocal not or pass raise return try while with yield match case").split(" "));
  const PY_CONST = new Set(["True", "False", "None"]);
  const PY_BUILTIN = new Set(("print len range int str float bool list dict set tuple isinstance super type min max sum sorted enumerate zip map filter open " +
    "any all abs round repr getattr setattr hasattr id input format iter next").split(" "));

  const PY_RE = new RegExp([
    "(#[^\\n]*)",                                                       // 1 comment
    "((?:[rRbBfFuU]{0,2})(?:\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''))", // 2 triple strings
    "((?:[rRbBfFuU]{0,2})(?:\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'))", // 3 strings
    "(@[A-Za-z_][\\w.]*)",                                               // 4 decorators
    "(\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b)",                  // 5 numbers
    "([A-Za-z_]\\w*)",                                                   // 6 identifiers
    "(->|:=|==|!=|<=|>=|\\*\\*|//|[-+*/%<>=|&^~@]=?)",                   // 7 operators
  ].join("|"), "g");

  function python(code) {
    let out = "", last = 0, prev = "", prevWord = "";
    PY_RE.lastIndex = 0;
    let m;
    while ((m = PY_RE.exec(code))) {
      out += esc(code.slice(last, m.index));
      last = PY_RE.lastIndex;
      const [txt, com, tri, str, deco, num, id, op] = m;
      if (com) out += span("com", txt);
      else if (tri || str) out += span("str", txt);
      else if (deco) out += span("deco", txt);
      else if (num) out += span("num", txt);
      else if (op) out += span("op", txt);
      else if (id) {
        const after = code.slice(last).match(/^\s*\(/);
        if (PY_KW.has(id)) out += span("kw", id);
        else if (PY_CONST.has(id)) out += span("num", id);
        else if (id === "self" || id === "cls") out += span("self", id);
        else if (prevWord === "def") out += span("fn", id);
        else if (prevWord === "class") out += span("cls", id);
        else if (PY_BUILTIN.has(id) && after) out += span("fn", id);
        else if (/^[A-Z][A-Za-z0-9]*$/.test(id) && id.length > 1 && !/^[A-Z0-9_]+$/.test(id)) out += span("cls", id);
        else if (after && prev !== ".") out += span("fn", id);
        else if (after && prev === ".") out += span("fn", id);
        else out += esc(id);
        prevWord = id;
      }
      prev = txt.slice(-1);
      if (!id) prevWord = "";
    }
    return out + esc(code.slice(last));
  }

  function shell(code) {
    return code.split("\n").map((line) => {
      const m = line.match(/^(\s*)(\$|>>>|PS>|#\s)?(.*)$/);
      if (/^\s*#/.test(line)) return span("com", line);
      let body = esc(m[3]);
      body = body.replace(/(&quot;|"[^"]*"|'[^']*')/g, (s) => `<span class="t-str">${s}</span>`);
      body = body.replace(/(^|\s)(--?[A-Za-z][\w-]*)/g, (s, a, b) => `${a}<span class="t-num">${b}</span>`);
      body = body.replace(/^(\s*)([\w./-]+)/, (s, a, b) => `${a}<span class="t-fn">${b}</span>`);
      return esc(m[1]) + (m[2] ? `<span class="t-prompt">${esc(m[2])}</span> ` : "") + body;
    }).join("\n");
  }

  function json(code) {
    return esc(code)
      .replace(/(&quot;|")((?:\\.|[^"\\])*)"\s*:/g, (s, q, k) => `<span class="t-cls">"${k}"</span>:`)
      .replace(/: ?"((?:\\.|[^"\\])*)"/g, (s, v) => `: <span class="t-str">"${v}"</span>`)
      .replace(/\b(true|false|null)\b/g, '<span class="t-num">$1</span>')
      .replace(/(?<![\w"])(-?\d+(?:\.\d+)?)(?![\w"])/g, '<span class="t-num">$1</span>');
  }

  window.highlight = function (code, lang) {
    switch ((lang || "").toLowerCase()) {
      case "py": case "python": return python(code);
      case "bash": case "sh": case "shell": case "console": case "powershell": return shell(code);
      case "json": return json(code);
      default: return esc(code);
    }
  };
})();

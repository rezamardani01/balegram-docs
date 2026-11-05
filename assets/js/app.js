/* baleropy docs — router, navigation, search, theme, language. */
(function () {
  const DOCS = window.DOCS || { nav: [], pages: { fa: {}, en: {} } };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const UI = {
    fa: {
      search: "جستجو در مستندات...", searchBtn: "جستجو", menu: "منو", toc: "در این صفحه", prev: "قبلی", next: "بعدی",
      notFound: "این صفحه پیدا نشد", notFoundText: "آدرس را بررسی کنید یا صفحه را از منو انتخاب کنید.", home: "بازگشت به خانه",
      copy: "کپی", copied: "کپی شد ✓", noResult: "نتیجه‌ای پیدا نشد", untranslated: "این صفحه هنوز به فارسی ترجمه نشده و نسخه‌ی انگلیسی نمایش داده می‌شود.",
      theme: "تغییر تم", top: "رفتن به بالا", menu: "منو", closeMenu: "بستن منو", navigation: "راهنمای مستندات", footer: "راهنمای ساخت ربات‌های بله با Baleropy · مستندات فارسی و انگلیسی", docs: "مستندات",
      langName: "English", langFlag: "EN", hint: "برای جستجو", edit: "ویرایش در گیت‌هاب",
    },
    en: {
      search: "Search the docs...", searchBtn: "Search", menu: "Menu", toc: "On this page", prev: "Previous", next: "Next",
      notFound: "Page not found", notFoundText: "Check the address or pick a page from the sidebar.", home: "Back to home",
      copy: "Copy", copied: "Copied ✓", noResult: "No results", untranslated: "This page is not translated yet, showing the Persian version.",
      theme: "Toggle theme", top: "Back to top", menu: "Menu", closeMenu: "Close menu", navigation: "Documentation navigation", footer: "A practical guide to building Bale bots with Baleropy · Persian and English docs", docs: "Docs",
      langName: "فارسی", langFlag: "FA", hint: "to search", edit: "Edit on GitHub",
    },
  };
  window.UI = UI;

  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  let lang = "fa";
  let current = { path: "", s: "" };
  let spy = null;

  // ── routing ────────────────────────────────────────────────────────────────────
  function parseHash() {
    const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const [pathPart, query] = raw.split("?");
    const segs = pathPart.split("/").filter(Boolean);
    let l = null;
    if (segs[0] === "fa" || segs[0] === "en") l = segs.shift();
    const s = query && /(?:^|&)s=([^&]+)/.exec(query);
    return { lang: l, path: segs.join("/"), s: s ? s[1] : "" };
  }

  function go(path, l = lang) { location.hash = `/${l}${path ? "/" + path : ""}`; }

  function setLang(l) {
    lang = l; store.set("lang", l);
    const html = document.documentElement;
    html.lang = l; html.dir = l === "fa" ? "rtl" : "ltr";
    const t = UI[l];
    $("#search-label").textContent = t.searchBtn;
    $("#search-hint").textContent = "Ctrl K";
    $("#lang-flag").textContent = t.langFlag;
    $("#lang-name").textContent = t.langName;
    $("#search-input").placeholder = t.search;
    $("#menu-btn").setAttribute("aria-label", t.menu);
    $("#sidebar").setAttribute("aria-label", t.navigation);
    $("#sidebar-backdrop").setAttribute("aria-label", t.closeMenu);
    $("#theme-btn").setAttribute("aria-label", t.theme);
    $("#to-top").setAttribute("aria-label", t.top);
    $("#brand-tag").textContent = t.docs;
    $("#footer-text").textContent = t.footer;
  }

  // ── theme ──────────────────────────────────────────────────────────────────────
  function applyTheme(mode) {
    const dark = mode === "dark" || (mode === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    $("#theme-icon-sun").style.display = dark ? "" : "none";
    $("#theme-icon-moon").style.display = dark ? "none" : "";
  }

  // ── navigation tree ────────────────────────────────────────────────────────────
  const flat = [];
  DOCS.nav.forEach((g) => g.items.forEach((it) => flat.push({ ...it, group: g })));
  const collapsed = new Set(JSON.parse(store.get("collapsed") || "[]"));

  function buildNav() {
    const side = $("#sidebar");
    side.innerHTML = DOCS.nav.map((g) => `
      <div class="nav-group${collapsed.has(g.id) ? " collapsed" : ""}" data-g="${g.id}">
        <button class="nav-title"><span>${g.icon || ""} ${g.title[lang]}</span>
          <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg></button>
        <div class="nav-items"><div>${g.items.map((it) =>
          `<a class="nav-link" href="#/${lang}/${it.path}" data-path="${it.path}">${it.title[lang]}${it.tag ? `<span class="tag">${it.tag}</span>` : ""}</a>`).join("")}</div></div>
      </div>`).join("");
    $$(".nav-title", side).forEach((b) => b.onclick = () => {
      const g = b.parentElement; g.classList.toggle("collapsed");
      g.classList.contains("collapsed") ? collapsed.add(g.dataset.g) : collapsed.delete(g.dataset.g);
      store.set("collapsed", JSON.stringify([...collapsed]));
    });
  }

  function markActive() {
    $$(".nav-link").forEach((a) => a.classList.toggle("active", a.dataset.path === current.path));
    const a = $(".nav-link.active");
    if (a) {
      a.closest(".nav-group").classList.remove("collapsed");
      const side = $("#sidebar"), r = a.getBoundingClientRect(), sr = side.getBoundingClientRect();
      if (r.top < sr.top + 40 || r.bottom > sr.bottom - 40) side.scrollTo({ top: a.offsetTop - side.clientHeight / 3, behavior: "smooth" });
    }
  }

  function setMenuOpen(open, restoreFocus = true) {
    const sidebar = $("#sidebar");
    const button = $("#menu-btn");
    if (open && !matchMedia("(max-width: 900px)").matches) return;
    if (open && !current.path) sidebar.style.display = "";
    document.body.classList.toggle("nav-open", open);
    button.setAttribute("aria-expanded", String(open));
    if (!open && !current.path) sidebar.style.display = "none";
    if (open) {
      const active = $(".nav-link.active", sidebar) || $(".nav-link", sidebar);
      active && active.focus({ preventScroll: true });
    } else if (restoreFocus) button.focus({ preventScroll: true });
  }

  // ── page rendering ─────────────────────────────────────────────────────────────
  function render() {
    const h = parseHash();
    if (h.lang && h.lang !== lang) { setLang(h.lang); buildNav(); }
    if (!h.lang) { history.replaceState(null, "", `#/${lang}${h.path ? "/" + h.path : ""}`); }
    current = { path: h.path, s: h.s };
    setMenuOpen(false, false);
    const layout = $("#layout"), main = $("#main");

    const old = $(".page", main);
    const paint = () => {
      if (!h.path) renderHome(layout, main); else renderPage(layout, main, h);
      afterRender(h);
    };
    if (old && !matchMedia("(prefers-reduced-motion: reduce)").matches) { old.classList.add("leaving"); setTimeout(paint, 170); } else paint();
  }

  function renderHome(layout, main) {
    layout.className = "layout landing";
    $("#sidebar").style.display = "none"; $("#toc").style.display = "none";
    main.className = "main-landing";
    main.innerHTML = window.renderLanding(lang, UI[lang]);
    document.title = lang === "fa" ? "Baleropy — فریم‌ورک ساخت ربات بله" : "Baleropy — framework for Bale bots";
    $("#toc").innerHTML = "";
    window.mountLanding && window.mountLanding(main, lang);
  }

  function renderPage(layout, main, h) {
    $("#sidebar").style.display = ""; main.className = "main";
    let page = DOCS.pages[lang][h.path], fallback = false;
    if (!page && DOCS.pages.fa[h.path]) { page = DOCS.pages.fa[h.path]; fallback = lang !== "fa"; }
    if (!page) {
      layout.className = "layout no-toc"; $("#toc").style.display = "none";
      main.innerHTML = `<div class="page"><h1>404</h1><p class="lead">${UI[lang].notFound}</p><p>${UI[lang].notFoundText}</p><a class="btn primary" href="#/${lang}">${UI[lang].home}</a></div>`;
      document.title = "404 · Baleropy"; return;
    }
    const { html, toc } = window.renderMarkdown(page.md, { lang, path: h.path });
    const idx = flat.findIndex((f) => f.path === h.path);
    const group = idx >= 0 ? flat[idx].group : null;
    const prev = flat[idx - 1], next = flat[idx + 1];
    const pager = `<div class="pager">${prev ? `<a class="prev" href="#/${lang}/${prev.path}"><small>${UI[lang].prev}</small><b><span class="arr">${lang === "fa" ? "→" : "←"}</span> ${prev.title[lang]}</b></a>` : "<span></span>"}` +
      `${next ? `<a class="next" href="#/${lang}/${next.path}"><small>${UI[lang].next}</small><b>${next.title[lang]} <span class="arr">${lang === "fa" ? "←" : "→"}</span></b></a>` : "<span></span>"}</div>`;
    main.innerHTML = `<article class="page">
      <div class="crumbs"><span>${UI[lang].docs}</span>${group ? `<span>${group.title[lang]}</span>` : ""}</div>
      <h1>${window.mdInline(page.title, { lang, path: h.path })}</h1>
      ${page.lead ? `<p class="lead">${window.mdInline(page.lead, { lang, path: h.path })}</p>` : ""}
      ${fallback ? `<div class="callout warn"><span class="ico">!</span><div class="body"><p>${UI[lang].untranslated}</p></div></div>` : ""}
      ${html}${pager}</article>`;
    const tocEl = $("#toc");
    if (toc.length > 1) {
      layout.className = "layout";
      tocEl.style.display = "";
      tocEl.innerHTML = `<h4>${UI[lang].toc}</h4>` + toc.map((t) => `<a class="l${t.level}" href="#/${lang}/${h.path}?s=${t.id}" data-id="${t.id}">${t.text}</a>`).join("");
    } else { layout.className = "layout no-toc"; tocEl.style.display = "none"; tocEl.innerHTML = ""; }
    document.title = `${page.title.replace(/`/g, "")} · Baleropy`;
    window.mountWidgets && window.mountWidgets(main, lang);
  }

  function afterRender(h) {
    markActive();
    $$("[data-copy]").forEach((b) => { b.textContent = UI[lang].copy; });
    observeReveal();
    setupSpy();
    if (h.s) {
      const el = document.getElementById(h.s);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    } else window.scrollTo({ top: 0, behavior: "instant" });
    updateProgress();
  }

  // ── scroll effects ─────────────────────────────────────────────────────────────
  let revealIO = null;
  function observeReveal() {
    revealIO && revealIO.disconnect();
    revealIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); } }), { threshold: 0.01, rootMargin: "0px 0px -30px 0px" });
    $$(".reveal").forEach((el, i) => { el.style.setProperty("--d", `${(i % 6) * 0.07}s`); revealIO.observe(el); });
  }

  function setupSpy() {
    spy && spy.disconnect();
    const links = $$("#toc a");
    if (!links.length) return;
    spy = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) { links.forEach((a) => a.classList.toggle("active", a.dataset.id === e.target.id)); }
      });
    }, { rootMargin: "-80px 0px -72% 0px" });
    $$(".page h2[id], .page h3[id]").forEach((h) => spy.observe(h));
  }

  function updateProgress() {
    const d = document.documentElement, max = d.scrollHeight - d.clientHeight;
    $("#progress").style.transform = `scaleX(${max > 0 ? Math.min(1, d.scrollTop / max) : 0})`;
    $("#to-top").classList.toggle("show", d.scrollTop > 700);
  }

  // ── search ─────────────────────────────────────────────────────────────────────
  const searchIndex = {};
  function indexFor(l) {
    if (searchIndex[l]) return searchIndex[l];
    const items = [];
    for (const [path, p] of Object.entries(DOCS.pages[l] || {})) {
      const nav = flat.find((f) => f.path === path);
      const heads = [...p.md.matchAll(/^#{2,3}\s+(.*)$/gm)].map((m) => m[1].replace(/`|\{#[\w-]+\}/g, ""));
      const body = p.md.replace(/```[\s\S]*?```/g, (c) => c.replace(/```\w*/g, " ")).replace(/[`*#>|:\-\[\]()]/g, " ").replace(/\s+/g, " ");
      items.push({ path, title: p.title.replace(/`/g, ""), group: nav ? nav.group.title[l] : "", heads, body });
    }
    return (searchIndex[l] = items);
  }

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/);
    return indexFor(lang).map((it) => {
      let score = 0, snippet = "", hl = null;
      const title = it.title.toLowerCase();
      for (const t of terms) {
        if (title.includes(t)) score += title.startsWith(t) ? 14 : 9;
        const hh = it.heads.find((h) => h.toLowerCase().includes(t));
        if (hh) { score += 5; hl = hl || hh; }
        const i = it.body.toLowerCase().indexOf(t);
        if (i >= 0) { score += 1; if (!snippet) snippet = it.body.slice(Math.max(0, i - 40), i + 90); }
      }
      return score ? { ...it, score, snippet: hl || snippet } : null;
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12);
  }

  function markTerms(text, q) {
    let out = window.mdEscape(text);
    q.trim().split(/\s+/).filter(Boolean).forEach((t) => { out = out.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>"); });
    return out;
  }

  let selIdx = 0;
  function openSearch() {
    if (document.body.classList.contains("nav-open")) setMenuOpen(false, false);
    $("#search-modal").classList.add("open");
    const i = $("#search-input"); i.value = ""; i.focus(); showResults("");
  }
  function closeSearch() { $("#search-modal").classList.remove("open"); }
  function showResults(q) {
    const box = $("#results"), res = search(q);
    selIdx = 0;
    if (!q.trim()) { box.innerHTML = ""; return; }
    box.innerHTML = res.length ? res.map((r, i) =>
      `<a class="result${i === 0 ? " sel" : ""}" href="#/${lang}/${r.path}"><b>${markTerms(r.title, q)}</b><small>${r.group ? r.group + " · " : ""}${markTerms(r.snippet || "", q)}</small></a>`).join("")
      : `<div class="no-result">${UI[lang].noResult}</div>`;
  }

  // ── events ─────────────────────────────────────────────────────────────────────
  function init() {
    const savedTheme = store.get("theme") || "auto";
    applyTheme(savedTheme);
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => (store.get("theme") || "auto") === "auto" && applyTheme("auto"));
    $("#theme-btn").onclick = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      store.set("theme", dark ? "light" : "dark"); applyTheme(dark ? "light" : "dark");
    };

    const h = parseHash();
    lang = h.lang || store.get("lang") || "fa";
    setLang(lang); buildNav();

    $("#lang-btn").onclick = () => {
      const next = lang === "fa" ? "en" : "fa";
      setLang(next); buildNav();
      go(current.path, next);
    };
    $("#menu-btn").onclick = () => {
      setMenuOpen(!document.body.classList.contains("nav-open"));
    };
    $("#sidebar-backdrop").onclick = () => setMenuOpen(false);
    $("#sidebar").addEventListener("click", (e) => {
      if (e.target.closest(".nav-link")) setMenuOpen(false, false);
    });
    matchMedia("(max-width: 900px)").addEventListener("change", (e) => {
      if (!e.matches && document.body.classList.contains("nav-open")) setMenuOpen(false, false);
    });
    $("#search-btn").onclick = openSearch;
    $("#search-modal").addEventListener("click", (e) => { if (e.target.id === "search-modal") closeSearch(); });
    $("#search-input").addEventListener("input", (e) => showResults(e.target.value));
    $("#search-input").addEventListener("keydown", (e) => {
      const items = $$("#results .result");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (!items.length) return;
        selIdx = (selIdx + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((r, i) => r.classList.toggle("sel", i === selIdx)); items[selIdx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && items[selIdx]) { location.hash = items[selIdx].getAttribute("href"); closeSearch(); }
    });
    $("#results").addEventListener("click", closeSearch);
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(); }
      else if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
      else if (e.key === "Escape") {
        closeSearch();
        if (document.body.classList.contains("nav-open")) setMenuOpen(false);
      }
    });

    document.addEventListener("click", (e) => {
      const copy = e.target.closest("[data-copy]");
      if (copy) {
        const code = copy.closest(".code").querySelector("code").innerText;
        (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).catch(() => {
          const ta = document.createElement("textarea"); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
        });
        copy.textContent = UI[lang].copied; copy.classList.add("done");
        setTimeout(() => { copy.textContent = UI[lang].copy; copy.classList.remove("done"); }, 1600);
      }
      const anchor = e.target.closest("[data-anchor]");
      if (anchor) {
        e.preventDefault();
        const id = anchor.dataset.anchor;
        history.replaceState(null, "", `#/${lang}/${current.path}?s=${id}`);
        document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
      }
      const toc = e.target.closest("#toc a");
      if (toc) {
        e.preventDefault();
        history.replaceState(null, "", toc.getAttribute("href"));
        document.getElementById(toc.dataset.id).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    document.addEventListener("mousemove", (e) => {
      const c = e.target.closest && e.target.closest(".card");
      if (c) { const r = c.getBoundingClientRect(); c.style.setProperty("--mx", `${e.clientX - r.left}px`); c.style.setProperty("--my", `${e.clientY - r.top}px`); }
    });
    $("#to-top").onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
    addEventListener("scroll", updateProgress, { passive: true });
    addEventListener("hashchange", render);
    render();
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();

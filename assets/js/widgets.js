/* Interactive widgets embedded in lessons with  ::: widget <name>  */
(function () {
  const L = {
    fa: {
      play: "▶ پخش انیمیشن", pause: "⏸ توقف",
      flow: [
        ["📱", "کاربر", "Bale", "کاربر در بله به ربات پیام می‌دهد. سرور بله پیام را به‌صورت یک <b>Update</b> نگه می‌دارد."],
        ["📡", "دریافت", "polling / webhook", "کتابخانه با <b>getUpdates</b> (یا وب‌هوک) آپدیت‌ها را می‌گیرد و به‌صورت یک <b>Update</b> تایپ‌دار درمی‌آورد."],
        ["🧭", "Dispatcher", "feed_update", "<b>Dispatcher</b> آپدیت را می‌گیرد، داده‌ی مشترک (bot، state، کاربر...) را می‌سازد و نوعش را می‌فهمد: message، callback_query و ..."],
        ["🛡️", "Outer MW", "update / router", "<b>میدلورهای بیرونی</b> برای <i>هر</i> رویداد اجرا می‌شوند؛ مثلاً لاگ، آمار یا throttling. اینجا می‌توانی رویداد را متوقف کنی (CancelHandler)."],
        ["🔎", "Filters", "Command · F · State", "فیلترهای هندلرها یکی‌یکی چک می‌شوند. <b>اولین هندلری که همه فیلترهایش درست باشد</b> انتخاب می‌شود."],
        ["⚙️", "Inner MW", "after filters", "<b>میدلورهای داخلی</b> فقط وقتی هندلر پیدا شده اجرا می‌شوند. معمولاً برای بازکردن اتصال دیتابیس یا اندازه‌گیری زمان."],
        ["🧩", "Handler", "async def", "تابع شما اجرا می‌شود. آرگومان‌هایی که اعلام کرده‌اید (message، bot، state...) خودکار تزریق می‌شوند."],
        ["📤", "Bot API", "sendMessage…", "پاسخ شما با <b>Bot API</b> به بله فرستاده می‌شود و کاربر آن را می‌بیند."],
      ],
      btnTitle: "روی دکمه‌ها بزن:", btnMsg: { success: "سبز · style=\"success\"", danger: "قرمز · style=\"danger\"", primary: "آبی · style=\"primary\"", plain: "بدون style · ظاهر پیش‌فرض" },
      btnNames: { success: "تایید", danger: "حذف", primary: "ادامه", plain: "معمولی" },
      pgHint: "یک پیام بنویس (مثلاً /start یا hello یا hi there) و ببین کدام هندلر انتخاب می‌شود:", pgType: "نوع پیام", pgText: "متن", pgPhoto: "عکس", pgWin: "← این هندلر اجرا می‌شود", pgNone: "هیچ هندلری مطابقت نداشت → UNHANDLED",
    },
    en: {
      play: "▶ Play animation", pause: "⏸ Pause",
      flow: [
        ["📱", "User", "Bale", "A user messages the bot in Bale. The server keeps the message as an <b>Update</b>."],
        ["📡", "Receive", "polling / webhook", "The library fetches updates with <b>getUpdates</b> (or a webhook) and turns them into typed <b>Update</b> objects."],
        ["🧭", "Dispatcher", "feed_update", "The <b>Dispatcher</b> builds the shared data (bot, state, user...) and detects the event type: message, callback_query, ..."],
        ["🛡️", "Outer MW", "update / router", "<b>Outer middlewares</b> run for <i>every</i> event: logging, stats, throttling. You can stop the event here (CancelHandler)."],
        ["🔎", "Filters", "Command · F · State", "Handler filters are checked one by one. <b>The first handler whose filters all pass</b> is selected."],
        ["⚙️", "Inner MW", "after filters", "<b>Inner middlewares</b> run only when a handler was found. Typical use: opening a DB connection or timing."],
        ["🧩", "Handler", "async def", "Your function runs. The arguments it declares (message, bot, state...) are injected automatically."],
        ["📤", "Bot API", "sendMessage…", "Your reply is sent through the <b>Bot API</b> and the user sees it."],
      ],
      btnTitle: "Click the buttons:", btnMsg: { success: "green · style=\"success\"", danger: "red · style=\"danger\"", primary: "blue · style=\"primary\"", plain: "no style · default look" },
      btnNames: { success: "Accept", danger: "Delete", primary: "Continue", plain: "Plain" },
      pgHint: "Type a message (e.g. /start, hello or hi there) and see which handler is chosen:", pgType: "Message type", pgText: "Text", pgPhoto: "Photo", pgWin: "← this handler runs", pgNone: "No handler matched → UNHANDLED",
    },
  };

  function flow(el, lang) {
    const t = L[lang];
    const rows = [];
    for (let start = 0; start < t.flow.length; start += 3) {
      const end = Math.min(start + 3, t.flow.length);
      const row = [];
      for (let i = start; i < end; i++) {
        row.push(`<div class="node" data-i="${i}"><span class="e">${t.flow[i][0]}</span><b>${t.flow[i][1]}</b><small>${t.flow[i][2]}</small></div>`);
        if (i < end - 1) row.push(`<div class="link" data-i="${i}"></div>`);
      }
      rows.push(`<div class="flow-row${start === 3 ? " reverse" : ""}${end - start < 3 ? " short" : ""}">${row.join("")}</div>`);
      if (end < t.flow.length) rows.push(`<div class="flow-turn ${start === 0 ? "right" : "left"}"><div class="link" data-i="${end - 1}"></div></div>`);
    }
    el.innerHTML = `<div class="flow-wrap"><div class="flow">${rows.join("")}</div>` +
      `<div class="flow-info"></div><div class="flow-ctl"><button class="btn primary" data-play>${t.play}</button></div></div>`;
    const nodes = [...el.querySelectorAll(".node")], links = [...el.querySelectorAll(".link")], info = el.querySelector(".flow-info");
    let cur = 0, timer = null;
    const show = (i) => {
      cur = i;
      nodes.forEach((n) => n.classList.toggle("on", +n.dataset.i === i));
      links.forEach((l) => l.classList.toggle("on", +l.dataset.i < i));
      info.innerHTML = `<b>${i + 1}. ${t.flow[i][1]}</b> — ${t.flow[i][3]}`;
    };
    const btn = el.querySelector("[data-play]");
    const stop = () => { clearInterval(timer); timer = null; btn.textContent = t.play; };
    btn.onclick = () => {
      if (timer) return stop();
      btn.textContent = t.pause;
      if (cur >= nodes.length - 1) show(0);
      timer = setInterval(() => { if (cur >= nodes.length - 1) return stop(); show(cur + 1); }, 1500);
    };
    nodes.forEach((n) => (n.onclick = () => { stop(); show(+n.dataset.i); }));
    show(0);
    // autoplay once when visible
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); btn.click(); } }, { threshold: 0.6 });
    io.observe(el);
  }

  function buttons(el, lang) {
    const t = L[lang];
    el.innerHTML = `<div class="btn-demo">${["success", "danger", "primary", "plain"].map((k) => `<button class="bb ${k}" data-k="${k}">${t.btnNames[k]}</button>`).join("")}<div class="demo-note">${t.btnTitle}</div></div>`;
    const note = el.querySelector(".demo-note");
    el.querySelectorAll(".bb").forEach((b) => b.addEventListener("click", (e) => {
      const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
      const rip = document.createElement("span"); rip.className = "rip";
      rip.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
      b.appendChild(rip); setTimeout(() => rip.remove(), 650);
      note.textContent = t.btnMsg[b.dataset.k];
    }));
  }

  function playground(el, lang) {
    const t = L[lang];
    const handlers = [
      { f: 'Command("start")', test: (m) => m.type === "text" && /^\/start(\s|$)/.test(m.text), fn: "cmd_start" },
      { f: 'F.text.startswith("hi")', test: (m) => m.type === "text" && m.text.startsWith("hi"), fn: "greet" },
      { f: "F.photo", test: (m) => m.type === "photo", fn: "got_photo" },
      { f: 'F.text.regexp(r"^\\d+$")', test: (m) => m.type === "text" && /^\d+$/.test(m.text), fn: "numbers" },
      { f: "F.text", test: (m) => m.type === "text", fn: "echo" },
    ];
    el.innerHTML = `<div class="quiz-demo"><p style="margin-top:0">${t.pgHint}</p>` +
      `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px"><input class="pg-input" style="flex:1;min-width:0" value="hi there" spellcheck="false">` +
      `<select class="pg-input" style="width:auto;max-width:100%;font-family:inherit"><option value="text">${t.pgText}</option><option value="photo">${t.pgPhoto}</option></select></div>` +
      `<div class="pg-out"></div></div>`;
    const input = el.querySelector("input"), sel = el.querySelector("select"), out = el.querySelector(".pg-out");
    const run = () => {
      const m = { type: sel.value, text: input.value };
      let won = -1;
      const rows = handlers.map((h, i) => { const ok = h.test(m); if (ok && won < 0) won = i; return ok; });
      out.innerHTML = handlers.map((h, i) =>
        `<div class="pg-row ${i === won ? "ok" : rows[i] ? "" : "no"}"><span>${rows[i] ? "✓" : "✗"}</span><span>@router.message(${h.f})</span>${i === won ? `<b style="margin-inline-start:auto;color:var(--ok)">${t.pgWin}</b>` : ""}</div>`).join("") +
        (won < 0 ? `<div class="pg-row">${t.pgNone}</div>` : "");
    };
    input.oninput = sel.onchange = run; run();
  }

  window.mountWidgets = function (root, lang) {
    root.querySelectorAll("[data-widget]").forEach((el) => {
      const name = el.dataset.widget;
      ({ flow, buttons, playground }[name] || (() => {}))(el, lang);
    });
  };
})();

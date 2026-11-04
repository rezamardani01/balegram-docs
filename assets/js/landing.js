/* Landing page (bilingual) with animated phone demo, counters and the update-flow widget. */
(function () {
  const T = {
    fa: {
      badges: ["async + تایپ‌دار", "پایتون ۳.۱۰+", "متن‌باز · MIT"],
      h1: ['ربات بله بساز،', "سریع و حرفه‌ای"],
      sub: "balegram یک فریم‌ورک ناهمگام (async) برای Bale Bot API است: روتر، میدلور، فیلترهای ترکیبی، ماشین حالت، دکمه‌های رنگی و پوشش کامل متدها، با ساختاری آشنا برای کاربران aiogram.",
      start: "شروع کنید", ref: "مرجع متدها", ghText: "مشاهده در گیت‌هاب",
      stats: [[52, "متد Bot API", ""], [12, "فیلتر آماده", "+"], [80, "تست خودکار", "+"], [100, "تایپ‌دار", "٪"]],
      featTitle: "هر چیزی که برای یک ربات جدی لازم داری", featSub: "از یک ربات ساده تا پروژه‌ی بزرگ و ماژولار؛ بدون اینکه کد درهم و برهم شود.",
      feats: [
        ["🧭", "روتر تو در تو", "ربات را به ماژول‌های جدا تقسیم کن و با include_router کنار هم بگذار.", "/guide/routers"],
        ["🛡️", "میدلور بیرونی و داخلی", "لاگ، آمار، محدودیت نرخ، دیتابیس... یک بار بنویس، همه‌جا اجرا شود.", "/guide/middlewares"],
        ["🔎", "فیلترهای ترکیبی", "فیلتر جادویی F، Command و فیلتر کاستوم با عملگرهای &، | و ~.", "/guide/filters"],
        ["💾", "ماشین حالت (FSM)", "گفتگوهای چندمرحله‌ای با ذخیره‌سازی حافظه یا Redis.", "/guide/fsm"],
        ["🎨", "دکمه‌های رنگی", "سبز، قرمز و آبی با پارامتر style در کیبورد inline.", "/guide/keyboards"],
        ["🧩", "تزریق وابستگی", "هندلر فقط آرگومان‌هایی را که می‌خواهد اعلام می‌کند؛ بقیه خودکار می‌رسد.", "/guide/dependency-injection"],
        ["🌐", "Polling و Webhook", "هر دو با خاموشی تمیز، backoff و کنترل خودکار خطای ۴۲۹.", "/guide/running"],
        ["📦", "پوشش کامل API", "همه‌ی متدها و تایپ‌های مستندات بله به‌صورت تایپ‌دار.", "/reference/methods-messages"],
      ],
      flowTitle: "مسیر یک پیام را ببین", flowSub: "از لحظه‌ای که کاربر پیام می‌دهد تا پاسخ ربات. روی هر مرحله بزن یا انیمیشن را پخش کن.",
      codeTitle: "یک ربات کامل در ۱۵ خط", codeSub: "ربات سمت راست دقیقاً با همین کد ساخته شده است.",
      codeNote: "کد کامل و توضیح خط‌به‌خط در درس «اولین ربات».",
      lessons: "از اینجا شروع کن", lessonCards: [
        ["🚀", "نصب و اولین ربات", "در ۵ دقیقه ربات اولت را بالا بیاور.", "/start/install"],
        ["🏗️", "معماری و مفاهیم", "Bot، Dispatcher، Router و جریان آپدیت‌ها.", "/start/concepts"],
        ["📚", "مرجع متدها", "همه‌ی متدها با پارامتر و مثال کامل.", "/reference/methods-messages"],
        ["🍳", "دستور پخت", "پروژه‌های آماده: مسابقه، نظرسنجی، ربات پرداخت.", "/cookbook/quiz-bot"],
      ],
      chat: { me1: "/start", bot1: "سلام رضا! 👋\nیکی را انتخاب کن:", ok: "تایید", no: "لغو", go: "ادامه", me2: "✅ تایید", bot2: "ثبت شد 🎉\nممنون که ربات من را امتحان کردی.", name: "ربات من", online: "آنلاین" },
    },
    en: {
      badges: ["async + typed", "Python 3.10+", "open source · MIT"],
      h1: ["Build Bale bots,", "fast and professional"],
      sub: "balegram is an asynchronous framework for the Bale Bot API: routers, middlewares, composable filters, a state machine, colored buttons and full method coverage, with a structure familiar to aiogram users.",
      start: "Get started", ref: "Method reference", ghText: "View on GitHub",
      stats: [[52, "Bot API methods", ""], [12, "ready-made filters", "+"], [80, "automated tests", "+"], [100, "typed", "%"]],
      featTitle: "Everything a serious bot needs", featSub: "From a tiny bot to a big modular project, without the code turning into spaghetti.",
      feats: [
        ["🧭", "Nested routers", "Split your bot into modules and plug them together with include_router.", "/guide/routers"],
        ["🛡️", "Outer & inner middlewares", "Logging, stats, rate limits, databases... write once, run everywhere.", "/guide/middlewares"],
        ["🔎", "Composable filters", "The magic F filter, Command and custom filters with &, | and ~.", "/guide/filters"],
        ["💾", "State machine (FSM)", "Multi-step conversations with memory or Redis storage.", "/guide/fsm"],
        ["🎨", "Colored buttons", "Green, red and blue inline buttons via the style parameter.", "/guide/keyboards"],
        ["🧩", "Dependency injection", "Handlers declare only the arguments they need; the rest is automatic.", "/guide/dependency-injection"],
        ["🌐", "Polling & webhook", "Both with graceful shutdown, backoff and automatic 429 handling.", "/guide/running"],
        ["📦", "Full API coverage", "Every method and type of the Bale docs, fully typed.", "/reference/methods-messages"],
      ],
      flowTitle: "Follow a message through the framework", flowSub: "From the moment a user writes to the bot's reply. Click a step or play the animation.",
      codeTitle: "A complete bot in 15 lines", codeSub: "The bot on the right is built with exactly this code.",
      codeNote: "Full code and a line-by-line explanation in the \"First bot\" lesson.",
      lessons: "Start here", lessonCards: [
        ["🚀", "Install & first bot", "Get your first bot running in 5 minutes.", "/start/install"],
        ["🏗️", "Architecture & concepts", "Bot, Dispatcher, Router and the update flow.", "/start/concepts"],
        ["📚", "Method reference", "Every method with parameters and a full example.", "/reference/methods-messages"],
        ["🍳", "Cookbook", "Ready projects: quiz, poll, payment bot.", "/cookbook/quiz-bot"],
      ],
      chat: { me1: "/start", bot1: "Hi Reza! 👋\nChoose one:", ok: "Accept", no: "Cancel", go: "Continue", me2: "✅ Accept", bot2: "Saved 🎉\nThanks for trying my bot.", name: "My bot", online: "online" },
    },
  };

  const CODE = `import asyncio
from balegram import Bot, Dispatcher
from balegram.filters import CommandStart
from balegram.types import ButtonStyle, Message
from balegram.utils import InlineKeyboardBuilder

dp = Dispatcher()

@dp.message(CommandStart())
async def start(message: Message):
    kb = InlineKeyboardBuilder()
    kb.button(text="تایید", callback_data="ok", style=ButtonStyle.SUCCESS)
    kb.button(text="لغو", callback_data="no", style=ButtonStyle.DANGER)
    await message.answer("سلام! 👋", reply_markup=kb.as_markup())

asyncio.run(dp.start_polling(Bot("YOUR_BOT_TOKEN")))`;

  window.renderLanding = function (lang, ui) {
    const t = T[lang], h = (p) => `#/${lang}${p}`;
    const code = window.highlight(CODE, "python");
    return `
    <section class="hero">
      <i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i>
      <div class="hero-in">
        <div>
          <div class="badge-row">${t.badges.map((b) => `<span class="badge"><i></i>${b}</span>`).join("")}</div>
          <h1>${t.h1[0]}<br><span class="grad">${t.h1[1]}</span></h1>
          <p class="sub">${t.sub}</p>
          <div class="cta">
            <a class="btn primary" href="${h("/start/install")}">${t.start} <span>${lang === "fa" ? "←" : "→"}</span></a>
            <a class="btn" href="${h("/reference/methods-messages")}">${t.ref}</a>
            <a class="btn" href="https://github.com/rezamardani01/balegram" target="_blank" rel="noopener">★ ${t.ghText}</a>
          </div>
          <div class="install" data-install title="${ui.copy}"><span class="p">$</span><span>pip install git+https://github.com/rezamardani01/balegram.git</span></div>
        </div>
        <div class="phone"><div class="phone-screen">
          <div class="chat-head"><span class="av">🤖</span><div>${t.chat.name}<small>${t.chat.online}</small></div></div>
          <div class="chat-body" id="chat-body"></div>
        </div></div>
      </div>
    </section>

    <div class="stats">${t.stats.map((s) => `<div class="stat reveal"><b data-count="${s[0]}" data-suffix="${s[2]}">0</b><span>${s[1]}</span></div>`).join("")}</div>

    <section class="section">
      <h2 class="big reveal">${t.featTitle}</h2><p class="sub-c reveal">${t.featSub}</p>
      <div class="feat">${t.feats.map((f) => `<a class="card reveal" href="${h(f[3])}"><span class="em">${f[0]}</span><b>${f[1]}</b><span>${f[2]}</span></a>`).join("")}</div>
    </section>

    <section class="section">
      <h2 class="big reveal">${t.codeTitle}</h2><p class="sub-c reveal">${t.codeSub}</p>
      <div class="reveal"><div class="code"><div class="code-bar"><span class="dots"><i></i><i></i><i></i></span><span class="code-title">bot.py</span><button class="copy" data-copy>${ui.copy}</button></div><pre><code>${code}</code></pre></div>
      <p class="sub-c reveal" style="margin-top:14px">${t.codeNote}</p>
    </section>

    <section class="section">
      <h2 class="big reveal">${t.flowTitle}</h2><p class="sub-c reveal">${t.flowSub}</p>
      <div class="reveal" data-widget="flow"></div>
    </section>

    <section class="section" style="padding-bottom:20px">
      <h2 class="big reveal">${t.lessons}</h2><p class="sub-c"></p>
      <div class="feat">${t.lessonCards.map((f) => `<a class="card reveal" href="${h(f[3])}"><span class="em">${f[0]}</span><b>${f[1]}</b><span>${f[2]}</span></a>`).join("")}</div>
    </section>`;
  };

  let chatTimer = null;
  window.mountLanding = function (root, lang) {
    window.mountWidgets(root, lang);
    const t = T[lang].chat, body = root.querySelector("#chat-body");
    const inst = root.querySelector("[data-install]");
    if (inst) inst.onclick = () => { navigator.clipboard && navigator.clipboard.writeText("pip install git+https://github.com/rezamardani01/balegram.git"); inst.style.transform = "scale(0.96)"; setTimeout(() => (inst.style.transform = ""), 180); };

    // counters
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const end = +e.target.dataset.count, t0 = performance.now();
      const tick = (n) => { const p = Math.min(1, (n - t0) / 1400); e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    root.querySelectorAll("[data-count]").forEach((el) => io.observe(el));

    // chat loop
    clearTimeout(chatTimer);
    const sleep = (ms) => new Promise((r) => (chatTimer = setTimeout(r, ms)));
    const add = (cls, html) => { const d = document.createElement("div"); d.className = `msg ${cls}`; d.innerHTML = html; body.appendChild(d); while (body.children.length > 6) body.firstChild.remove(); return d; };
    const typing = () => { const d = document.createElement("div"); d.className = "typing"; d.innerHTML = "<i></i><i></i><i></i>"; body.appendChild(d); return d; };
    (async function loop() {
      while (document.body.contains(body)) {
        body.innerHTML = "";
        await sleep(900); add("me", t.me1);
        await sleep(500); let ty = typing(); await sleep(1100); ty.remove();
        add("bot", `${t.bot1.replace("\n", "<br>")}<div class="btns"><span class="g">${t.ok}</span><span class="r">${t.no}</span><span class="b">${t.go}</span></div>`);
        await sleep(1800); add("me", t.me2);
        await sleep(500); ty = typing(); await sleep(1000); ty.remove();
        add("bot", t.bot2.replace("\n", "<br>"));
        await sleep(4200);
      }
    })();
  };
})();

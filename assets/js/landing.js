/* Bilingual landing page for the Baleropy documentation site. */
(function () {
  const T = {
    fa: {
      eyebrow: "Baleropy · کتابخانهٔ پایتون برای ربات بله",
      title: ["ربات‌های بله را", "با پایتون بسازید"],
      sub: "یک فریم‌ورک ناهمگام و تایپ‌دار برای ساخت ربات‌های بله؛ با روتر، فیلترهای ترکیبی، میدلور و مدیریت وضعیت گفتگو.",
      start: "شروع راهنما", ref: "مرجع API", github: "مشاهدهٔ مخزن",
      install: "نصب با pip",
      codeTitle: "bot.py",
      featuresTitle: "ابزارهای لازم برای ساخت ربات",
      featuresLead: "ساختاری روشن برای شروع سریع و توسعهٔ پروژه‌های بزرگ‌تر.",
      features: [
        ["01", "روترهای ماژولار", "هندلرها را در بخش‌های مستقل سازمان‌دهی کنید.", "/guide/routers"],
        ["02", "فیلترهای ترکیبی", "رویدادها را با فیلترهای آماده یا سفارشی مدیریت کنید.", "/guide/filters"],
        ["03", "مدیریت وضعیت گفتگو", "فرم‌ها و گفتگوهای چندمرحله‌ای را با FSM بسازید.", "/guide/fsm"],
        ["04", "میدلورها", "منطق مشترک را پیش و پس از اجرای هندلرها به کار بگیرید.", "/guide/middlewares"],
        ["05", "Polling و Webhook", "روش دریافت رویداد را متناسب با استقرار خود انتخاب کنید.", "/guide/running"],
        ["06", "تایپ‌های کامل", "با مدل‌های تایپ‌دار و اعتبارسنجی، مطمئن‌تر توسعه دهید.", "/reference/types"],
      ],
      resourcesTitle: "برای شروع",
      resources: [
        ["راهنمای نصب", "پکیج را نصب کنید و نخستین ربات را اجرا کنید.", "/start/install"],
        ["مفاهیم اصلی", "با اجزای کتابخانه و جریان پردازش رویداد آشنا شوید.", "/start/concepts"],
        ["نمونه‌ها", "الگوهای آماده را در راهنماها و دستورپخت‌ها ببینید.", "/cookbook/quiz-bot"],
      ],
    },
    en: {
      eyebrow: "Baleropy · Python library for Bale bots",
      title: ["Build Bale bots", "with Python"],
      sub: "An asynchronous, typed framework for building Bale bots, with routers, composable filters, middleware and conversation state.",
      start: "Read the guide", ref: "API reference", github: "View repository",
      install: "Install with pip",
      codeTitle: "bot.py",
      featuresTitle: "A focused toolkit for bot development",
      featuresLead: "A clear foundation for quick starts and larger applications.",
      features: [
        ["01", "Modular routers", "Organize handlers into clear, reusable modules.", "/guide/routers"],
        ["02", "Composable filters", "Route events with built-in and custom filters.", "/guide/filters"],
        ["03", "Conversation state", "Build multi-step flows with the FSM tools.", "/guide/fsm"],
        ["04", "Middleware", "Run shared logic before and after handlers.", "/guide/middlewares"],
        ["05", "Polling and webhooks", "Choose an update delivery method that fits your deployment.", "/guide/running"],
        ["06", "Typed models", "Develop with typed models and data validation.", "/reference/types"],
      ],
      resourcesTitle: "Get started",
      resources: [
        ["Installation guide", "Install the package and run your first bot.", "/start/install"],
        ["Core concepts", "Learn the library components and event flow.", "/start/concepts"],
        ["Examples", "Explore practical patterns in the guides and cookbook.", "/cookbook/quiz-bot"],
      ],
    },
  };

  const CODE = `import asyncio

from baleropy import Bot, Dispatcher
from baleropy.filters import CommandStart
from baleropy.types import Message

dp = Dispatcher()

@dp.message(CommandStart())
async def start(message: Message):
    await message.answer("Hello from Baleropy!")

async def main():
    await dp.start_polling(Bot("YOUR_BOT_TOKEN"))

asyncio.run(main())`;

  window.renderLanding = function (lang, ui) {
    const t = T[lang], h = (path) => `#/${lang}${path}`;
    const code = window.highlight(CODE, "python");
    return `
      <section class="hero">
        <div class="hero-in">
          <div class="hero-copy">
            <p class="eyebrow">${t.eyebrow}</p>
            <h1>${t.title[0]}<br><span>${t.title[1]}</span></h1>
            <p class="sub">${t.sub}</p>
            <div class="cta">
              <a class="btn primary" href="${h("/start/install")}">${t.start}</a>
              <a class="btn" href="${h("/reference/methods-messages")}">${t.ref}</a>
              <a class="github-link" href="https://github.com/rezamardani01/Baleropy" target="_blank" rel="noopener">${t.github} ↗</a>
            </div>
            <div class="install"><span>${t.install}</span><button type="button" data-install aria-label="${ui.copy}">pip install baleropy</button></div>
          </div>
          <div class="hero-code">
            <div class="code"><div class="code-bar"><span class="code-title">${t.codeTitle}</span><button class="copy" data-copy>${ui.copy}</button></div><pre><code>${code}</code></pre></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-heading">
          <h2 class="big">${t.featuresTitle}</h2>
          <p class="sub-c">${t.featuresLead}</p>
        </div>
        <div class="feat">${t.features.map((feature) => `
          <a class="card feature-card" href="${h(feature[3])}">
            <span class="feature-index">${feature[0]}</span>
            <b>${feature[1]}</b>
            <span>${feature[2]}</span>
          </a>`).join("")}
        </div>
      </section>

      <section class="section resources-section">
        <div class="section-heading"><h2 class="big">${t.resourcesTitle}</h2></div>
        <div class="resource-list">${t.resources.map((resource, index) => `
          <a class="resource-link" href="${h(resource[2])}">
            <span class="resource-index">0${index + 1}</span>
            <span><b>${resource[0]}</b><small>${resource[1]}</small></span>
            <span class="resource-arrow" aria-hidden="true">↗</span>
          </a>`).join("")}
        </div>
      </section>`;
  };

  window.mountLanding = function (root, lang) {
    const install = root.querySelector("[data-install]");
    if (install) {
      install.onclick = async () => {
        await navigator.clipboard.writeText("pip install baleropy");
        install.dataset.copied = "true";
        setTimeout(() => delete install.dataset.copied, 1400);
      };
    }
    window.mountWidgets(root, lang);
  };
})();

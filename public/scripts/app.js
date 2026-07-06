/* ============================================================
   Talkdub — landing interactions
   (vanilla; mirrors the Astro/Alpine build's behaviours)
   ============================================================ */
(function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- Nav: scrolled state ---------- */
  const nav = $("#nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const sheet = $("#m-sheet");
  const openMenu = () => { if (sheet) { sheet.classList.add("show"); document.body.style.overflow = "hidden"; } };
  const closeMenu = () => { if (sheet) { sheet.classList.remove("show"); document.body.style.overflow = ""; } };
  $("#burger") && $("#burger").addEventListener("click", openMenu);
  $("#m-close") && $("#m-close").addEventListener("click", closeMenu);
  $$("[data-close-menu]").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- Language switcher ---------- */
  $$("[data-lang-btn]").forEach((b) => {
    b.addEventListener("click", () => window.i18n.setLocale(b.getAttribute("data-lang-btn")));
  });

  /* ---------- Pricing toggle (monthly / annual) ---------- */
  const PLANS = {
    starter: { m: 19, a: 16, year: 190 },
    pro:     { m: 59, a: 49, year: 590 },
    team:    { m: 199, a: 166, year: 1990 },
  };
  const billState = { annual: false };
  const saveBadge = $("#save-badge");
  const creditsBand = $("#credits-band");
  const fmt = (n) => n.toLocaleString("en-US");
  function annualNote(year) {
    return window.i18n.locale === "es" ? ("facturado $" + fmt(year) + " al año") : ("billed $" + fmt(year) + "/year");
  }
  function renderPricing() {
    Object.keys(PLANS).forEach((k) => {
      const p = PLANS[k];
      const amt = document.getElementById("amt-" + k);
      const note = document.getElementById("note-" + k);
      if (amt) amt.textContent = "$" + (billState.annual ? p.a : p.m);
      if (note) note.textContent = billState.annual ? annualNote(p.year) : window.i18n.t("billed_month");
    });
    if (saveBadge) saveBadge.style.opacity = billState.annual ? "1" : "0";
    if (creditsBand) creditsBand.style.display = billState.annual ? "none" : "";
    const bnM = $("#bill-notes-monthly"), bnA = $("#bill-notes-annual");
    if (bnM) bnM.style.display = billState.annual ? "none" : "";
    if (bnA) bnA.style.display = billState.annual ? "" : "none";
    $$("[data-bill]").forEach((b) => b.classList.toggle("on", (b.getAttribute("data-bill") === "annual") === billState.annual));
  }
  $$("[data-bill]").forEach((b) => b.addEventListener("click", () => {
    billState.annual = b.getAttribute("data-bill") === "annual";
    renderPricing();
  }));
  window.addEventListener("localechange", renderPricing);
  renderPricing();

  /* ---------- Credits slider (0.5h = $9 trial, then $15/h) ---------- */
  const STEPS = [0.5, 1, 2, 3, 4, 5, 6, 8, 10];
  const range = $("#credit-range");
  const cAmt = $("#credit-amt");
  const cDur = $("#credit-dur-val");
  function priceFor(h) { return h === 0.5 ? 9 : h * 15; }
  function durLabel(h) { return h === 0.5 ? "30 min" : (h % 1 === 0 ? h + " h" : h + " h"); }
  function renderCredit() {
    if (!range) return;
    const i = parseInt(range.value, 10);
    const h = STEPS[i];
    if (cAmt) cAmt.textContent = "$" + priceFor(h);
    if (cDur) cDur.textContent = durLabel(h);
    const pct = (i / (STEPS.length - 1)) * 100;
    range.style.background = "linear-gradient(90deg, var(--green) 0%, var(--cyan) " + pct + "%, var(--surface-3) " + pct + "%)";
  }
  if (range) {
    range.min = 0; range.max = STEPS.length - 1; range.step = 1;
    range.addEventListener("input", renderCredit);
    renderCredit();
  }

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal, [data-stagger]").forEach((el, i) => {
      if (el.hasAttribute("data-stagger")) {
        Array.from(el.children).forEach((c, j) => { c.style.transitionDelay = (j * 70) + "ms"; });
      }
      io.observe(el);
    });
  } else {
    $$(".reveal, [data-stagger]").forEach((el) => el.classList.add("in"));
  }

  /* ---------- Count-up ---------- */
  function countUp(el) {
    const target = parseFloat(el.getAttribute("data-count"));
    const dur = 1100, t0 = performance.now();
    const suffix = el.getAttribute("data-suffix") || "";
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach((el) => reduce ? (el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "")) : cio.observe(el));
  }

  /* ============================================================
     HERO WAVEFORM  — speech-envelope reactive, green→cyan
     ============================================================ */
  const canvas = $("#hero-wave");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const GAP = 4, BARW = 4;
    let bars = [];
    function resize() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(8, Math.floor(W / (BARW + GAP)));
      if (bars.length !== n) bars = new Array(n).fill(0).map(() => 0.06);
    }
    resize();
    window.addEventListener("resize", resize);

    function grad() {
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "#34d3ee");   // input · cyan
      g.addColorStop(0.5, "#3ad7c8");
      g.addColorStop(1, "#3ee0a0");   // output · green
      return g;
    }

    function drawFrame(levels) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = grad();
      const mid = H / 2;
      const n = levels.length;
      const step = W / n;
      for (let i = 0; i < n; i++) {
        const h = Math.max(3, levels[i] * (H * 0.92));
        const x = i * step + (step - BARW) / 2;
        const y = mid - h / 2;
        const rad = BARW / 2;
        ctx.globalAlpha = 0.55 + levels[i] * 0.45;
        roundRect(ctx, x, y, BARW, h, rad);
      }
      ctx.globalAlpha = 1;
      // soft reflection baseline
      ctx.strokeStyle = "rgba(120,180,255,.08)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
    }
    function roundRect(c, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath(); c.fill();
    }

    if (reduce) {
      // static, pleasant frozen waveform
      const n = bars.length;
      const frozen = bars.map((_, i) => {
        const e = 0.5 + 0.5 * Math.sin(i * 0.5);
        const e2 = 0.5 + 0.5 * Math.sin(i * 1.7 + 1);
        return 0.12 + e * e2 * 0.7;
      });
      drawFrame(frozen);
    } else {
      // organic speech envelope: phrase gating + syllable cadence + jitter
      let phase = 0, talking = 1, gateT = 0, gateDur = 80;
      const targets = bars.map(() => 0.06);
      function tick() {
        phase += 0.12;
        gateT++;
        if (gateT > gateDur) {
          gateT = 0;
          if (talking) { // chance to pause between phrases
            if (Math.random() < 0.55) { talking = 0; gateDur = 14 + Math.random() * 26; }
            else gateDur = 50 + Math.random() * 80;
          } else { talking = 1; gateDur = 60 + Math.random() * 110; }
        }
        const n = bars.length;
        // travelling speech pulse centre, so energy "moves" left→right (in→out)
        const travel = (Math.sin(phase * 0.5) * 0.5 + 0.5);
        for (let i = 0; i < n; i++) {
          const pos = i / n;
          if (talking) {
            const syll = 0.5 + 0.5 * Math.sin(phase * 1.6 + i * 0.55);
            const phrase = 0.45 + 0.55 * Math.sin(phase * 0.35 + i * 0.12);
            const focus = 1 - Math.min(1, Math.abs(pos - travel) * 1.6); // emphasis follows travel
            const jit = 0.55 + Math.random() * 0.45;
            targets[i] = Math.max(0.06, (0.18 + syll * phrase * (0.55 + focus * 0.6)) * jit);
          } else {
            targets[i] = 0.05 + Math.random() * 0.05;
          }
          // smooth toward target (attack faster than release)
          const cur = bars[i];
          const k = targets[i] > cur ? 0.45 : 0.16;
          bars[i] = cur + (targets[i] - cur) * k;
        }
        drawFrame(bars);
        requestAnimationFrame(tick);
      }
      tick();
    }
  }

  /* ============================================================
     HERO AUDIO  — voice for the live translation demo
     Hybrid: plays /audio/{lang}-{idx}.mp3 if present, otherwise
     falls back to the browser's Web Speech API (TTS).
     Autoplay-safe: starts muted; the mic button is the unlock gesture.
     ============================================================ */
  const heroAudio = (function () {
    const AUDIO_BASE = "/audio/";
    const LANG_TAG = { es: "es-ES", en: "en-US" };
    const supportsTTS = "speechSynthesis" in window;
    let muted = true;
    let token = 0;          // bumping invalidates any in-flight playback
    let currentEl = null;   // <audio> currently playing, if any

    // Some browsers populate voices lazily — warm them up.
    if (supportsTTS) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    function stop() {
      token++;
      if (currentEl) { try { currentEl.pause(); } catch (e) {} currentEl = null; }
      if (supportsTTS) { try { window.speechSynthesis.cancel(); } catch (e) {} }
    }

    function ttsSpeak(lang, text, myToken) {
      if (!supportsTTS || myToken !== token) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = LANG_TAG[lang] || "en-US";
      const v = window.speechSynthesis
        .getVoices()
        .find((x) => x.lang && x.lang.toLowerCase().startsWith(lang));
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    }

    function speak(lang, idx, text) {
      if (muted) return;
      stop();
      const myToken = token;
      const a = new Audio(AUDIO_BASE + lang + "-" + idx + ".mp3");
      let fellBack = false;
      const fallback = () => {
        if (fellBack || myToken !== token) return;
        fellBack = true;
        ttsSpeak(lang, text, myToken); // no real clip → use browser TTS
      };
      a.addEventListener("error", fallback);
      currentEl = a;
      a.play().catch(fallback);
    }

    return {
      speak: speak,
      stop: stop,
      isMuted: function () { return muted; },
      toggle: function () { muted = !muted; if (muted) stop(); return muted; },
    };
  })();

  /* ============================================================
     LIVE TYPING DEMO  — ES input → EN output, cycling (+ voice)
     ============================================================ */
  const inEl = $("#lane-in");
  const outEl = $("#lane-out");
  const micBtn = $("#vmic-toggle");
  const demoBtn = $("#hero-demo");

  // Track the line on screen so unmuting gives instant feedback.
  let curLine = { lang: "es", idx: 0, text: "" };

  const syncMicUI = () => {
    if (!micBtn) return;
    const m = heroAudio.isMuted();
    micBtn.classList.toggle("muted", m);
    micBtn.setAttribute("aria-pressed", String(!m));
    const label = window.i18n ? window.i18n.t(m ? "con_unmute" : "con_mute") : (m ? "Tap to hear" : "Mute");
    micBtn.setAttribute("aria-label", label);
    micBtn.setAttribute("title", label);
  };

  // Shared by the console mic and the hero "Ver demo" button.
  function toggleAudio() {
    const nowMuted = heroAudio.toggle();
    syncMicUI();
    if (!nowMuted) heroAudio.speak(curLine.lang, curLine.idx, curLine.text);
  }

  if (micBtn) {
    micBtn.addEventListener("click", toggleAudio);
    window.addEventListener("localechange", syncMicUI);
    syncMicUI();
  }
  if (demoBtn) {
    demoBtn.addEventListener("click", (e) => { e.preventDefault(); toggleAudio(); });
  }

  if (inEl && outEl) {
    const pairs = [
      { es: "Hola, gracias por venir hoy.", en: "Hi, thanks for joining today." },
      { es: "¿Arrancamos con la demo?", en: "Shall we start with the demo?" },
      { es: "Me encanta trabajar con ustedes.", en: "I love working with your team." },
    ];
    const CUR = '<span class="cur"></span>';
    if (reduce) {
      inEl.textContent = pairs[0].es;
      outEl.textContent = pairs[0].en;
      curLine = { lang: "es", idx: 0, text: pairs[0].es };
    } else {
      let idx = 0;
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      async function type(el, text, speed) {
        el.innerHTML = CUR;
        for (let i = 0; i <= text.length; i++) {
          el.innerHTML = text.slice(0, i) + CUR;
          await wait(speed + Math.random() * 26);
        }
      }
      async function loop() {
        while (true) {
          const i = idx % pairs.length;
          const p = pairs[i];
          outEl.innerHTML = "";
          curLine = { lang: "es", idx: i, text: p.es };
          heroAudio.speak("es", i, p.es);   // ES voice as the Spanish line types
          await type(inEl, p.es, 34);
          await wait(220);                  // "processing"
          curLine = { lang: "en", idx: i, text: p.en };
          heroAudio.speak("en", i, p.en);   // EN voice as the English line types
          await type(outEl, p.en, 30);
          await wait(2200);
          inEl.innerHTML = ""; outEl.innerHTML = "";
          heroAudio.stop();
          await wait(360);
          idx++;
        }
      }
      loop();
    }
  }

  /* ---------- Whitelist forms ---------- */
  function copy(key, fallback) {
    return window.i18n && typeof window.i18n.t === "function" ? window.i18n.t(key) : fallback;
  }

  $$("[data-wl-form]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector("button");
      const status = form.parentElement && form.parentElement.querySelector("[data-wl-status]");
      if (!input || !btn) return;
      if (!input.reportValidity()) return;

      const prev = btn.textContent;
      btn.disabled = true;
      btn.textContent = copy("final_loading", "Saving...");
      if (status) status.textContent = "";

      try {
        const res = await fetch("/api/whitelist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: input.value.trim() }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          form.reset();
          if (status) status.textContent = copy("final_success", "Done. You're on the whitelist.");
        } else if (res.status === 409 || data.error === "already_registered") {
          if (status) status.textContent = copy("final_already", "This email is already on the whitelist.");
        } else {
          if (status) status.textContent = copy("final_error", "We couldn't save your email. Try again in a few seconds.");
        }
      } catch {
        if (status) status.textContent = copy("final_error", "We couldn't save your email. Try again in a few seconds.");
      } finally {
        btn.disabled = false;
        btn.textContent = prev;
      }
    });
  });
})();

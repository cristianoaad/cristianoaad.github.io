/* Cristiano Diniz · Portfólio
   Idioma (PT/EN), tema claro/escuro, seção ativa no menu e gráfico do TCC. */
(function () {
  "use strict";
  var root = document.documentElement;

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* armazenamento indisponível */ }
  }
  function lang() { return root.getAttribute("data-lang") === "en" ? "en" : "pt"; }

  /* ---------------- idioma ---------------- */
  var langButtons = document.querySelectorAll("[data-set-lang]");
  function applyLang(l, persist) {
    root.setAttribute("data-lang", l);
    root.setAttribute("lang", l === "en" ? "en" : "pt-BR");
    langButtons.forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-set-lang") === l ? "true" : "false");
    });
    var tb = document.getElementById("themeToggle");
    if (tb) tb.setAttribute("aria-label", l === "en" ? "Toggle light/dark theme" : "Alternar tema claro/escuro");
    if (persist) {
      store("cd-lang", l);
      try {
        var u = new URL(location.href);
        if (u.searchParams.has("lang")) { u.searchParams.set("lang", l); history.replaceState(null, "", u); }
      } catch (e) {}
    }
    renderChart();
  }
  langButtons.forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-set-lang"), true); });
  });

  /* ---------------- tema ---------------- */
  var themeBtn = document.getElementById("themeToggle");
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("cd-theme", next);
    });
  }

  /* ---------------- seção ativa ---------------- */
  var navLinks = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { navLinks[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove("active"); });
        var a = navLinks[en.target.id];
        if (a) {
          a.classList.add("active");
          var nav = a.parentElement;
          if (nav && nav.scrollWidth > nav.clientWidth) {
            nav.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
          }
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------------- gráfico do TCC ---------------- */
  var CTX = [
    { pt: "Educacional", en: "Educational" },
    { pt: "Podcast", en: "Podcast" },
    { pt: "Pessoal / emocional", en: "Personal / emotional" }
  ];
  var MODELS = [
    { cls: "s1", pt: "SVM (clássico)", en: "SVM (classic)" },
    { cls: "s2", pt: "BERTimbau (fine-tuned)", en: "BERTimbau (fine-tuned)" },
    { cls: "s3", pt: "mDeBERTa (zero-shot)", en: "mDeBERTa (zero-shot)" }
  ];
  var F1 = [[0.3746, 0.3709, 0.2653], [0.3293, 0.2972, 0.2339], [0.3222, 0.3669, 0.1949]];
  var ACC = [[0.653, 0.660, 0.313], [0.570, 0.523, 0.368], [0.592, 0.651, 0.422]];

  function fmt(v, d) {
    var s = v.toFixed(d);
    return lang() === "pt" ? s.replace(".", ",") : s;
  }
  function pct(v) { return fmt(v * 100, 1) + "%"; }

  var svgNS = "http://www.w3.org/2000/svg";
  function el(name, attrs, parent) {
    var n = document.createElementNS(svgNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function topRounded(x, y, w, h, r) {
    var b = y + h; r = Math.min(r, h);
    return "M" + x + "," + b + " V" + (y + r) + " Q" + x + "," + y + " " + (x + r) + "," + y +
      " H" + (x + w - r) + " Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) + " V" + b + " Z";
  }

  function renderChart() {
    var card = document.getElementById("tccChart");
    if (!card) return;
    var svg = card.querySelector(".chart-svg");
    var tip = card.querySelector(".tooltip");
    var L = lang();
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    /* desenha na largura real do contêiner para manter o texto em tamanho legível */
    var W = Math.max(280, Math.round(svg.parentElement.clientWidth || 560));
    var narrow = W < 460;
    var H = narrow ? 270 : 280, m = { l: 36, r: 4, t: 22, b: narrow ? 46 : 36 };
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var pw = W - m.l - m.r, ph = H - m.t - m.b, yMax = 0.44;
    var y = function (v) { return m.t + ph * (1 - v / yMax); };

    var grid = el("g", { "class": "grid" }, svg);
    var axis = el("g", { "class": "axis" }, svg);
    [0, 0.1, 0.2, 0.3, 0.4].forEach(function (t) {
      el("line", { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), "class": t === 0 ? "base" : "" }, grid);
      var tx = el("text", { x: m.l - 8, y: y(t) + 4, "text-anchor": "end" }, axis);
      tx.textContent = fmt(t, 1);
    });

    var gw = pw / CTX.length, gap = 2;
    var bw = Math.max(16, Math.min(36, Math.floor((gw - 18 - gap * 2) / 3)));
    var groupW = bw * 3 + gap * 2;
    var bars = el("g", {}, svg), labels = el("g", {}, svg), hits = el("g", {}, svg);

    CTX.forEach(function (c, gi) {
      var gx = m.l + gi * gw + (gw - groupW) / 2;
      var best = F1[gi].indexOf(Math.max.apply(null, F1[gi]));
      var cx = m.l + gi * gw + gw / 2;
      var xl = el("text", { x: cx, y: narrow ? H - 26 : H - 12, "class": "xlab" }, svg);
      var parts = narrow ? c[L].split(" / ") : [c[L]];
      parts.forEach(function (part, pi) {
        var ts = el("tspan", { x: cx, dy: pi === 0 ? 0 : 15 }, xl);
        ts.textContent = part + (pi < parts.length - 1 ? " /" : "");
      });

      MODELS.forEach(function (mo, mi) {
        var v = F1[gi][mi], x = gx + mi * (bw + gap), yy = y(v), h = y(0) - yy;
        var bar = el("path", { d: topRounded(x, yy, bw, h, 4), "class": "bar " + mo.cls }, bars);
        if (mi === best) {
          var vl = el("text", { x: x + bw / 2, y: yy - 6, "class": "vlab" }, labels);
          vl.textContent = fmt(v, 3);
        }
        var label = mo[L] + " · " + c[L] + ": F1-macro " + fmt(v, 3) + ", " + (L === "pt" ? "acurácia " : "accuracy ") + pct(ACC[gi][mi]);
        var hit = el("rect", { x: x - gap / 2, y: m.t, width: bw + gap, height: ph, "class": "hit", tabindex: "0", role: "img", "aria-label": label }, hits);

        function show() {
          svg.classList.add("dim");
          bar.classList.add("hot");
          tip.innerHTML = "<b>" + mo[L] + "</b><br>" + c[L] +
            '<div class="tt-row"><span>F1-macro</span><span>' + fmt(v, 3) + "</span></div>" +
            '<div class="tt-row"><span>' + (L === "pt" ? "Acurácia" : "Accuracy") + "</span><span>" + pct(ACC[gi][mi]) + "</span></div>";
          var s = svg.getBoundingClientRect().width / W;
          var left = (x + bw / 2) * s, top = yy * s;
          var bodyW = svg.getBoundingClientRect().width;
          tip.hidden = false;
          var tw = tip.offsetWidth;
          left = Math.max(tw / 2 + 4, Math.min(bodyW - tw / 2 - 4, left));
          tip.style.left = left + "px";
          tip.style.top = top + "px";
        }
        function hide() {
          svg.classList.remove("dim");
          bar.classList.remove("hot");
          tip.hidden = true;
        }
        hit.addEventListener("mouseenter", show);
        hit.addEventListener("mouseleave", hide);
        hit.addEventListener("focus", show);
        hit.addEventListener("blur", hide);
        hit.addEventListener("touchstart", show, { passive: true });
      });
    });

    /* tabela: decimal conforme o idioma */
    card.querySelectorAll("td").forEach(function (td) {
      var raw = td.getAttribute("data-v") || td.textContent.trim();
      td.setAttribute("data-v", raw);
      var strong = td.querySelector("strong");
      var txt = fmt(parseFloat(raw), 3);
      if (strong) strong.textContent = txt; else td.textContent = txt;
    });
  }

  var lastW = 0, rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var c = document.querySelector("#tccChart .chart-body");
      if (c && Math.abs(c.clientWidth - lastW) > 8) { lastW = c.clientWidth; renderChart(); }
    }, 150);
  });

  applyLang(lang(), false);
})();

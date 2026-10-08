(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- загрузка ---------- */
  window.addEventListener("load", function () { document.body.classList.add("is-loaded"); });
  setTimeout(function () { document.body.classList.add("is-loaded"); }, 1000);

  /* ---------- мобильная панель ---------- */
  var mbar = document.getElementById("mbar");
  window.addEventListener("scroll", function () {
    if (mbar) mbar.classList.toggle("is-on", window.scrollY > window.innerHeight * 0.6);
  }, { passive: true });

  /* ---------- мобильное меню ---------- */
  var mmenu = document.getElementById("mmenu");
  var burger = document.getElementById("burger");
  function menu(open) {
    mmenu.classList.toggle("is-open", open);
    mmenu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { menu(true); });
  document.getElementById("mclose").addEventListener("click", function () { menu(false); });
  mmenu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });

  /* ---------- появление при скролле ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  /* ?shot — служебный режим для скриншотов: показать все блоки сразу */
  if (/[?&]shot/.test(location.search)) { document.documentElement.style.scrollBehavior = "auto"; document.querySelectorAll(".rv").forEach(function (el) { el.classList.add("is-in"); }); }
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  /* ---------- счётчики ---------- */
  var nums = document.querySelectorAll("[data-count]");
  if (nums.length && !reduce) {
    nums.forEach(function (el) { el.textContent = "0"; });
    new IntersectionObserver(function (es, obs) {
      if (!es[0].isIntersecting) return;
      nums.forEach(function (el, i) {
        var to = +el.dataset.count, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / 1400);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        }
        setTimeout(function () { requestAnimationFrame(step); }, i * 200);
      });
      obs.disconnect();
    }, { threshold: 0.4 }).observe(nums[0].closest(".stats"));
  }

  /* ---------- форматы: аккордеон + смена фото ---------- */
  var accs = document.querySelectorAll(".acc");
  var fmtImgs = document.querySelectorAll("#fmtMedia img");
  var fmtLabel = document.getElementById("fmtLabel");
  var LABELS = ["01 · Очно", "02 · Индивидуально", "03 · Дистанционно", "04 · На вашем аппарате"];
  accs.forEach(function (acc) {
    acc.querySelector(".acc__btn").addEventListener("click", function () {
      var i = +acc.dataset.i;
      accs.forEach(function (a) {
        var on = a === acc;
        a.classList.toggle("is-open", on);
        a.querySelector(".acc__btn").setAttribute("aria-expanded", String(on));
      });
      fmtImgs.forEach(function (img, k) { img.classList.toggle("is-on", k === i); });
      if (fmtLabel) fmtLabel.textContent = LABELS[i];
    });
  });

  /* ---------- каталог ---------- */
  var C = window.COURSES || [], D = window.DIRS || {};
  var state = { level: "all", format: "all", dirs: [] };
  var LEVEL_ALLOWS = { all: ["zero", "spec", "med"], zero: ["zero"], spec: ["zero", "spec"], med: ["zero", "spec", "med"] };
  var FMT = { ochno: "Очно", ind: "Индивидуально", dist: "Дистанционно" };
  var LVL = { zero: "без требований", spec: "высшее или СПО", med: "медобразование" };
  var cards = document.getElementById("cards");
  var chips = document.getElementById("dirChips");
  var empty = document.getElementById("empty");
  var countNote = document.getElementById("countNote");

  function rub(n) { return n.toLocaleString("ru-RU").replace(/ |,/g, " ") + " ₽"; }
  function matches(c, ignoreDir) {
    if (LEVEL_ALLOWS[state.level].indexOf(c.level) < 0) return false;
    if (state.format !== "all" && c.format !== state.format) return false;
    if (!ignoreDir && state.dirs.length && state.dirs.indexOf(c.dir) < 0) return false;
    return true;
  }
  function renderChips() {
    chips.innerHTML = "";
    Object.keys(D).forEach(function (k) {
      var n = C.filter(function (c) { return c.dir === k && matches(c, true); }).length;
      var b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.setAttribute("aria-pressed", String(state.dirs.indexOf(k) >= 0));
      b.innerHTML = D[k] + ' <span class="n">' + n + "</span>";
      b.disabled = n === 0 && state.dirs.indexOf(k) < 0;
      b.addEventListener("click", function () {
        var i = state.dirs.indexOf(k);
        if (i >= 0) state.dirs.splice(i, 1); else state.dirs.push(k);
        render();
      });
      chips.appendChild(b);
    });
  }
  function render() {
    var list = C.filter(function (c) { return matches(c); });
    cards.innerHTML = list.map(function (c, i) {
      var price = c.price ? (c.from ? "<small>от </small>" : "") + rub(c.price) : "<small>по запросу</small>";
      return '<a class="card" href="' + (c.url || "#final") + '" style="animation-delay:' + Math.min(i, 8) * 35 + 'ms">' +
        '<div class="card__img"><img src="assets/img/courses/' + c.img + '" alt="" loading="lazy"><span class="pill">' + FMT[c.format] + "</span></div>" +
        '<div class="card__body"><div class="card__meta"><span>' + D[c.dir] + "</span><span>" + c.hours + "</span></div>" +
        "<h3>" + c.t + "</h3><p>" + c.d + "</p>" +
        '<div class="card__foot"><span class="card__price tnum">' + price + '</span><span class="card__lvl' + (c.level === "med" ? " med" : "") + '">' + LVL[c.level] + "</span></div></div></a>";
    }).join("");
    empty.classList.toggle("is-on", list.length === 0);
    countNote.textContent = "Показано " + list.length + " из 61 программы";
    renderChips();
  }
  function setSeg(name, v) {
    state[name] = v;
    document.querySelectorAll('[data-filter="' + name + '"] button').forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.v === v));
    });
    state.dirs = state.dirs.filter(function (k) { return C.some(function (c) { return c.dir === k && matches(c, true); }); });
    render();
  }
  document.querySelectorAll("[data-filter] button").forEach(function (b) {
    b.addEventListener("click", function () { setSeg(b.parentElement.dataset.filter, b.dataset.v); });
  });

  function goCatalog() { document.getElementById("catalog").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
  document.querySelectorAll(".level[data-level]").forEach(function (b) {
    b.addEventListener("click", function () { setSeg("level", b.dataset.level); goCatalog(); });
  });
  document.querySelectorAll("[data-format]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); setSeg("format", a.dataset.format); goCatalog(); });
  });
  if (cards) render();

  /* ---------- форма ----------
     Отправка пока не подключена: при загрузке на хостинг указать обработчик
     (CRM, почта или Telegram-бот) в функции send(). */
  var form = document.getElementById("leadForm");
  function send(data) { return Promise.resolve(data); }
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    ["name", "phone"].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim() || (n === "phone" && f.value.replace(/\D/g, "").length < 10);
      f.classList.toggle("is-bad", bad);
      if (bad) ok = false;
    });
    var pd = form.elements.pd;
    pd.closest("label").classList.toggle("is-bad", !pd.checked);
    if (!pd.checked) ok = false;
    if (!ok) return;
    send(Object.fromEntries(new FormData(form))).then(function () {
      document.getElementById("formOk").classList.add("is-on");
      form.querySelector("[type=submit]").disabled = true;
    });
  });

  /* ---------- плашка записи на странице курса ---------- */
  var buybar = document.getElementById("buybar");
  var buyAnchor = document.querySelector("[data-buybar-after]");
  var finalEl = document.getElementById("final");
  if (buybar && buyAnchor) {
    window.addEventListener("scroll", function () {
      var past = buyAnchor.getBoundingClientRect().bottom < 0;
      var atForm = finalEl && finalEl.getBoundingClientRect().top < window.innerHeight * 0.8;
      buybar.classList.toggle("is-on", past && !atForm);
    }, { passive: true });
  }
})();

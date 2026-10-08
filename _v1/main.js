(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- загрузка: запуск анимаций hero ---------- */
  window.addEventListener("load", function () { document.body.classList.add("is-loaded"); });
  setTimeout(function () { document.body.classList.add("is-loaded"); }, 1200);

  /* ---------- шапка ---------- */
  var header = document.getElementById("header");
  var mbar = document.getElementById("mbar");
  var hero = document.querySelector(".hero");
  function onScroll() {
    var y = window.scrollY;
    var limit = hero ? hero.offsetHeight - 80 : 200;
    header.classList.toggle("is-solid", y > limit);
    if (mbar) mbar.classList.toggle("is-on", y > window.innerHeight * 0.6);
    parallax();
  }

  /* ---------- параллакс фото аппарата ---------- */
  var px = document.querySelectorAll("[data-parallax]");
  function parallax() {
    if (reduce) return;
    px.forEach(function (img) {
      var r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.transform = "translateY(" + (p * -6 - 6) + "%)";
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

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
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
  document.querySelectorAll(".rv, .gridlines").forEach(function (el) { io.observe(el); });

  /* ---------- счётчики в hero ---------- */
  function countUp(el, delay) {
    var to = +el.dataset.count, t0 = null, dur = 1600;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    }
    setTimeout(function () { requestAnimationFrame(step); }, delay);
  }
  var statsEl = document.querySelector(".stats");
  if (statsEl && !reduce) {
    var nums = statsEl.querySelectorAll("[data-count]");
    nums.forEach(function (el) { el.textContent = "0"; });
    new IntersectionObserver(function (es, obs) {
      if (!es[0].isIntersecting) return;
      nums.forEach(function (el, i) { countUp(el, 200 + i * 300); });
      obs.disconnect();
    }, { threshold: 0.3 }).observe(statsEl);
  }

  /* ---------- каталог ---------- */
  var C = window.COURSES || [], D = window.DIRS || {};
  var state = { level: "all", format: "all", dirs: [] };
  var LEVEL_ALLOWS = { all: ["zero", "spec", "med"], zero: ["zero"], spec: ["zero", "spec"], med: ["zero", "spec", "med"] };
  var FMT = { ochno: "Очно", ind: "Индивидуально", dist: "Дистанционно" };
  var LVL = { zero: "Без требований к образованию", spec: "Высшее или среднее образование", med: "Нужно медобразование" };
  var HINT = {
    all: "Покажем только курсы, на которые вас могут принять с вашим образованием.",
    zero: "Курсы, на которые принимают без профильного образования.",
    spec: "Добавили курсы для тех, у кого есть высшее или среднее профобразование.",
    med: "Все курсы, включая инъекционные и сестринское дело."
  };
  var cards = document.getElementById("cards");
  var chips = document.getElementById("dirChips");
  var empty = document.getElementById("empty");
  var countNote = document.getElementById("countNote");

  function rub(n) { return n.toLocaleString("ru-RU").replace(/,/g, " ") + " ₽"; }
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
      if (b.disabled) b.style.opacity = ".45";
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
      var price = c.price ? (c.from ? "<small>от </small>" : "") + rub(c.price) : '<small>по запросу</small>';
      return '<a class="card" href="#final" style="animation-delay:' + Math.min(i, 8) * 40 + 'ms">' +
        '<div class="card__img"><img src="assets/img/courses/' + c.img + '" alt="" loading="lazy">' +
        '<span class="card__fmt' + (c.format === "dist" ? " is-dist" : "") + '">' + FMT[c.format] + "</span></div>" +
        '<div class="card__body"><div class="card__meta mono"><span>' + D[c.dir] + "</span><span>" + c.hours + "</span></div>" +
        "<h3>" + c.t + "</h3><p>" + c.d + "</p>" +
        '<div class="card__foot"><span class="card__price tnum">' + price + '</span><span class="card__lvl">' + LVL[c.level] + "</span></div></div></a>";
    }).join("");
    empty.classList.toggle("is-on", list.length === 0);
    countNote.textContent = "Показано " + list.length + " из 61 программы. Полный список — в каталоге.";
    document.getElementById("levelHint").textContent = HINT[state.level];
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

  /* входы из hero и кнопки формата ведут в каталог с фильтром */
  function goCatalog() { document.getElementById("catalog").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
  document.querySelectorAll(".entry[data-level]").forEach(function (b) {
    b.addEventListener("click", function () { setSeg("level", b.dataset.level); goCatalog(); });
  });
  document.querySelectorAll("[data-format]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); setSeg("format", a.dataset.format === "ochno" ? "ochno" : "dist"); goCatalog(); });
  });
  render();

  /* ---------- форма ----------
     Отправка пока не подключена: при загрузке на хостинг указать обработчик
     (CRM, почта или Telegram-бот) в функции send(). */
  var form = document.getElementById("leadForm");
  function send(data) { return Promise.resolve(data); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    ["name", "phone"].forEach(function (n) {
      var f = form.elements[n];
      var bad = !f.value.trim() || (n === "phone" && f.value.replace(/\D/g, "").length < 10);
      f.style.borderColor = bad ? "#B4462E" : "";
      if (bad) ok = false;
    });
    var pd = form.elements.pd;
    pd.parentElement.style.color = pd.checked ? "" : "#B4462E";
    if (!pd.checked) ok = false;
    if (!ok) return;
    send(Object.fromEntries(new FormData(form))).then(function () {
      document.getElementById("formOk").classList.add("is-on");
      form.querySelector("[type=submit]").disabled = true;
    });
  });
})();

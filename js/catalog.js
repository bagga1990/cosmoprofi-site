/* Каталог курсов /kursy/: фильтры, поиск, сортировка, синхронизация с URL.
   Данные — window.CATALOG и window.CATALOG_DIRS из catalog-data.js.
   Параметры URL: ?format=ochno|ind|dist  ?level=zero|spec|med  ?dir=face,laser  ?q=текст  ?sort=asc|desc
   Атрибуты разметки намеренно отличаются от главной (data-cf вместо data-filter, #catCards вместо #cards),
   чтобы main.js не перехватывал элементы каталога. */
(function () {
  "use strict";
  var C = window.CATALOG || [], D = window.CATALOG_DIRS || {};
  var cards = document.getElementById("catCards");
  if (!cards) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TOTAL = C.length;
  var LEVEL_ALLOWS = { all: ["zero", "spec", "med"], zero: ["zero"], spec: ["zero", "spec"], med: ["zero", "spec", "med"] };
  var FMT = { ochno: "Очно", ind: "Индивидуально", dist: "Дистанционно" };
  var LVL = { zero: "без требований", spec: "высшее или СПО", med: "медобразование" };
  var SORTS = ["default", "asc", "desc"];
  var state = { level: "all", format: "all", dirs: [], q: "", sort: "default" };

  var chips = document.getElementById("catChips");
  var empty = document.getElementById("catEmpty");
  var count = document.getElementById("catCount");
  var reset = document.getElementById("catReset");
  var search = document.getElementById("catSearch");
  var searchBox = search ? search.closest(".csearch") : null;

  function rub(n) { return n.toLocaleString("ru-RU").replace(/\s|,/g, " ") + " ₽"; }
  function norm(s) { return String(s || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim(); }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }

  function matches(c, ignoreDir) {
    if (LEVEL_ALLOWS[state.level].indexOf(c.level) < 0) return false;
    if (state.format !== "all" && c.format !== state.format) return false;
    if (!ignoreDir && state.dirs.length && state.dirs.indexOf(c.dir) < 0) return false;
    if (state.q) {
      var words = norm(state.q).split(" "), t = norm(c.t);
      for (var i = 0; i < words.length; i++) if (t.indexOf(words[i]) < 0) return false;
    }
    return true;
  }

  function sorted(list) {
    if (state.sort === "default") return list;
    var dir = state.sort === "asc" ? 1 : -1;
    return list.map(function (c, i) { return { c: c, i: i }; }).sort(function (a, b) {
      var pa = a.c.price, pb = b.c.price;
      if (pa == null && pb == null) return a.i - b.i;
      if (pa == null) return 1;            // «по запросу» — всегда в конце
      if (pb == null) return -1;
      return (pa - pb) * dir || a.i - b.i;
    }).map(function (x) { return x.c; });
  }

  function cardHTML(c, i) {
    var price = c.price ? (c.from ? "<small>от </small>" : "") + rub(c.price) : "<small>по запросу</small>";
    var meta = "<span>" + D[c.dir] + "</span>" + (c.hours ? "<span>" + c.hours + "</span>" : "");
    return '<a class="card" href="' + (c.url ? "../" + c.url : "#final") + '"' + (c.url ? "" : ' data-course="' + esc(c.t) + '"') +
      ' style="animation-delay:' + Math.min(i, 8) * 35 + 'ms">' +
      '<div class="card__img"><img src="../assets/img/courses/' + c.img + '" alt="" loading="lazy"><span class="pill">' + FMT[c.format] + "</span></div>" +
      '<div class="card__body"><div class="card__meta">' + meta + "</div>" +
      "<h3>" + c.t + "</h3><p>" + c.d + "</p>" +
      '<div class="card__foot"><span class="card__price tnum">' + price + '</span><span class="card__lvl' + (c.level === "med" ? " med" : "") + '">' + LVL[c.level] + "</span></div></div></a>";
  }

  function renderChips() {
    chips.innerHTML = "";
    Object.keys(D).forEach(function (k) {
      var n = C.filter(function (c) { return c.dir === k && matches(c, true); }).length;
      var on = state.dirs.indexOf(k) >= 0;
      var b = document.createElement("button");
      b.className = "chip";
      b.type = "button";
      b.setAttribute("aria-pressed", String(on));
      b.innerHTML = D[k] + ' <span class="n">' + n + "</span>";
      b.disabled = n === 0 && !on;
      b.addEventListener("click", function () {
        var i = state.dirs.indexOf(k);
        if (i >= 0) state.dirs.splice(i, 1); else state.dirs.push(k);
        update();
      });
      chips.appendChild(b);
    });
  }

  function syncSegs() {
    document.querySelectorAll("[data-cf]").forEach(function (g) {
      var name = g.dataset.cf;
      g.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === state[name])); });
    });
    if (search && search.value !== state.q) search.value = state.q;
    if (searchBox) searchBox.classList.toggle("has-q", !!state.q);
  }

  function isFiltered() { return state.level !== "all" || state.format !== "all" || state.dirs.length || state.q; }

  function render() {
    var list = sorted(C.filter(function (c) { return matches(c); }));
    cards.innerHTML = list.map(cardHTML).join("");
    empty.classList.toggle("is-on", list.length === 0);
    cards.style.display = list.length ? "" : "none";
    count.innerHTML = isFiltered()
      ? "Найдено <b>" + list.length + "</b> " + plural(list.length, "программа", "программы", "программ") + " из " + TOTAL
      : "Все <b>" + TOTAL + "</b> " + plural(TOTAL, "программа", "программы", "программ");
    reset.hidden = !isFiltered();
    renderChips();
    syncSegs();
  }

  function writeURL() {
    var p = new URLSearchParams(location.search);
    ["format", "level", "dir", "q", "sort"].forEach(function (k) { p.delete(k); });
    if (state.format !== "all") p.set("format", state.format);
    if (state.level !== "all") p.set("level", state.level);
    if (state.dirs.length) p.set("dir", state.dirs.join(","));
    if (state.q) p.set("q", state.q);
    if (state.sort !== "default") p.set("sort", state.sort);
    var qs = p.toString().replace(/%2C/g, ",");
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash); } catch (e) { /* file:// и т. п. */ }
  }

  function readURL(search) {
    var p = new URLSearchParams(search);
    var f = p.get("format"), l = p.get("level"), d = p.get("dir"), q = p.get("q"), s = p.get("sort");
    state.format = FMT[f] ? f : "all";
    state.level = LVL[l] ? l : "all";
    state.dirs = d ? d.split(",").filter(function (k, i, a) { return D[k] && a.indexOf(k) === i; }) : [];
    state.q = q ? q.slice(0, 80) : "";
    state.sort = SORTS.indexOf(s) >= 0 ? s : "default";
  }

  /* Убираем выбранные направления, в которых при новом уровне/формате нет курсов */
  function pruneDirs() {
    state.dirs = state.dirs.filter(function (k) { return C.some(function (c) { return c.dir === k && matches(c, true); }); });
  }

  function update() { render(); writeURL(); }

  /* --- события --- */
  document.querySelectorAll("[data-cf] button").forEach(function (b) {
    b.addEventListener("click", function () {
      state[b.parentElement.dataset.cf] = b.dataset.v;
      if (b.parentElement.dataset.cf !== "sort") pruneDirs();
      update();
    });
  });

  var tmr;
  if (search) {
    search.addEventListener("input", function () {
      clearTimeout(tmr);
      tmr = setTimeout(function () { state.q = search.value.trim(); update(); }, 150);
    });
    search.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { search.value = ""; state.q = ""; update(); }
      if (e.key === "Enter") { e.preventDefault(); search.blur(); }
    });
  }
  var x = document.getElementById("catSearchX");
  if (x) x.addEventListener("click", function () { state.q = ""; update(); search.focus(); });

  function resetAll() { state.level = "all"; state.format = "all"; state.dirs = []; state.q = ""; update(); }
  reset.addEventListener("click", resetAll);
  document.querySelectorAll("[data-cat-reset]").forEach(function (b) { b.addEventListener("click", resetAll); });

  /* Ссылки вида "?format=ochno" на этой же странице (меню, подвал, блоки) — без перезагрузки */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="?"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    readURL(a.getAttribute("href"));
    update();
    document.getElementById("catalog").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  /* Карточка без своей страницы ведёт к форме — подставляем название курса в заявку */
  cards.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-course]");
    var field = document.getElementById("f-course");
    if (a && field) field.value = a.dataset.course;
  });

  readURL(location.search);
  render();
})();

/* Tibbiy psixologiya RTR — iOS uslubidagi bir sahifali ilova (internetsiz işlaydi) */
(function () {
  'use strict';
  var P = window.PSX, B = P.blocks;
  var view = document.getElementById('view');
  var nav = document.getElementById('nav');
  var navBack = document.getElementById('navBack');
  var navTitle = document.getElementById('navTitle');
  var navRight = document.getElementById('navRight');

  /* ---------- Yordamçilar ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function ic(id, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : '') + '><use href="#i-' + id + '"/></svg>'; }
  var LS = 'psx1:';
  function get(k, d) { try { var v = localStorage.getItem(LS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) {} }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function uniq(a) { var s = {}; return a.filter(function (x) { return s[x] ? false : (s[x] = 1); }); }
  function posterSrc(f) { return 'assets/plakatlar/' + f + '.jpg'; }

  /* ---------- Holat ---------- */
  var dir = get('dir', 'h');
  if (!P.directions[dir]) dir = 'h';
  function D() { return P.directions[dir]; }
  function topics() {
    return D().topics.map(function (t, i) {
      var c = t[2], first = B[c[0]];
      var posters = [];
      c.forEach(function (id) { (B[id].posters || []).forEach(function (p) { if (!posters.some(function (q) { return q[0] === p[0]; })) posters.push(p); }); });
      return { n: i + 1, title: t[0], type: t[1] === 'A' ? 'Amaliy' : 'Nazariy', blocks: c, color: first.color, short: c.map(function (id) { return B[id].short; }).join(' · '), posters: posters };
    });
  }
  function isRead(t) { var r = get('read', {}); return t.blocks.every(function (id) { return r[id]; }); }
  function setRead(t, v) { var r = get('read', {}); t.blocks.forEach(function (id) { if (v) r[id] = 1; else delete r[id]; }); put('read', r); }
  function scoreKey(t) { return dir + ':' + t.blocks.join('+'); }
  function getScore(t) { return get('score', {})[scoreKey(t)]; }
  function setScore(t, p) { var s = get('score', {}); var k = scoreKey(t); if (s[k] == null || p > s[k]) s[k] = p; put('score', s); }

  /* ---------- Mavzu fayllarini yuklaş (file:// da ham işlaydi) ---------- */
  var loading = {};
  function loadBlock(id) {
    window.PSX_T = window.PSX_T || {};
    if (window.PSX_T[id]) return Promise.resolve(window.PSX_T[id]);
    if (loading[id]) return loading[id];
    loading[id] = new Promise(function (res) {
      var s = document.createElement('script');
      s.src = 'assets/topics/' + id + '.js?v=2';
      s.onload = function () { res(window.PSX_T[id] || null); };
      s.onerror = function () { delete loading[id]; res(null); };
      document.head.appendChild(s);
    });
    return loading[id];
  }
  function loadMany(ids) { return Promise.all(ids.map(loadBlock)); }

  /* ---------- Mavzu (tema) sozlamasi ---------- */
  function applyTheme() { document.documentElement.setAttribute('data-theme', get('theme', 'auto')); }
  applyTheme();

  /* ---------- Navigatsiya ---------- */
  function setNav(o) {
    o = o || {};
    navBack.hidden = !o.back;
    if (o.back) { navBack.href = o.back; $('span', navBack).textContent = o.backLabel || 'Orqaga'; }
    navTitle.textContent = o.title || '';
    navRight.innerHTML = o.right || '';
  }
  function onScroll() { nav.classList.toggle('solid', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });

  function setTab(name) { $$('.tabbar a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-tab') === name); }); }

  var lastDepth = 0;
  function route() {
    var h = (location.hash || '#/').slice(2).split('/');
    var depth = h[0] === 't' || h[0] === 'final' ? 1 : 0;
    view.classList.remove('anim', 'anim-back');
    void view.offsetWidth;
    if (depth !== lastDepth) view.classList.add(depth > lastDepth ? 'anim' : 'anim-back');
    lastDepth = depth;
    window.scrollTo(0, 0);
    closeViewer();
    if (h[0] === 't') return renderTopic(+h[1], h[2] || 'lec');
    if (h[0] === 'tests') return renderTests();
    if (h[0] === 'final') return renderFinal();
    if (h[0] === 'glossary') return renderGlossary();
    if (h[0] === 'profile') return renderProfile();
    renderHome();
  }
  window.addEventListener('hashchange', route);

  /* ======================================================
     BOŞ SAHIFA
     ====================================================== */
  function dirSeg(cls) {
    return '<div class="seg ' + (cls || '') + '" role="group" aria-label="Yönaliş">' + Object.keys(P.directions).map(function (k) {
      return '<button data-dir="' + k + '" aria-pressed="' + (k === dir) + '">' + esc(P.directions[k].name) + '</button>';
    }).join('') + '</div>';
  }
  function bindDirSeg(el, rerender) {
    $$('[data-dir]', el).forEach(function (b) {
      b.onclick = function () { dir = b.getAttribute('data-dir'); put('dir', dir); rerender(); };
    });
  }

  function renderHome() {
    setTab('home'); setNav({ title: 'Mavzular' });
    var M = P.module, d = D(), ts = topics();
    var readN = ts.filter(isRead).length;
    var next = ts.filter(function (t) { return !isRead(t); })[0];
    var pct = Math.round(readN / ts.length * 100);
    var html = '';
    html += '<div class="eyebrow">' + esc(M.year) + '</div><div class="large-title">Mavzular</div>';
    html += '<div class="hero" id="hero" role="button" tabindex="0"><small>Raqamli taʼlim resursi</small><h1>' + esc(M.title) + '</h1>' +
      '<p>' + esc(M.author) + ' · ' + esc(M.org) + '</p>' +
      '<div class="chips"><span class="chip">' + esc(d.code) + ' – ' + esc(d.name) + '</span><span class="chip">' + esc(M.semester) + '</span><span class="chip">' + d.hours.jami + ' soat</span></div></div>';
    html += dirSeg('big');
    html += '<div class="stats" style="margin-top:12px">' +
      stat(d.hours.jami, 'Jami soat', '') + stat(d.hours.nazariy, 'Nazariy', 'c-blue') + stat(d.hours.amaliy, 'Amaliy', 'c-orange') + stat(d.hours.mustaqil, 'Mustaqil iş', 'c-green') + '</div>';
    html += '<div class="section-h">Özlaştiriş</div><div class="group"><a class="row" style="--inset:16px" href="#/t/' + (next ? next.n : 1) + '">' +
      '<div class="ring sm c-green" style="--p:' + pct + '"><b>' + pct + '%</b></div>' +
      '<div class="grow"><div class="t"><b>' + readN + ' / ' + ts.length + '</b> mavzu örganildi</div><div class="s">' + (next ? 'Davom ettiriş: ' + next.n + '-mavzu' : 'Barça mavzular örganildi 🎉') + '</div></div>' + ic('chev', 'chev') + '</a></div>';
    html += '<div class="section-h">' + esc(d.name) + ' · ' + ts.length + ' mavzu</div><div class="group">' + ts.map(topicRow).join('') + '</div>';
    html += '<div class="footer">' + esc(M.author) + ' · ' + esc(M.org) + '<br>' + esc(M.region) + ', ' + esc(M.year) + '</div>';
    view.innerHTML = html;
    bindDirSeg(view, renderHome);
    var hero = $('#hero');
    hero.onclick = aboutSheet;
    hero.onkeydown = function (e) { if (e.key === 'Enter') aboutSheet(); };
  }
  function stat(v, l, c) { return '<div class="stat ' + c + '"><b>' + v + '</b><span>' + l + '</span></div>'; }
  function topicRow(t) {
    var done = isRead(t);
    return '<a class="row c-' + t.color + '" href="#/t/' + t.n + '">' +
      '<div class="ic">' + t.n + '</div>' +
      '<div class="grow"><div class="t">' + esc(t.title) + '</div><div class="s"><span class="tag ' + t.type.toLowerCase() + '">' + t.type + '</span>2 soat' + (t.posters.length ? ' · ' + t.posters.length + ' plakat' : '') + '</div></div>' +
      (done ? '<span class="done-dot">' + ic('check') + '</span>' : ic('chev', 'chev')) + '</a>';
  }

  function aboutSheet() {
    var M = P.module;
    openSheet('<div class="large-title" style="font-size:26px;margin-top:4px">Resurs haqida</div>' +
      '<div class="group">' +
      kv('Fan', M.title) + kv('Muallif', M.author) + kv('Muassasa', M.org) + kv('Hudud', M.region) + kv('Öquv yili', M.year) +
      kv('Yönalişlar', Object.keys(P.directions).map(function (k) { return P.directions[k].code + ' – ' + P.directions[k].name; }).join('; ')) + '</div>' +
      '<p class="section-f">Resurs internetsiz işlaydi: papkani kompyuter yoki telefonga köçirib, index.html faylini brauzerda oçing. Natijalar şu qurilmada saqlanadi.</p>' +
      '<div class="btn-row"><button class="btn gray" data-close>Yopiş</button></div>');
  }
  function kv(k, v) { return '<div class="row" style="--inset:16px;cursor:default"><div class="grow"><div class="s" style="margin:0 0 2px">' + esc(k) + '</div><div class="t">' + esc(v) + '</div></div></div>'; }

  /* ======================================================
     MAVZU SAHIFASI
     ====================================================== */
  var TABS = [['lec', 'Maʼruza'], ['pos', 'Plakat'], ['test', 'Test'], ['glo', 'Luğat'], ['rev', 'Savol'], ['prac', 'Maşq']];

  function renderTopic(n, tab) {
    var ts = topics(), t = ts[n - 1];
    if (!t) { location.hash = '#/'; return; }
    setTab('home');
    setNav({ back: '#/', backLabel: 'Mavzular', title: n + '-mavzu' });
    var hasPrac = t.blocks.some(function (id) { return (B[id].interactive || []).length; });
    view.innerHTML = '<div class="c-' + t.color + '">' +
      '<div class="title-block"><div class="code">' + n + '-mavzu · <span class="tag ' + t.type.toLowerCase() + '">' + t.type + '</span> · 2 soat</div><h1>' + esc(t.title) + '</h1></div>' +
      '<div class="seg-sticky"><div class="seg" id="tseg"></div></div>' +
      '<div id="tabc"><div class="spinner"></div></div>' +
      '<div class="section-h">Boşqa mavzular</div><div class="group">' +
      (n > 1 ? pagerRow(ts[n - 2], 'Oldingi') : '') + (n < ts.length ? pagerRow(ts[n], 'Keyingi') : '') + '</div></div>';

    loadMany(t.blocks).then(function (ds) {
      ds = ds.filter(Boolean);
      var hasCases = ds.some(function (x) { return x.cases && x.cases.length; });
      var tabs = TABS.filter(function (x) { return x[0] !== 'prac' || hasPrac || hasCases; });
      if (!tabs.some(function (x) { return x[0] === tab; })) tab = 'lec';
      var seg = $('#tseg');
      seg.innerHTML = tabs.map(function (x) { return '<button data-tab="' + x[0] + '" aria-pressed="' + (x[0] === tab) + '">' + x[1] + '</button>'; }).join('');
      function show(name) {
        tab = name;
        $$('button', seg).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tab') === name); });
        history.replaceState(null, '', '#/t/' + n + '/' + name);
        var el = $('#tabc');
        if (!ds.length) { el.innerHTML = '<div class="empty">Mavzu materiallari hali yuklanmagan.</div>'; return; }
        ({ lec: tabLecture, pos: tabPosters, test: tabTest, glo: tabGlossary, rev: tabReview, prac: tabPractice })[name](el, t, ds);
        var top = $('.seg-sticky').offsetTop - 44;
        if (window.scrollY > top) window.scrollTo(0, top);
      }
      $$('button', seg).forEach(function (b) { b.onclick = function () { show(b.getAttribute('data-tab')); }; });
      show(tab);
    });
  }
  function pagerRow(t, label) {
    return '<a class="row c-' + t.color + '" href="#/t/' + t.n + '"><div class="ic">' + t.n + '</div><div class="grow"><div class="s" style="margin:0">' + label + '</div><div class="t">' + esc(t.title) + '</div></div>' + ic('chev', 'chev') + '</a>';
  }
  function blockHead(ds, i, t) {
    return ds.length > 1 ? '<div class="block-sep">' + (i + 1) + '-qism · ' + esc(B[t.blocks[i]].short) + '</div>' : '';
  }

  /* ---- Ma'ruza ---- */
  function tabLecture(el, t, ds) {
    var html = '';
    ds.forEach(function (d, i) {
      html += blockHead(ds, i, t);
      html += '<div class="card"><h3>' + ic('spark') + 'Maşğulot maqsadi</h3><p>' + esc(d.goal) + '</p></div>';
      if (d.plan && d.plan.length) html += '<div class="card"><h3>' + ic('book') + 'Maʼruza rejasi</h3><ol>' + d.plan.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>';
      if (d.know && d.know.length) html += '<div class="card"><h3>' + ic('check') + 'Öquvçi bilişi kerak</h3><ul>' + d.know.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
      if (d.keywords && d.keywords.length) html += '<div class="section-h" style="margin-top:14px">Kalit sözlar</div><div class="chips" style="margin:0 4px 16px">' + d.keywords.map(function (k) { return '<span class="chip">' + esc(k) + '</span>'; }).join('') + '</div>';
      (d.lecture || []).forEach(function (s) { html += '<article class="lec"><h2>' + esc(s.h) + '</h2>' + s.html + '</article>'; });
      if (d.selfwork) html += '<div class="card c-green"><h3>' + ic('person') + 'Mustaqil iş</h3><p>' + esc(d.selfwork) + '</p></div>';
    });
    var done = isRead(t);
    html += '<div class="btn-row"><button class="btn ' + (done ? 'gray' : 'green') + '" id="readBtn">' + (done ? '✓ Örganilgan (bekor qiliş)' : 'Öqib çiqdim ✓') + '</button></div>';
    html += '<div class="btn-row"><button class="btn tinted" id="toTest">Bilimni sinaş: test →</button></div>';
    el.innerHTML = html;
    $('#readBtn').onclick = function () { setRead(t, !isRead(t)); tabLecture(el, t, ds); };
    $('#toTest').onclick = function () { $('#tseg [data-tab="test"]').click(); };
  }

  /* ---- Plakatlar ---- */
  function tabPosters(el, t) {
    if (!t.posters.length) {
      el.innerHTML = '<div class="card"><h3>' + ic('img') + 'Plakat</h3><p class="muted">Bu mavzu uçun plakat yöq. SPIKES protokolining interaktiv sxemasi “Maşq” bölimida.</p></div>';
      return;
    }
    el.innerHTML = '<div class="posters">' + t.posters.map(function (p, i) {
      return '<button class="poster" data-i="' + i + '"><img loading="lazy" src="' + posterSrc(p[0]) + '" alt="' + esc(p[1]) + '"><div>' + esc(p[1]) + '<small>Infografika-plakat · kattalaştiriş uçun bosing</small></div></button>';
    }).join('') + '</div><p class="section-f">Plakatlar — muallifning körgazmali materiallari. Darsda proyektor orqali körsatiş yoki çop etiş mumkin.</p>';
    $$('.poster', el).forEach(function (b) { b.onclick = function () { var p = t.posters[+b.getAttribute('data-i')]; openViewer(posterSrc(p[0]), p[1]); }; });
  }

  /* ---- Test ---- */
  function prepQs(list, limit) {
    var qs = shuffle(list).slice(0, limit || list.length);
    return qs.map(function (q) {
      var order = shuffle(q.o.map(function (_, i) { return i; }));
      return { q: q.q, o: order.map(function (i) { return q.o[i]; }), a: order.indexOf(q.a) };
    });
  }
  function tabTest(el, t, ds) {
    var all = [];
    ds.forEach(function (d) { all = all.concat(d.tests || []); });
    if (!all.length) { el.innerHTML = '<div class="empty">Test savollari yöq.</div>'; return; }
    var best = getScore(t);
    el.innerHTML = '<div class="card" style="text-align:center"><h3 style="justify-content:center">' + ic('check') + 'Mavzu böyiça test</h3><p class="muted">' + all.length + ' ta savol · javob variantlari har safar aralaştiriladi</p>' +
      (best != null ? '<p>Eng yaxşi natija: <b>' + best + '%</b></p>' : '') + '<div class="btn-row"><button class="btn" id="startQ">Testni boşlaş</button></div></div>';
    $('#startQ').onclick = function () {
      runQuiz(el, function () { return prepQs(all); }, function (p) { setScore(t, p); });
    };
  }
  function grade(p) { return p >= 86 ? ['Aʼlo!', 'green'] : p >= 71 ? ['Yaxşi', 'blue'] : p >= 56 ? ['Qoniqarli', 'orange'] : ['Mavzuni yana takrorlang', 'red']; }
  function runQuiz(el, make, onDone) {
    var qs = make(), i = 0, right = 0, wrong = [];
    function show() {
      if (i >= qs.length) return finish();
      var q = qs[i];
      el.innerHTML = '<div class="q-meta"><span>Savol ' + (i + 1) + ' / ' + qs.length + '</span><span>Töğri: ' + right + '</span></div>' +
        '<div class="q-progress"><i style="width:' + (i / qs.length * 100) + '%"></i></div>' +
        '<div class="q-text">' + esc(q.q) + '</div><div class="group">' +
        q.o.map(function (o, k) { return '<button class="opt" data-k="' + k + '"><span class="let">' + 'ABCD'[k] + '</span><span>' + esc(o) + '</span></button>'; }).join('') +
        '</div><div id="qnext"></div>';
      $$('.opt', el).forEach(function (b) {
        b.onclick = function () {
          var k = +b.getAttribute('data-k');
          if (k === q.a) right++; else wrong.push(q);
          $$('.opt', el).forEach(function (x) {
            x.disabled = true; var kk = +x.getAttribute('data-k');
            if (kk === q.a) x.classList.add('ok'); else if (kk === k) x.classList.add('bad');
          });
          $('#qnext', el).innerHTML = '<div class="btn-row"><button class="btn">' + (i + 1 < qs.length ? 'Keyingi savol' : 'Natijani köriş') + '</button></div>';
          $('#qnext .btn', el).onclick = function () { i++; show(); };
        };
      });
    }
    function finish() {
      var p = Math.round(right / qs.length * 100), g = grade(p);
      if (onDone) onDone(p);
      el.innerHTML = '<div class="card result c-' + g[1] + '"><div class="ring" style="--p:' + p + '"><b>' + p + '%</b></div><h2>' + g[0] + '</h2><p>' + right + ' / ' + qs.length + ' ta töğri javob</p>' +
        '<div class="btn-row"><button class="btn" id="again">Qayta topşiriş</button></div></div>' +
        (wrong.length ? '<div class="section-h">Xatolar ustida işlaş</div><div class="group">' + wrong.map(function (q) {
          return '<div class="row" style="--inset:16px;cursor:default"><div class="grow"><div class="t">' + esc(q.q) + '</div><div class="s" style="color:var(--green)">✓ ' + esc(q.o[q.a]) + '</div></div></div>';
        }).join('') + '</div>' : '');
      $('#again', el).onclick = function () { runQuiz(el, make, onDone); };
    }
    show();
  }

  /* ---- Lug'at (mavzu) ---- */
  function mergeGloss(ds) {
    var seen = {}, out = [];
    ds.forEach(function (d) { (d.glossary || []).forEach(function (g) { var k = g.t.toLowerCase(); if (!seen[k]) { seen[k] = 1; out.push(g); } }); });
    return out.sort(uzCmp);
  }
  /* Yangi alifbo tartibi: ... X Y Z Ö Ğ Ş Ç (ng — n+g) */
  var UZ = 'abcdefghijklmnopqrstuvwxyzöğşç';
  function uzBare(s) { return String(s).replace(/^[^A-Za-zÖĞŞÇöğşç0-9]+/, ''); }
  function uzKey(s) {
    var k = '', t = uzBare(s).toLowerCase();
    for (var i = 0; i < t.length; i++) { var p = UZ.indexOf(t[i]); k += p >= 0 ? String.fromCharCode(66 + p) : (/[\s-]/.test(t[i]) ? 'A' : ''); }
    return k;
  }
  function uzCmp(a, b) { var x = uzKey(a.t), y = uzKey(b.t); return x < y ? -1 : x > y ? 1 : 0; }
  /* Qidiruvda eski yozuv ham qabul qilinadi: sh→ş, ch→ç, o‘→ö, g‘→ğ */
  function uzNorm(q) { return q.toLowerCase().replace(/o['‘ʻ’`]/g, 'ö').replace(/g['‘ʻ’`]/g, 'ğ').replace(/sh/g, 'ş').replace(/ch/g, 'ç'); }
  function termRow(g) { return '<div class="row term" style="--inset:16px;cursor:default"><div class="grow"><b>' + esc(g.t) + (g.l ? ' <span class="muted" style="font-weight:400">(' + esc(g.l) + ')</span>' : '') + '</b><span>' + esc(g.d) + '</span>' + (g.src ? '<small class="src">' + esc(g.src) + '</small>' : '') + '</div></div>'; }
  function tabGlossary(el, t, ds) {
    var gl = mergeGloss(ds);
    el.innerHTML = '<div class="btn-row" style="margin:0 0 14px"><button class="btn tinted sm" id="fc">' + ic('flip') + 'Kartoçkalar rejimi</button></div><div class="group">' + gl.map(termRow).join('') + '</div>';
    $('#fc').onclick = function () { flashcards(el, gl, function () { tabGlossary(el, t, ds); }); };
  }
  function flashcards(el, list, back) {
    var arr = shuffle(list), i = 0;
    function show() {
      var g = arr[i];
      el.innerHTML = '<div class="q-meta"><span>Kartoçka ' + (i + 1) + ' / ' + arr.length + '</span><span>Ağdariş uçun bosing</span></div>' +
        '<div class="flash" id="fl"><div class="flash-in"><div class="flash-face front">' + esc(g.t) + '<small>Taʼrifini eslang…</small></div><div class="flash-face back">' + esc(g.d) + '</div></div></div>' +
        '<div class="btn-row"><button class="btn gray" id="pv"' + (i ? '' : ' disabled') + '>← Oldingi</button><button class="btn" id="nx">' + (i + 1 < arr.length ? 'Keyingi →' : 'Tugatiş') + '</button></div>' +
        '<div class="btn-row"><button class="btn tinted" id="ex">Röyxatga qaytiş</button></div>';
      $('#fl', el).onclick = function () { this.classList.toggle('flipped'); };
      $('#pv', el).onclick = function () { i--; show(); };
      $('#nx', el).onclick = function () { if (i + 1 < arr.length) { i++; show(); } else back(); };
      $('#ex', el).onclick = back;
    }
    show();
  }

  /* ---- Savollar ---- */
  function tabReview(el, t, ds) {
    var html = '';
    ds.forEach(function (d, i) {
      html += blockHead(ds, i, t);
      html += '<div class="section-h">Nazorat savollari</div><div class="group">' + (d.review || []).map(function (q, k) {
        return '<div class="row" style="--inset:60px;cursor:default"><div class="ic" style="background:var(--fill);color:var(--label2)">' + (k + 1) + '</div><div class="grow"><div class="t">' + esc(q) + '</div></div></div>';
      }).join('') + '</div>';
      if (d.selfwork) html += '<div class="section-h">Mustaqil iş topşiriği</div><div class="card">' + esc(d.selfwork) + '</div>';
    });
    el.innerHTML = html;
  }

  /* ---- Maşq: interaktivlar va vaziyatli masalalar ---- */
  function tabPractice(el, t, ds) {
    el.innerHTML = '';
    t.blocks.forEach(function (id, i) {
      var d = ds[i] || {};
      (B[id].interactive || []).forEach(function (w) {
        var box = document.createElement('div'); el.appendChild(box);
        WIDGETS[w](box);
      });
      if (d.cases && d.cases.length) {
        var box = document.createElement('div'); el.appendChild(box);
        casesWidget(box, d.cases);
      }
    });
    if (!el.innerHTML) el.innerHTML = '<div class="empty">Bu mavzuda maşq yöq.</div>';
  }

  function casesWidget(el, cases) {
    var html = '<div class="h2">Vaziyatli masalalar</div><p class="section-f" style="margin:-4px 4px 12px">Vaziyatni öqing va eng töğri harakatni tanlang. Tanlovdan söng izoh çiqadi.</p>';
    html += cases.map(function (c, ci) {
      return '<div class="card" data-c="' + ci + '"><h3>' + ic('person') + esc(c.title) + '</h3><p>' + esc(c.situation) + '</p><p><b>' + esc(c.question) + '</b></p>' +
        c.options.map(function (o, k) { return '<button class="case-opt" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '<div class="ex"></div></div>';
    }).join('');
    el.innerHTML = html;
    $$('[data-c]', el).forEach(function (card) {
      var c = cases[+card.getAttribute('data-c')];
      $$('.case-opt', card).forEach(function (b) {
        b.onclick = function () {
          if (card.classList.contains('answered')) return;
          card.classList.add('answered');
          var k = +b.getAttribute('data-k');
          $$('.case-opt', card).forEach(function (x) { var kk = +x.getAttribute('data-k'); if (kk === c.best) x.classList.add('ok'); else if (kk === k) x.classList.add('bad'); });
          $('.ex', card).innerHTML = '<div class="explain"><b>' + (k === c.best ? '✓ Töğri. ' : 'Eng töğri javob belgilandi. ') + '</b>' + esc(c.explain) + '</div>';
        };
      });
    });
  }

  /* ---------- Şkalalar (o'quv namunasi) ---------- */
  var F2 = ['Umuman yöq', 'Bir neça kun', 'Kunlarning yarmidan köpi', 'Deyarli har kuni'];
  var SCALES = {
    gad7: {
      name: 'GAD-7', full: 'Umumlaşgan xavotir şkalasi (GAD-7)', period: 'Oxirgi 2 hafta davomida quyidagilar sizni qançalik tez-tez bezovta qildi?', opts: F2,
      items: ['Asabiylaşiş, xavotir yoki keskinlikni his qiliş', 'Xavotirni töxtata olmaslik yoki nazorat qila olmaslik', 'Turli narsalar haqida haddan taşqari xavotirlaniş', 'Böşaşiş (tinçlaniş) qiyinligi', 'Şunçalik bezovtalikki, bir joyda ötira olmaslik', 'Tez jahl çiqişi yoki aççiqlaniş', 'Nimadir yomon narsa sodir böladigandek qörquv'],
      levels: [[4, 'Minimal xavotir', 'green'], [9, 'Yengil xavotir', 'teal'], [14, 'Örtaça xavotir', 'orange'], [21, 'Oğir xavotir', 'red']]
    },
    phq9: {
      name: 'PHQ-9', full: 'Depressiya skriningi (PHQ-9)', period: 'Oxirgi 2 hafta davomida quyidagilar sizni qançalik tez-tez bezovta qildi?', opts: F2,
      items: ['Biror iş qilişga qiziqiş yoki undan zavq oliş kamligi', 'Kayfiyat tuşkunligi, umidsizlik', 'Uyquga ketiş qiyinligi, tez-tez uyğoniş yoki haddan taşqari köp uxlaş', 'Çarçoq yoki kuçsizlik', 'Iştaha pasayişi yoki haddan taşqari köp ovqatlaniş', 'Özini yomon his qiliş: özini omadsiz deb hisoblaş yoki özini, oilasini xafa qildim deb öylaş', 'Diqqatni jamlaş qiyinligi (masalan, kitob öqişda)', 'Boşqalar sezadigan darajada sekin harakat qiliş yoki gapiriş – yoki aksinça, notinçlik', 'Ölim yoki öziga zarar yetkaziş haqidagi fikrlar'],
      levels: [[4, 'Minimal belgilar', 'green'], [9, 'Yengil depressiv belgilar', 'teal'], [14, 'Örtaça depressiv belgilar', 'orange'], [19, 'Örtaça-oğir depressiv belgilar', 'red'], [27, 'Oğir depressiv belgilar', 'red']]
    },
    pss10: {
      name: 'PSS-10', full: 'Sezilgan stress şkalasi (PSS-10, S. Koen)', period: 'Oxirgi bir oy davomida…', opts: ['Heç qaçon', 'Deyarli heç qaçon', 'Baʼzan', 'Tez-tez', 'Juda tez-tez'], rev: [3, 4, 6, 7],
      items: ['Kutilmagan hodisa tufayli qançalik tez-tez xafa böldingiz?', 'Hayotingizdagi muhim narsalarni nazorat qila olmayotgandek his qildingizmi?', 'Asabiylaşgan va stress holatida bölganingizni his qildingizmi?', 'Şaxsiy muammolaringizni hal qila olişingizga işonç his qildingizmi?', 'Işlar siz xohlagandek ketayotganini his qildingizmi?', 'Qilişingiz kerak bölgan barça işlarga ulgura olmayotganingizni sezdingizmi?', 'Hayotingizdagi asabiylaştiruvçi holatlarni nazorat qila oldingizmi?', 'Vaziyatni töliq nazorat qilayotganingizni his qildingizmi?', 'Özingizga boğliq bölmagan narsalar tufayli jahlingiz çiqdimi?', 'Qiyinçiliklar şunçalik köpayib ketdiki, ularni yengib öta olmaydigandek his qildingizmi?'],
      levels: [[13, 'Past stress darajasi', 'green'], [26, 'Örtaça stress darajasi', 'orange'], [40, 'Yuqori stress darajasi', 'red']]
    }
  };
  function scalesWidget(el) {
    var cur = 'gad7', ans = {};
    function render() {
      var S = SCALES[cur], a = ans[cur] || (ans[cur] = []);
      var html = '<div class="h2">Baholaş şkalalari: amaliy maşq</div>' +
        '<div class="warn">Öquv maqsadidagi namuna. Şkala natijasi taşxis emas: taşxisni faqat şifokor yoki psixolog qöyadi. Maşqni juftlikda bajaring: biri “bemor”, ikkinçisi “hamşira” bölib, savollarni öqib bering.</div>' +
        '<div class="seg">' + Object.keys(SCALES).map(function (k) { return '<button data-s="' + k + '" aria-pressed="' + (k === cur) + '">' + SCALES[k].name + '</button>'; }).join('') + '</div>' +
        '<div class="section-h">' + esc(S.full) + '</div><p class="section-f" style="margin:-2px 16px 8px">' + esc(S.period) + '</p><div class="group">' +
        S.items.map(function (q, i) {
          return '<div class="scale-q"><p><b>' + (i + 1) + '.</b> ' + esc(q) + '</p><div class="seg">' + S.opts.map(function (o, v) { return '<button data-q="' + i + '" data-v="' + v + '" aria-pressed="' + (a[i] === v) + '">' + esc(o) + '</button>'; }).join('') + '</div></div>';
        }).join('') + '</div><div id="sres"></div>';
      el.innerHTML = html;
      $$('[data-s]', el).forEach(function (b) { b.onclick = function () { cur = b.getAttribute('data-s'); render(); }; });
      $$('[data-q]', el).forEach(function (b) {
        b.onclick = function () {
          a[+b.getAttribute('data-q')] = +b.getAttribute('data-v');
          $$('[data-q="' + b.getAttribute('data-q') + '"]', el).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          result();
        };
      });
      result();
    }
    function result() {
      var S = SCALES[cur], a = ans[cur], n = a.filter(function (x) { return x != null; }).length;
      var max = (S.opts.length - 1) * S.items.length;
      var sum = 0;
      a.forEach(function (v, i) { if (v != null) sum += (S.rev && S.rev.indexOf(i) >= 0) ? (S.opts.length - 1 - v) : v; });
      var box = $('#sres', el);
      if (n < S.items.length) { box.innerHTML = '<p class="section-f">Javob berildi: ' + n + ' / ' + S.items.length + '. Natija barça savollarga javob berilgaç çiqadi.</p>'; return; }
      var lv = S.levels.filter(function (l) { return sum <= l[0]; })[0];
      var html = '<div class="card c-' + lv[2] + '" style="margin-top:14px"><h3>' + ic('chart') + 'Natija: ' + sum + ' / ' + max + ' ball</h3><div class="bar"><i style="width:' + (sum / max * 100) + '%"></i></div><p style="margin-top:8px"><b>' + lv[1] + '</b></p>' +
        '<p class="muted" style="font-size:14px">Çegaralar: ' + S.levels.map(function (l, i) { return (i ? S.levels[i - 1][0] + 1 : 0) + '–' + l[0] + ' — ' + l[1].toLowerCase(); }).join('; ') + '.' + (S.rev ? ' 4, 5, 7, 8-savollar teskari hisoblanadi.' : '') + '</p></div>';
      if (cur === 'phq9' && a[8] > 0) html += '<div class="warn red"><b>Muhim:</b> 9-savolga ijobiy javob berilgan bölsa, bemor zudlik bilan şifokor yoki psixiatr körigiga yönaltiriladi, yolğiz qoldirilmaydi. Hayot uçun xavfli holatda 103 ga qönğiroq qilinadi.</div>';
      box.innerHTML = html;
    }
    render();
  }

  /* ---------- Temperament testi ---------- */
  var TEMP = {
    e: ['Şovqinli, köpçilik davralarda özingizni yaxşi his qilasizmi?', 'Yangi odamlar bilan oson tanişasizmi?', 'Tez qaror qabul qilib, darhol harakatga ötasizmi?', 'Diqqat markazida böliş sizga yoqadimi?', 'Yolğiz qolgandan köra odamlar orasida bölişni afzal körasizmi?', 'Suhbatni köpinça birinçi bölib boşlaysizmi?'],
    n: ['Kayfiyatingiz tez-tez özgarib turadimi?', 'Arzimas narsadan xafa bölib qolasizmi?', 'Muhim iş yoki imtihondan oldin uzoq xavotirlanasizmi?', 'Tanqidni oğir qabul qilasizmi?', 'Baʼzan sababsiz çarçoq yoki tuşkunlik his qilasizmi?', 'Jahlingiz tez çiqadimi?']
  };
  var TYPES = {
    sangvinik: ['Sangvinik', 'green', 'Ekstravert, hissiy jihatdan barqaror. Faol, oçiq, tez moslaşadi, optimist. Bemor sifatida: tez işonç bildiradi, lekin tavsiyalarni unutib qöyişi mumkin — yozma eslatma bering.'],
    xolerik: ['Xolerik', 'red', 'Ekstravert, hissiy jihatdan beqaror. Tezkor, ğayratli, yetakçi, ammo jahldor. Bemor sifatida: sabrsiz, navbat va kutişga qiyin çidaydi — xotirjam, aniq va qisqa gapiring.'],
    flegmatik: ['Flegmatik', 'teal', 'Introvert, hissiy jihatdan barqaror. Sokin, sabrli, puxta, özgarişlarga sekin moslaşadi. Bemor sifatida: şikoyatini kam aytadi — savollarni aniq bering, vaqt ajrating.'],
    melanxolik: ['Melanxolik', 'purple', 'Introvert, hissiy jihatdan beqaror. Sezgir, masʼuliyatli, ammo xavotirga moyil. Bemor sifatida: kasallikni oğir keçiradi — köproq tinçlantiriş, qöllab-quvvatlaş kerak.']
  };
  function temperamentWidget(el) {
    var items = [];
    TEMP.e.forEach(function (q) { items.push(['e', q]); });
    TEMP.n.forEach(function (q) { items.push(['n', q]); });
    items = shuffle(items);
    var ans = {};
    el.innerHTML = '<div class="h2">Temperament testi (qisqartirilgan)</div><p class="section-f" style="margin:-4px 4px 12px">G. Ayzenk yondaşuvi asosidagi soddalaştirilgan öquv testi. Har bir savolga “Ha” yoki “Yöq” deb javob bering.</p>' +
      '<div class="group">' + items.map(function (it, i) {
        return '<div class="row" style="--inset:16px;cursor:default"><div class="grow"><div class="t">' + (i + 1) + '. ' + esc(it[1]) + '</div></div><div class="yn"><button data-i="' + i + '" data-v="1">Ha</button><button data-i="' + i + '" data-v="0">Yöq</button></div></div>';
      }).join('') + '</div><div class="btn-row"><button class="btn" id="tres" disabled>Natijani köriş</button></div><div id="tout"></div>';
    $$('.yn button', el).forEach(function (b) {
      b.onclick = function () {
        var i = b.getAttribute('data-i');
        ans[i] = +b.getAttribute('data-v');
        $$('.yn button[data-i="' + i + '"]', el).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        $('#tres', el).disabled = Object.keys(ans).length < items.length;
      };
    });
    $('#tres', el).onclick = function () {
      var e = 0, n = 0;
      items.forEach(function (it, i) { if (ans[i]) { if (it[0] === 'e') e++; else n++; } });
      var key = e >= 4 ? (n >= 4 ? 'xolerik' : 'sangvinik') : (n >= 4 ? 'melanxolik' : 'flegmatik');
      var T = TYPES[key];
      $('#tout', el).innerHTML = '<div class="card c-' + T[1] + '" style="margin-top:14px"><h3>' + ic('person') + 'Sizda ustun tip: ' + T[0] + '</h3>' +
        '<p class="muted" style="margin:0">Ekstraversiya: ' + e + ' / 6</p><div class="bar c-blue"><i style="width:' + (e / 6 * 100) + '%"></i></div>' +
        '<p class="muted" style="margin:8px 0 0">Hissiy beqarorlik (neyrotizm): ' + n + ' / 6</p><div class="bar c-orange"><i style="width:' + (n / 6 * 100) + '%"></i></div>' +
        '<p style="margin-top:12px">' + T[2] + '</p><p class="muted" style="font-size:14px;margin:0">Eslatma: “sof” temperament kam uçraydi, köpçilikda aralaş xususiyatlar böladi. Temperament yaxşi yoki yomon bölmaydi.</p></div>';
    };
  }

  /* ---------- Nafas maşqi (relaksatsiya) ---------- */
  function breathWidget(el) {
    var PH = [['Nafas oling', true], ['Uşlab turing', true], ['Nafas çiqaring', false], ['Uşlab turing', false]];
    var timer = null, ph = 0, sec = 4, cyc = 0;
    el.innerHTML = '<div class="h2">Relaksatsiya: “kvadrat nafas” maşqi</div><div class="card"><p>Stressni kamaytiriş va bemorni tinçlantirişda qöllaniladigan oddiy usul: 4 soniya nafas oliş, 4 soniya uşlab turiş, 4 soniya çiqariş, 4 soniya pauza. 4–6 sikl bajariladi.</p>' +
      '<div class="breath"><div class="breath-c" id="bc">Boşlaş<small>▶</small></div><p class="muted" id="bcy" style="margin:14px 0 0">Sikl: 0</p></div>' +
      '<div class="btn-row"><button class="btn" id="bgo">Boşlaş</button></div></div>';
    var c = $('#bc', el), go = $('#bgo', el);
    function tick() {
      c.innerHTML = PH[ph][0] + '<small>' + sec + '</small>';
      c.classList.toggle('in', PH[ph][1]);
      sec--;
      if (sec < 0) { sec = 4; ph = (ph + 1) % 4; if (ph === 0) { cyc++; $('#bcy', el).textContent = 'Sikl: ' + cyc; } }
    }
    function stop() { clearInterval(timer); timer = null; go.textContent = 'Boşlaş'; c.classList.remove('in'); c.innerHTML = 'Boşlaş<small>▶</small>'; }
    go.onclick = c.onclick = function () {
      if (timer) return stop();
      ph = 0; sec = 4; cyc = 0; $('#bcy', el).textContent = 'Sikl: 0';
      go.textContent = 'Töxtatiş'; tick(); timer = setInterval(function () { if (!document.body.contains(c)) return clearInterval(timer); tick(); }, 1000);
    };
  }

  /* ---------- SPIKES protokoli ---------- */
  var SPIKES = [
    ['S', 'Setting — şaroit', 'Suhbatga tayyorlaniş', 'Alohida, tinç xona tanlang; ötirib, közga qarab gapiring. Telefonni ovozsiz qiling, vaqt ajrating. Bemor xohlasa, yaqin kişisini taklif qiling. Römolça, suv tayyor tursin.', 'Keling, ötiraylik. Hozir gaplaşişga qulaymi? Yoningizda kimdir bölişini xohlaysizmi?', 'blue'],
    ['P', 'Perception — idrok', 'Bemor nimani biladi?', 'Avval bemorning özi kasalligi haqida nimani bilişi va nimani taxmin qilişini sörang. Bu notöğri tasavvurlarni aniqlaş va gapni uning tuşunçasidan boşlaşga yordam beradi.', 'Tekşiruvlar haqida sizga hozirgaça nimalar aytilgan? Nimadan xavotirdasiz?', 'teal'],
    ['I', 'Invitation — taklif', 'Qançalik batafsil bilişni xohlaydi?', 'Bemordan maʼlumotni qay darajada batafsil eşitişni xohlaşini sörang. Baʼzi bemorlar faqat asosiy narsani, baʼzilari barça tafsilotlarni bilişni istaydi — bu uning huquqi.', 'Natijalarni batafsil tuşuntirib beraymi yoki avval asosiysini aytaymi?', 'indigo'],
    ['K', 'Knowledge — maʼlumot', 'Xabarni yetkaziş', 'Avval ogohlantiruvçi gap ayting. Sodda, tibbiy atamalarsiz, kiçik qismlarga bölib gapiring; har bir qismdan keyin tuşunganini tekşiring. Haddan taşqari qöpol oçiqlik yoki noaniq “yumşatiş”dan saqlaning.', 'Afsuski, xabarim unçalik yaxşi emas… Tekşiruv şuni körsatdiki…', 'purple'],
    ['E', 'Emotions — his-tuyğular', 'Empatik javob beriş', 'Bemorning reaksiyasini (yiği, jimlik, ğazab, inkor) kuzating. Pauza qiling, his-tuyğuni nomlang va qabul qiling. Şoşilmang, keraksiz tasalli bermang.', 'Bu siz uçun juda oğir xabar ekanini tuşunaman. Şoşilmang, men şu yerdaman.', 'pink'],
    ['S', 'Strategy & Summary — reja va xulosa', 'Keyingi qadamlar', 'Suhbatni umumlaştiring, davolaş va yordam rejasini birgalikda tuzing, savollarga javob bering. Bemor yolğiz emasligini, yordam davom etişini taʼkidlang. Keyingi uçraşuv vaqtini belgilang.', 'Keling, birgalikda keyingi qadamlarni rejalaştiramiz. Yana qanday savollaringiz bor?', 'green']
  ];
  function spikesWidget(el) {
    el.innerHTML = '<div class="h2">SPIKES protokoli: “yomon xabar”ni yetkaziş</div>' +
      '<p class="section-f" style="margin:-4px 4px 12px">R. Bakman va V. Beyl (2000) taklif qilgan 6 bosqiçli model. Har bir bosqiçni bosib, tavsifi va namunaviy iborani köring. Taşxis haqidagi xabarni odatda şifokor yetkazadi; hamşira suhbatda iştirok etadi va bemorni qöllab-quvvatlaydi.</p>' +
      '<div class="group steps">' + SPIKES.map(function (s, i) {
        return '<div class="stepc c-' + s[5] + '" data-i="' + i + '"><div class="L">' + s[0] + '</div><div class="grow"><b>' + esc(s[1]) + '</b><div class="d">' + esc(s[2]) + '</div><div class="more">' + esc(s[3]) + '<span class="say">“' + esc(s[4]) + '”</span></div></div>' + ic('chev', 'chev') + '</div>';
      }).join('') + '</div><div class="btn-row"><button class="btn tinted" id="spAll">Barçasini oçiş</button></div>' +
      '<div class="card" style="margin-top:14px"><h3>' + ic('person') + 'Rolli öyin</h3><ol><li>Uç kişilik guruh tuzing: “şifokor/hamşira”, “bemor”, “kuzatuvçi”.</li><li>Vaziyatli masaladan birini tanlang va SPIKES bosqiçlari böyiça 5–7 daqiqa suhbat ötkazing.</li><li>Kuzatuvçi har bir bosqiç bajarilganini belgilab boradi va fikr bildiradi.</li><li>Rollarni almaştiring.</li></ol></div>';
    $$('.stepc', el).forEach(function (s) { s.onclick = function () { s.classList.toggle('open'); }; });
    $('#spAll', el).onclick = function () { $$('.stepc', el).forEach(function (s) { s.classList.add('open'); }); };
  }

  var WIDGETS = { scales: scalesWidget, temperament: temperamentWidget, breath: breathWidget, spikes: spikesWidget };

  /* ======================================================
     TESTLAR
     ====================================================== */
  function renderTests() {
    setTab('tests'); setNav({ title: 'Testlar' });
    var ts = topics(), fb = get('final', {})[dir];
    view.innerHTML = '<div class="large-title">Testlar</div>' + dirSeg() +
      '<div class="card c-indigo" style="margin-top:12px"><h3>' + ic('shuffle') + 'Yakuniy test</h3><p class="muted">“' + esc(D().name) + '” yönalişining barça mavzularidan tasodifiy 30 ta savol.' + (fb != null ? ' Eng yaxşi natija: <b style="color:var(--label)">' + fb + '%</b>' : '') + '</p>' +
      '<div class="btn-row"><a class="btn" href="#/final">Boşlaş</a></div></div>' +
      '<div class="section-h">Mavzular böyiça</div><div class="group">' + ts.map(function (t) {
        var s = getScore(t);
        return '<a class="row c-' + t.color + '" href="#/t/' + t.n + '/test"><div class="ic">' + t.n + '</div><div class="grow"><div class="t">' + esc(t.title) + '</div></div>' +
          (s != null ? '<div class="ring sm c-' + grade(s)[1] + '" style="--p:' + s + '"><b>' + s + '</b></div>' : '<span class="val">—</span>') + ic('chev', 'chev') + '</a>';
      }).join('') + '</div>';
    bindDirSeg(view, renderTests);
  }
  function dirBlocks() { var ids = []; topics().forEach(function (t) { ids = ids.concat(t.blocks); }); return uniq(ids); }
  function renderFinal() {
    setTab('tests'); setNav({ back: '#/tests', backLabel: 'Testlar', title: 'Yakuniy test' });
    view.innerHTML = '<div class="title-block c-indigo"><div class="code">' + esc(D().name) + '</div><h1>Yakuniy test</h1></div><div id="fq"><div class="spinner"></div></div>';
    loadMany(dirBlocks()).then(function (ds) {
      var all = [];
      ds.filter(Boolean).forEach(function (d) { all = all.concat(d.tests || []); });
      var el = $('#fq');
      if (!el) return;
      if (!all.length) { el.innerHTML = '<div class="empty">Savollar topilmadi.</div>'; return; }
      runQuiz(el, function () { return prepQs(all, 30); }, function (p) { var f = get('final', {}); if (f[dir] == null || p > f[dir]) f[dir] = p; put('final', f); });
    });
  }

  /* ======================================================
     LUG'AT
     ====================================================== */
  function renderGlossary() {
    setTab('glossary'); setNav({ title: 'Luğat' });
    view.innerHTML = '<div class="large-title">Luğat</div>' + dirSeg() + '<div style="height:10px"></div><div id="gl"><div class="spinner"></div></div>';
    bindDirSeg(view, renderGlossary);
    var ts = topics();
    loadMany(dirBlocks()).then(function () {
      var el = $('#gl');
      if (!el) return;
      var seen = {}, list = [];
      ts.forEach(function (t) {
        t.blocks.forEach(function (id) {
          var d = window.PSX_T[id];
          if (!d) return;
          (d.glossary || []).forEach(function (g) {
            var k = g.t.toLowerCase();
            if (!seen[k]) { seen[k] = 1; list.push({ t: g.t, d: g.d, l: g.l, src: t.n + '-mavzu' }); }
          });
        });
      });
      list.sort(uzCmp);
      function draw(q) {
        q = uzNorm((q || '').trim());
        var f = list.filter(function (g) { return !q || g.t.toLowerCase().indexOf(q) >= 0 || g.d.toLowerCase().indexOf(q) >= 0; });
        var out = '', L = '';
        var buf = [];
        function flush() { if (buf.length) { out += '<div class="letter">' + esc(L) + '</div><div class="group">' + buf.join('') + '</div>'; buf = []; } }
        f.forEach(function (g) {
          var l = uzBare(g.t).charAt(0).toUpperCase();
          if (l !== L) { flush(); L = l; }
          buf.push(termRow(g));
        });
        flush();
        $('#glist', el).innerHTML = out || '<div class="empty">Heç narsa topilmadi.</div>';
        $('#gcount', el).textContent = f.length + ' ta atama';
      }
      el.innerHTML = '<label class="search">' + ic('search') + '<input id="gq" type="search" placeholder="Atamani qidiriş" autocomplete="off"></label>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin:0 4px 4px"><span class="muted" id="gcount" style="font-size:13px"></span><button class="btn tinted sm" id="gfc">' + ic('flip') + 'Kartoçkalar</button></div><div id="glist"></div>';
      $('#gq', el).oninput = function () { draw(this.value); };
      $('#gfc', el).onclick = function () { flashcards(el, list, renderGlossary); };
      draw('');
    });
  }

  /* ======================================================
     NATIJALAR
     ====================================================== */
  function renderProfile() {
    setTab('profile'); setNav({ title: 'Natijalar' });
    var ts = topics(), readN = ts.filter(isRead).length, pct = Math.round(readN / ts.length * 100);
    var sc = ts.map(getScore).filter(function (x) { return x != null; });
    var avg = sc.length ? Math.round(sc.reduce(function (a, b) { return a + b; }, 0) / sc.length) : null;
    var fb = get('final', {})[dir];
    var th = get('theme', 'auto');
    view.innerHTML = '<div class="large-title">Natijalar</div>' + dirSeg() +
      '<div class="card" style="text-align:center;margin-top:12px;padding:22px 16px"><div class="ring c-green" style="--p:' + pct + '"><b>' + pct + '%</b></div><p style="margin:12px 0 0"><b>' + readN + ' / ' + ts.length + '</b> mavzu örganildi</p></div>' +
      '<div class="stats" style="grid-template-columns:repeat(3,1fr)">' + stat(sc.length + '/' + ts.length, 'Topşirilgan test', 'c-blue') + stat(avg != null ? avg + '%' : '—', 'Örtaça natija', 'c-orange') + stat(fb != null ? fb + '%' : '—', 'Yakuniy test', 'c-indigo') + '</div>' +
      '<div class="section-h">Mavzular</div><div class="group">' + ts.map(function (t) {
        var s = getScore(t);
        return '<a class="row c-' + t.color + '" href="#/t/' + t.n + '"><div class="ic">' + t.n + '</div><div class="grow"><div class="t">' + esc(t.title) + '</div><div class="s">' + (isRead(t) ? '<span style="color:var(--green)">✓ Örganilgan</span>' : 'Örganilmagan') + ' · Test: ' + (s != null ? s + '%' : '—') + '</div></div>' + ic('chev', 'chev') + '</a>';
      }).join('') + '</div>' +
      '<div class="section-h">Köriniş</div><div class="seg big" id="thseg">' + [['auto', 'Avtomatik'], ['light', 'Yoruğ'], ['dark', 'Qoronği']].map(function (x) { return '<button data-th="' + x[0] + '" aria-pressed="' + (x[0] === th) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      '<div class="section-h">Maʼlumotlar</div><div class="group"><button class="row" id="about" style="--inset:16px"><div class="grow"><div class="t">Resurs haqida</div></div>' + ic('chev', 'chev') + '</button>' +
      '<button class="row" id="reset" style="--inset:16px"><div class="grow"><div class="t" style="color:var(--red)">Natijalarni tozalaş</div></div></button></div>' +
      '<p class="section-f">Natijalar faqat şu qurilmaning brauzerida saqlanadi.</p>';
    bindDirSeg(view, renderProfile);
    $$('[data-th]', view).forEach(function (b) { b.onclick = function () { put('theme', b.getAttribute('data-th')); applyTheme(); renderProfile(); }; });
    $('#about').onclick = aboutSheet;
    $('#reset').onclick = function () {
      if (confirm('Barça örganilgan mavzular va test natijalari öçiriladi. Davom etasizmi?')) { put('read', {}); put('score', {}); put('final', {}); renderProfile(); }
    };
  }

  /* ======================================================
     PLAKAT KO'RIŞ OYNASI va SHEET
     ====================================================== */
  var viewer = $('#viewer'), vScroll = $('#viewerScroll'), vImg = $('#viewerImg');
  function openViewer(src, title) {
    vImg.src = src; vImg.alt = title; $('#viewerTitle').textContent = title;
    vScroll.classList.remove('zoomed'); viewer.hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeViewer() { if (!viewer.hidden) { viewer.hidden = true; document.body.style.overflow = ''; vImg.removeAttribute('src'); } }
  vImg.onclick = function (e) {
    var zoom = !vScroll.classList.contains('zoomed');
    var rx = e.offsetX / vImg.clientWidth, ry = e.offsetY / vImg.clientHeight;
    vScroll.classList.toggle('zoomed', zoom);
    if (zoom) { vScroll.scrollLeft = rx * vImg.clientWidth - vScroll.clientWidth / 2; vScroll.scrollTop = ry * vImg.clientHeight - vScroll.clientHeight / 2; }
  };
  $('#viewerClose').onclick = closeViewer;

  var sheet = $('#sheet');
  function openSheet(html) { $('#sheetBody').innerHTML = html; sheet.hidden = false; }
  function closeSheet() { sheet.hidden = true; }
  sheet.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeViewer(); closeSheet(); } });

  route();
})();

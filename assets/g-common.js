/* =========================================================
   굿모닝펫 A~Z 그물망 시리즈 · 공통 스크립트
   G-common.js — 병원 세팅(localStorage·URL) · 카톡 400자 · is.gd · 그물망 지도
   ========================================================= */
var G = (function () {
  'use strict';

  /* ---------- 26종 그물망 목록 ---------- */
  var LIST = [
    { code:'GAN', letter:'A', eng:'Accounting', ko:'사입·정산',     href:'gan.html',      grp:'원무·운영' },
    { code:'GBN', letter:'B', eng:'Beauty',     ko:'미용·피부',     href:'gbn.html',      grp:'보호자·진료' },
    { code:'GCN', letter:'C', eng:'Care',       ko:'진료보드',      href:'gcn.html',      grp:'진료·검사실' },
    { code:'GDN', letter:'D', eng:'Diagnostic', ko:'검사 결과',     href:'gdn.html',      grp:'진료·검사실' },
    { code:'GEN', letter:'E', eng:'Education',  ko:'참관·교육',     href:'gen.html',      grp:'보호자·진료' },
    { code:'GFN', letter:'F', eng:'Feed',       ko:'맞춤 사료',     href:'gfn.html',      grp:'보호자·진료' },
    { code:'GGN', letter:'G', eng:'Guide',      ko:'이용 가이드',   href:'welcome.html',  grp:'보호자·진료' },
    { code:'GHN', letter:'H', eng:'Health',     ko:'건강관리표',    href:'ghn.html',      grp:'보호자·진료' },
    { code:'GIN', letter:'I', eng:'Import',     ko:'자료·질문수첩', href:'gin.html',      grp:'진료·검사실' },
    { code:'GJN', letter:'J', eng:'Journey',    ko:'생일 엽서·선물', href:'gjn.html',     grp:'보호자·진료' },
    { code:'GKN', letter:'K', eng:'Kit',        ko:'처방·복약',     href:'gkn.html',      grp:'보호자·진료' },
    { code:'GLN', letter:'L', eng:'Lab',        ko:'검사실 루틴',   href:'gln.html',      grp:'진료·검사실' },
    { code:'GMN', letter:'M', eng:'Manual',     ko:'매뉴얼·온보딩', href:'gmn.html',      grp:'원무·운영' },
    { code:'GNN', letter:'N', eng:'Neural',     ko:'AI 자동화',     href:'gnn.html',      grp:'원무·운영' },
    { code:'GON', letter:'O', eng:'Origin',     ko:'개원 스토리',   href:'gon.html',      grp:'원무·운영' },
    { code:'GPN', letter:'P', eng:'Position',   ko:'포지션·마감',   href:'gpn.html',      grp:'원무·운영' },
    { code:'GQN', letter:'Q', eng:'Quiz',       ko:'보고 퀴즈',     href:'gqn.html',      grp:'원무·운영' },
    { code:'GRN', letter:'R', eng:'Recruit',    ko:'채용·면접',     href:'grn.html',      grp:'원무·운영' },
    { code:'GSN', letter:'S', eng:'Stock',      ko:'재구매·주문',   href:'rebuy.html',    grp:'보호자·진료' },
    { code:'GTN', letter:'T', eng:'Talk',       ko:'카톡 안내',     href:'universal.html',grp:'보호자·진료' },
    { code:'GUN', letter:'U', eng:'Urgent',     ko:'응급 대처',     href:'gun.html',      grp:'보호자·진료' },
    { code:'GVN', letter:'V', eng:'Visit',      ko:'진료 신청',     href:'gvn.html',      grp:'보호자·진료' },
    { code:'GWN', letter:'W', eng:'Weight',     ko:'체중·만성질환', href:'gwn.html',      grp:'보호자·진료' },
    { code:'GXN', letter:'X', eng:'eXit',       ko:'미내원·03마감', href:'gxn.html',      grp:'원무·운영' },
    { code:'GYN', letter:'Y', eng:'Yearly',     ko:'연간 백신·검진', href:'gyn.html',     grp:'보호자·진료' },
    { code:'GZN', letter:'Z', eng:'Zero',       ko:'제로 청소',     href:'gzn.html',      grp:'진료·검사실' }
  ];

  var DEFAULTS = {
    hospital: '굿모닝펫동물병원',
    slogan: 'since 2003 · 평생 주치의',
    theme: 'sky',
    kakao: '',
    phone: '031-715-7119'
  };
  var THEMES = [
    { id:'sky',   name:'하늘',   color:'#7cc6e8' },
    { id:'mint',  name:'민트',   color:'#5fc4ad' },
    { id:'pink',  name:'핑크',   color:'#f5a3bd' },
    { id:'navy',  name:'네이비', color:'#2b5f8a' },
    { id:'cream', name:'크림',   color:'#dcb877' }
  ];
  var KEY = 'gnet_settings_v1';
  var SHORT_KEY = 'gnet_short_v1';

  /* ---------- 작은 도구들 ---------- */
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function load() {
    var out = {};
    for (var k in DEFAULTS) { if (Object.prototype.hasOwnProperty.call(DEFAULTS, k)) out[k] = DEFAULTS[k]; }
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) {
        var o = JSON.parse(raw);
        for (var p in o) { if (o[p] != null && o[p] !== '') out[p] = o[p]; }
      }
    } catch (e) {}
    return out;
  }
  function save(o) {
    try { window.localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }
  function readParams() {
    var out = {};
    try {
      var sp = new URLSearchParams(window.location.search);
      ['hospital', 'slogan', 'theme', 'kakao', 'phone'].forEach(function (k) {
        var v = sp.get(k);
        if (v) out[k] = v;
      });
    } catch (e) {}
    return out;
  }
  function settings() {
    var s = load();
    var p = readParams();
    for (var k in p) { if (Object.prototype.hasOwnProperty.call(p, k)) s[k] = p[k]; }
    if (p.theme) {
      var merged = load();
      merged.theme = p.theme;
      save(merged);
    }
    if (!/^(sky|mint|pink|navy|cream)$/.test(s.theme)) s.theme = 'sky';
    return s;
  }
  function applyTheme(id) {
    document.documentElement.setAttribute('data-theme', id || 'sky');
    var meta = q('meta[name="theme-color"]');
    if (meta) {
      var map = { sky:'#eaf6fb', mint:'#e9f8f4', pink:'#fdeef4', navy:'#e9f1f8', cream:'#fbf4e4' };
      meta.setAttribute('content', map[id] || '#eaf6fb');
    }
  }

  function toast(text) {
    var el = q('#g-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'g-toast';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 2300);
  }

  function count(s) {
    s = String(s == null ? '' : s);
    if (typeof Array.from === 'function') return Array.from(s).length;
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) i++;
      n++;
    }
    return n;
  }
  function cut(s, limit) {
    s = String(s == null ? '' : s);
    if (count(s) <= limit) return s;
    var arr = typeof Array.from === 'function' ? Array.from(s) : s.split('');
    return arr.slice(0, Math.max(0, limit - 1)).join('') + '…';
  }

  /* 받침 유무에 맞춘 조사 */
  function hasBatchim(word) {
    word = String(word || '').replace(/<[^>]*>/g, ' ').trim();
    if (!word) return false;
    var ch = word.charAt(word.length - 1);
    var code = ch.charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return false;
    return (code - 0xAC00) % 28 !== 0;
  }
  function josa(word, withB, withoutB) { return word + (hasBatchim(word) ? withB : withoutB); }

  function money(n) {
    if (n == null || isNaN(n)) return '0';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function today() {
    var d = new Date();
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + mm + '-' + dd;
  }
  function addDays(base, days) {
    var d = new Date(base.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }
  function isoDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    return d.getFullYear() + '-' + mm + '-' + dd;
  }
  function fmtDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    return d.getFullYear() + '. ' + (d.getMonth() + 1) + '. ' + d.getDate() + '.';
  }
  function dday(target) {
    var t = new Date(target + 'T00:00:00');
    if (isNaN(t.getTime())) return '';
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var diff = Math.round((t - now) / 86400000);
    if (diff === 0) return '오늘';
    return diff > 0 ? 'D-' + diff : 'D+' + Math.abs(diff);
  }

  /* ---------- 복사 · 공유 ---------- */
  function copy(text) {
    var t = String(text == null ? '' : text);
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return legacyCopy(t); });
    }
    return Promise.resolve(legacyCopy(t));
  }
  function legacyCopy(t) {
    try {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, t.length);
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }
  function share(text) {
    if (navigator.share) {
      return navigator.share({ text: String(text) }).then(function () { return true; }, function () { return false; });
    }
    toast('이 브라우저는 공유 창을 지원하지 않아요. 문구를 복사해 붙여넣어 주세요.');
    return Promise.resolve(false);
  }

  /* ---------- is.gd 단축 (JSONP · 2.5초 제한 · 캐시) ---------- */
  var memShort = {};
  function shortCache() {
    try { return JSON.parse(window.localStorage.getItem(SHORT_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveShort(longUrl, shortUrl) {
    memShort[longUrl] = shortUrl;
    try {
      var c = shortCache();
      c[longUrl] = shortUrl;
      var keys = Object.keys(c);
      if (keys.length > 120) { delete c[keys[0]]; }
      window.localStorage.setItem(SHORT_KEY, JSON.stringify(c));
    } catch (e) {}
  }
  function shorten(longUrl, cb) {
    if (!/^https?:\/\//.test(String(longUrl || ''))) { cb(new Error('bad url')); return; }
    if (memShort[longUrl]) { cb(null, memShort[longUrl]); return; }
    var cached = shortCache()[longUrl];
    if (cached) { memShort[longUrl] = cached; cb(null, cached); return; }

    var done = false;
    var cbName = 'gShort_' + Math.random().toString(36).slice(2, 9);
    var el = document.createElement('script');
    var timer = setTimeout(function () { finish(new Error('timeout')); }, 2500);
    function finish(err, url) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { el.parentNode && el.parentNode.removeChild(el); } catch (e) {}
      try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
      if (!err && url) { saveShort(longUrl, url); cb(null, url); }
      else cb(err || new Error('no url'));
    }
    window[cbName] = function (res) {
      var u = res && (res.shorturl || res.short_url);
      if (u && /^https?:\/\//.test(u)) finish(null, u);
      else finish(new Error('no short url'));
    };
    el.onerror = function () { finish(new Error('load error')); };
    el.src = 'https://is.gd/create.php?format=json&callback=' + cbName + '&url=' + encodeURIComponent(longUrl);
    document.head.appendChild(el);
  }
  function baseUrl() {
    return window.location.origin + window.location.pathname;
  }

  /* ---------- 카톡 문구 키트 (400자 · 복사 · 단축 · 공유) ---------- */
  function msgKit(opts) {
    opts = opts || {};
    var ta = q(opts.msg || '#msg');
    var copyBtn = q(opts.copy || '#copy');
    var shortBtn = q(opts.short || '#short');
    var shareBtn = q(opts.share || '#share');
    var cntEl = q(opts.count || '#cnt');
    var cntWrap = q(opts.counter || '.count');
    var state = { short: '' };
    var timer = null;
    var dirty = false;

    var LIMIT = opts.limit || 400;
    function updateCount() {
      if (!ta) return;
      var n = count(ta.value);
      if (cntEl) cntEl.textContent = n;
      if (cntWrap) cntWrap.classList.toggle('over', n > LIMIT);
      return n;
    }
    function refresh(force) {
      if (!ta || typeof opts.build !== 'function') return;
      if (document.activeElement === ta && !force) { updateCount(); return; }
      ta.value = opts.build(state);
      dirty = false;
      updateCount();
      if (typeof opts.onRefresh === 'function') opts.onRefresh(state);
      if (opts.autoShort && typeof opts.link === 'function') scheduleShort();
    }
    function scheduleShort() {
      if (!opts.autoShort) return;
      if (state.short) return;
      clearTimeout(timer);
      timer = setTimeout(function () {
        var long = opts.link && opts.link(state);
        if (!long) return;
        shorten(long, function (err, url) {
          if (err) return;
          if (state.short === url) return;
          state.short = url;
          refresh(true);
        });
      }, 900);
    }
    if (ta) {
      ta.addEventListener('input', function () { dirty = true; updateCount(); });
    }
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copy(ta.value).then(function (ok) {
          toast(ok ? '카톡에 붙여넣기 하세요 — 복사됐습니다' : '복사가 막혔어요. 문구를 길게 눌러 직접 복사해 주세요');
        });
      });
    }
    if (shortBtn) {
      shortBtn.addEventListener('click', function () {
        var long = opts.link && opts.link(state);
        if (!long) { toast(opts.shortHint || '먼저 위 내용을 채워 주세요'); return; }
        shortBtn.disabled = true;
        shorten(long, function (err, url) {
          shortBtn.disabled = false;
          if (err) { toast('단축이 지연돼요 — 긴 링크 그대로 쓰셔도 됩니다'); state.short = long; refresh(true); return; }
          state.short = url;
          refresh(true);
          toast('짧은 링크로 바꿨어요: ' + url);
        });
      });
    }
    if (shareBtn) {
      shareBtn.addEventListener('click', function () { share(ta.value); });
    }
    return {
      refresh: refresh,
      updateCount: updateCount,
      state: state,
      shortNow: function (long) {
        shorten(long, function (err, url) {
          if (err) return;
          state.short = url;
          refresh(true);
        });
      }
    };
  }

  /* ---------- 상단 바 · 설정 패널 · 그물망 지도 ---------- */
  function header() {
    var host = q('#g-top');
    if (!host) return;
    host.className = 'g-top';
    host.innerHTML =
      '<div class="bar">' +
        '<div class="g-logo" aria-hidden="true">🐾</div>' +
        '<div class="g-brand"><span class="n" id="g-hosp"></span><span class="s">G-시리즈 A~Z 그물망 · 직원도 편하고 보호자도 편한</span></div>' +
        '<button class="g-icon-btn" id="g-map-btn" type="button" aria-expanded="false">▦ A~Z</button>' +
        '<button class="g-icon-btn" id="g-set-btn" type="button" aria-expanded="false">⚙ 세팅</button>' +
      '</div>' +
      '<div class="g-panel" id="g-map">' +
        '<div class="inner">' +
          '<div class="g-field"><label>굿모닝펫 A~Z 그물망 26칸</label></div>' +
          '<div class="hexmap" id="g-hexmap"></div>' +
          '<p class="g-hint">칸을 누르면 그 자리의 전용 페이지가 열립니다. 지금 보시는 칸은 테두리로 표시됩니다.</p>' +
        '</div>' +
      '</div>' +
      '<div class="g-panel" id="g-panel">' +
        '<div class="inner">' +
          '<div class="g-field"><label>병원명</label><input id="g-in-hosp" type="text" placeholder="우리 병원 이름" autocomplete="organization"></div>' +
          '<div class="g-field"><label>슬로건</label><input id="g-in-slogan" type="text" placeholder="since 2003 · 평생 주치의"></div>' +
          '<div class="g-field"><label>카톡 링크 <span class="hint">(선택 · 오픈채팅/채널 주소)</span></label><input id="g-in-kakao" type="text" placeholder="https://open.kakao.com/o/..." inputmode="url"></div>' +
          '<div class="g-field"><label>대표 전화</label><input id="g-in-phone" type="tel" placeholder="031-000-0000" inputmode="tel"></div>' +
          '<div class="g-field"><label>배경 테마</label><div class="themes" id="g-themes"></div></div>' +
          '<div class="btnrow"><button class="btn solid" id="g-save" type="button">저장</button><button class="btn ghost" id="g-reset" type="button">기본값</button></div>' +
          '<p class="g-hint">이 설정은 이 기기 브라우저에만 저장됩니다. 주소 끝에 <b>?hospital=병원명&amp;slogan=슬로건&amp;theme=mint</b>를 붙여 보내면 그 값이 우선 적용됩니다.</p>' +
        '</div>' +
      '</div>';

    var s = settings();
    applyTheme(s.theme);
    var nameEl = q('#g-hosp');
    if (nameEl) nameEl.textContent = s.hospital;
    var ih = q('#g-in-hosp'), isg = q('#g-in-slogan'), ik = q('#g-in-kakao'), ip = q('#g-in-phone');
    ih.value = s.hospital; isg.value = s.slogan; ik.value = s.kakao || ''; ip.value = s.phone || '';

    var th = q('#g-themes');
    THEMES.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sw';
      b.setAttribute('aria-pressed', t.id === s.theme ? 'true' : 'false');
      b.innerHTML = '<i style="background:' + t.color + '"></i>' + t.name;
      b.addEventListener('click', function () {
        applyTheme(t.id);
        qa('.sw', th).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var cur = settings(); cur.theme = t.id; save(cur);
      });
      th.appendChild(b);
    });

    var panel = q('#g-panel'), map = q('#g-map');
    function toggle(el, btn) {
      var open = el.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var other = el === panel ? map : panel;
      var otherBtn = el === panel ? q('#g-map-btn') : q('#g-set-btn');
      if (open && other.classList.contains('open')) {
        other.classList.remove('open');
        otherBtn.setAttribute('aria-expanded', 'false');
      }
    }
    q('#g-set-btn').addEventListener('click', function () { toggle(panel, this); });
    q('#g-map-btn').addEventListener('click', function () { toggle(map, this); });

    q('#g-save').addEventListener('click', function () {
      var cur = settings();
      cur.hospital = ih.value.trim() || DEFAULTS.hospital;
      cur.slogan = isg.value.trim();
      cur.kakao = ik.value.trim();
      cur.phone = ip.value.trim();
      save(cur);
      if (nameEl) nameEl.textContent = cur.hospital;
      panel.classList.remove('open');
      toast('저장했습니다 — 모든 페이지에 함께 적용됩니다');
      document.dispatchEvent(new CustomEvent('g-settings', { detail: cur }));
    });
    q('#g-reset').addEventListener('click', function () {
      save(DEFAULTS);
      ih.value = DEFAULTS.hospital; isg.value = DEFAULTS.slogan; ik.value = ''; ip.value = DEFAULTS.phone;
      applyTheme(DEFAULTS.theme);
      if (nameEl) nameEl.textContent = DEFAULTS.hospital;
      qa('.sw', th).forEach(function (x, i) { x.setAttribute('aria-pressed', THEMES[i].id === DEFAULTS.theme ? 'true' : 'false'); });
      toast('기본값으로 되돌렸습니다');
      document.dispatchEvent(new CustomEvent('g-settings', { detail: DEFAULTS }));
    });

    var code = document.body.getAttribute('data-code') || '';
    var hm = q('#g-hexmap');
    if (hm) {
      hm.innerHTML = LIST.map(function (x) {
        return '<a class="hex' + (x.code === code ? ' on' : '') + '" href="' + x.href + '" title="' + esc(x.code + ' · ' + x.ko) + '">' +
          '<span class="c">' + x.code + '</span><span class="l">' + esc(x.ko) + '</span></a>';
      }).join('');
    }
  }

  function relate(code) {
    var i = -1;
    for (var k = 0; k < LIST.length; k++) { if (LIST[k].code === code) { i = k; break; } }
    if (i < 0) return null;
    return {
      self: LIST[i],
      prev: LIST[(i + 25) % 26],
      next: LIST[(i + 1) % 26]
    };
  }

  function footer() {
    var host = q('#g-footer');
    if (!host) return;
    var s = settings();
    host.innerHTML =
      '<div class="b">' + esc(s.hospital) + ' · 굿모닝펫 A~Z 그물망 시리즈</div>' +
      '직원도 편하고 · 보호자도 편하고 · 병원에도 좋은 평생 주치의 시스템<br>' +
      '<span class="small">G = Goodmorningpet · A~Z = 26개 연결 · N = Net(그물망)</span>';
  }

  /* ---------- 결과 카드(카톡 문구) 공통 마운트 ---------- */
  function outKit(o) {
    o = o || {};
    var host = q(o.mount || '#out');
    if (!host) return null;
    host.innerHTML =
      '<section class="card">' +
        '<div class="sec-head"><span class="num">' + (o.num || '') + '</span><h2>' + (o.title || '보호자에게 보낼 카톡 문구') +
          (o.sub ? '<small>' + o.sub + '</small>' : '') + '</h2></div>' +
        (o.lead ? '<p>' + o.lead + '</p>' : '') +
        '<textarea class="msg" id="msg" spellcheck="false"></textarea>' +
        '<div class="msg-foot"><div class="count"><b id="cnt">0</b> / ' + (o.limit || 400) + '자</div>' +
          (o.extraHref ? '<a class="chip-link" id="extraLink" target="_blank" rel="noopener" style="display:none"></a>' : '') +
        '</div>' +
        '<div class="btns">' +
          '<button class="btn primary" id="copy" type="button">' + (o.copyLabel || '📋 문구 복사') + '</button>' +
          (o.noShort ? '' : '<button class="btn ghost" id="short" type="button">🔗 짧은 링크</button>') +
          '<button class="btn ghost wide" id="share" type="button">카톡으로 공유</button>' +
        '</div>' +
        (o.note ? '<p class="note">' + o.note + '</p>' : '<p class="note" id="shortNote"></p>') +
      '</section>';

    var kit = msgKit({
      build: o.build,
      link: o.link,
      autoShort: !!o.autoShort,
      shortHint: o.shortHint,
      limit: o.limit || 400
    });

    if (o.extraHref) {
      var base = kit.refresh;
      kit.refresh = function (force) {
        base(force);
        var a = q('#extraLink');
        var url = o.extraHref(kit.state);
        if (url) { a.href = url; a.textContent = o.extraLabel ? o.extraLabel(kit.state) : '열어보기'; a.style.display = ''; }
        else { a.style.display = 'none'; }
      };
    }
    var shortBtn = q('#short');
    if (shortBtn) {
      shortBtn.addEventListener('click', function () {
        setTimeout(function () {
          var n = q('#shortNote');
          if (n) n.textContent = kit.state.short
            ? '짧은 링크: ' + kit.state.short + ' — 문구에 자동으로 들어갔습니다.'
            : '링크를 줄이지 못했어요. 긴 주소 그대로도 열립니다.';
        }, 320);
      });
    }
    kit.refresh();
    return kit;
  }

  function init() {
    header();
    footer();
    document.documentElement.classList.add('js');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  return {
    LIST: LIST, THEMES: THEMES, DEFAULTS: DEFAULTS,
    q: q, qa: qa, esc: esc,
    settings: settings, save: save, applyTheme: applyTheme,
    toast: toast, count: count, cut: cut,
    josa: josa, hasBatchim: hasBatchim,
    money: money, today: today, addDays: addDays, fmtDate: fmtDate, isoDate: isoDate, dday: dday,
    copy: copy, share: share, shorten: shorten, baseUrl: baseUrl,
    msgKit: msgKit, outKit: outKit, relate: relate
  };
})();

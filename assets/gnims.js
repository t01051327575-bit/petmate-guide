/* =========================================================
   G-NIMS · 마약류 기록·보고 — 전용 스크립트
   근거: 진료·검사·조제 상세업무 매뉴얼(261112 윤민서) 향정 섹션 PDF p.242~272
   저장: 이 브라우저 localStorage (서버 전송 없음)
   ========================================================= */
(function () {
  'use strict';
  var $ = G.q, $$ = G.qa, esc = G.esc;
  var KEY = 'gnims_v1';
  var MONTH_KEY = 'gnims_month_v1';

  /* ---------- 근거 자료에 나온 약만 (매뉴얼 p.250 제품(의약품)별 재고 화면) ---------- */
  var DRUGS = [
    { id: '부토판주사', full: '부토판주사1밀리그램/밀리리터(주석산부토파놀)', unit: '앰플',
      code: '8806498019126', grade: '일반관리대상', rule: '1앰플 기준으로 투약보고', days: 0, screen: false },
    { id: '조레틸50주사', full: '조레틸50주사(동물용) (145.5mg)', unit: '병',
      code: '', grade: '일반관리대상', rule: '1병에서 사용한 만큼 소수점으로 보고', days: 0, screen: false },
    { id: '프리폴-엔시티주(프로포폴)', full: '프리폴-엔시티주(프로포폴) (20ml)', unit: '병',
      code: '', grade: '중점관리대상', rule: '다른 멘트가 없으면 1/2병 · 사용한 만큼 소수점', days: 0, screen: false },
    { id: '하나페노바르비탈정', full: '하나페노바르비탈정 (30mg)', unit: '정',
      code: '', grade: '일반관리대상', rule: '반드시 3일 내 신고 · NIMS 화면에서 직접 투약보고', days: 3, screen: true }
  ];
  var DRUG = {};
  DRUGS.forEach(function (d) { DRUG[d.id] = d; });

  var PURPOSES = ['마취 전처치', '마취 유도', '마취 유지', '진정', '기타'];
  var UNITS = ['앰플', '병', '정', 'ml', 'mg'];

  /* ---------- 상태 ---------- */
  var S = { cfg: { vet: '장봉환', lic: '', org: 'H02195030', store: 'S0001', idMode: 'rrn' }, prod: {}, rows: [] };
  var seq = Date.now();

  function loadState() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var o = JSON.parse(raw);
      if (o && typeof o === 'object') {
        if (o.cfg) { for (var k in S.cfg) { if (o.cfg[k] != null) S.cfg[k] = o.cfg[k]; } }
        if (o.prod && typeof o.prod === 'object') S.prod = o.prod;
        if (Array.isArray(o.rows)) S.rows = o.rows;
      }
    } catch (e) {}
  }
  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { G.toast('저장 공간이 가득 찼어요 — CSV로 내보낸 뒤 기록을 비워 주세요'); }
  }
  function prodOf(id) {
    if (!S.prod[id]) S.prod[id] = { code: (DRUG[id] ? DRUG[id].code : ''), lot: '', exp: '', serial: '' };
    var p = S.prod[id];
    if (p.code == null) p.code = DRUG[id] ? DRUG[id].code : '';
    return p;
  }

  /* ---------- 날짜·번호 도우미 ---------- */
  function today() { return G.today(); }
  function ymd(d) { return String(d || '').replace(/-/g, ''); }
  function dot(d) { return String(d || '').replace(/-/g, '. '); }
  function daysBetween(a, b) {
    var x = new Date(a + 'T00:00:00'), y = new Date(b + 'T00:00:00');
    if (isNaN(x) || isNaN(y)) return null;
    return Math.round((y - x) / 86400000);
  }
  function addDays(d, n) { var x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + n); return G.isoDate(x); }
  function rrnDigits(s) { return String(s || '').replace(/[^0-9]/g, '').slice(0, 13); }
  function rrnFmt(s) {
    var d = rrnDigits(s);
    if (d.length < 7) return String(s || '');
    return d.slice(0, 6) + '-' + d.slice(6, 13);
  }
  function rrnMask(s) {
    var d = rrnDigits(s);
    if (d.length < 7) return '—';
    return d.slice(0, 6) + '-' + d.slice(6, 7) + '******';
  }
  function num(v) { var n = parseFloat(String(v).replace(/,/g, '')); return isNaN(n) ? 0 : n; }
  function fmtQty(v) {
    if (v === '' || v == null) return '';
    var n = num(v);
    return String(Math.round(n * 100) / 100);
  }
  function pad4(n) { return ('000' + n).slice(-4); }

  /* 보고식별번호: 보고한 날 기준 YYYYMMDD-0000 (매뉴얼 p.252) */
  function makeRid(dateStr, serial) { return ymd(dateStr) + '-' + pad4(serial); }
  /* 처방전발급번호: ①번의 '-'를 '0'으로 바꾼 13자리 (매뉴얼 p.252) */
  function ridToRx(rid) { return String(rid || '').replace('-', '0'); }
  function doneGroupsOf(dateStr) {
    var seen = {};
    S.rows.forEach(function (r) { if (r.done && r.doneDate === dateStr && r.rid) seen[r.rid] = 1; });
    return Object.keys(seen).length;
  }
  function nextSerial(dateStr) { return doneGroupsOf(dateStr) + 1; }

  /* ---------- 묶음(처방 단위) ---------- */
  function groups() {
    var map = {}, out = [];
    S.rows.forEach(function (r) {
      if (r.done) return;
      var k = (r.date || '') + '|' + (r.owner || '-') + '|' + (r.pet || '-');
      if (!map[k]) { map[k] = { key: k, date: r.date || '', owner: r.owner || '', pet: r.pet || '', rows: [] }; out.push(map[k]); }
      map[k].rows.push(r);
    });
    out.forEach(function (g) {
      var worst = null;
      g.rows.forEach(function (r) {
        var d = DRUG[r.drug];
        if (!d || !d.days) return;
        var left = daysBetween(r.date, today()); // 경과일
        var due = d.days - left; // 남은 일수
        if (worst === null || due < worst.due) worst = { due: due, days: d.days, drug: r.drug };
      });
      g.dday = worst;
      g.oldest = 0;
      g.rows.forEach(function (r) {
        var n = daysBetween(r.date, today());
        if (n != null && n > g.oldest) g.oldest = n;
      });
      g.hot = !!(worst && worst.due <= 0);
      g.soon = !!(worst && worst.due > 0 && worst.due <= 2);
    });
    out.sort(function (a, b) {
      if (a.hot !== b.hot) return a.hot ? -1 : 1;
      if (a.soon !== b.soon) return a.soon ? -1 : 1;
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return 0;
    });
    return out;
  }

  /* ---------- 오늘 요약 ---------- */
  function summary() {
    var gs = groups();
    var hot = gs.filter(function (g) { return g.hot; }).length;
    var soon = gs.filter(function (g) { return g.soon; }).length;
    var rows = 0;
    gs.forEach(function (g) { rows += g.rows.length; });
    return { groups: gs.length, rows: rows, hot: hot, soon: soon };
  }
  function renderSummary() {
    var s = summary();
    var host = $('#gnSum');
    if (!host) return;
    var d = today();
    var cls = s.hot ? 'hot' : '';
    var line = s.rows === 0
      ? '보고 대기 없음 — 오늘 사용분이 생기면 여기에 바로 뜹니다'
      : (s.hot ? '기한 지난 건이 있어요 — 먼저 확인해 주세요'
        : (s.soon ? '기한이 가까운 건이 있어요' : '오늘 바로 보고할 건'));
    var sub = '기준 ' + dot(d) + ' · ' + (s.groups ? (s.groups + '묶음 / ' + s.rows + '건') : '대기 0건');
    host.className = 'gn-sum ' + cls;
    host.innerHTML =
      '<div class="n"><i>' + s.rows + '</i><s>미보고</s></div>' +
      '<div class="t"><b>' + esc(line) + '</b><span>' + esc(sub) + '</span></div>' +
      '<a class="go" href="#queue">대기함 →</a>';
  }

  /* ---------- 알림(누락 경고) ---------- */
  function renderAlert() {
    var host = $('#gnAlert');
    if (!host) return;
    var gs = groups();
    var hot = gs.filter(function (g) { return g.hot; });
    var soon = gs.filter(function (g) { return g.soon; });
    var old = gs.filter(function (g) { return !g.dday && g.oldest >= 3; });
    if (!hot.length && !soon.length && !old.length) {
      host.innerHTML = '<div class="gn-alert ok"><b>누락 경고 없음.</b> 기한이 지난 보고는 없습니다. 새 사용 기록을 넣으면 여기서 자동으로 잡아 줍니다.</div>';
      return;
    }
    var h = '';
    if (hot.length) {
      h += '<div class="gn-alert"><b>기한 지남 · 오늘 안에 보고</b><ul>' + hot.map(function (g) {
        var t = g.dday;
        return '<li>' + esc(g.owner || '보호자 미입력') + ' · ' + esc(g.pet || '아이 미입력') + ' — ' + esc(t.drug) +
          ' <b>' + (t.due === 0 ? '오늘까지' : Math.abs(t.due) + '일 지남') + '</b> (사용 ' + dot(g.date) + ')</li>';
      }).join('') + '</ul></div>';
    }
    if (soon.length) {
      h += '<div class="gn-alert soft"><b>기한 임박</b><ul>' + soon.map(function (g) {
        return '<li>' + esc(g.owner || '보호자 미입력') + ' · ' + esc(g.pet || '아이 미입력') + ' — ' + esc(g.dday.drug) +
          ' <b>D-' + g.dday.due + '</b> (사용 ' + dot(g.date) + ')</li>';
      }).join('') + '</ul></div>';
    }
    if (old.length) {
      h += '<div class="gn-alert soft"><b>사용 후 3일 지난 미보고</b> — 주사제는 매뉴얼에 기한이 적혀 있지 않아 경과일만 표시합니다.<ul>' + old.map(function (g) {
        return '<li>' + esc(g.owner || '보호자 미입력') + ' · ' + esc(g.pet || '아이 미입력') + ' — 사용 ' + dot(g.date) + ' (' + g.oldest + '일 경과)</li>';
      }).join('') + '</ul></div>';
    }
    host.innerHTML = h;
  }

  /* ---------- 대장 ---------- */
  function renderLedger() {
    var body = $('#gnBody');
    if (!body) return;
    var q = ($('#gnFind').value || '').trim();
    var rows = S.rows.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (b.id || 0) - (a.id || 0);
    });
    if (q) {
      rows = rows.filter(function (r) {
        return (r.pet + r.owner + r.drug + (r.memo || '')).indexOf(q) >= 0;
      });
    }
    if (!rows.length) {
      body.innerHTML = '<tr><td class="l" colspan="7" style="padding:18px 8px;color:#71858f">아직 기록이 없습니다. 위 입력칸에서 오늘 사용분을 넣어 주세요.</td></tr>';
      return;
    }
    body.innerHTML = rows.map(function (r) {
      var d = DRUG[r.drug] || { id: r.drug, unit: r.unit || '', days: 0 };
      var left = daysBetween(r.date, today());
      var due = d.days ? (d.days - left) : null;
      var cls = (r.done ? '' : (due != null && due <= 0 ? 'bad' : (due != null && due <= 2 ? 'warn' : '')));
      var report;
      if (r.done) {
        report = '<span class="done" title="누르면 보고 완료를 취소합니다">' + esc(r.rid || '완료') + '</span><span class="sub">' + esc(dot(r.doneDate)) + '</span>';
      } else {
        report = '<input class="tin" data-rid="' + r.id + '" placeholder="—" title="보고 후 번호가 자동으로 들어갑니다">' +
          '<span class="sub">' + (due == null ? (left === 0 ? '오늘 사용' : (left != null ? left + '일 경과' : '')) : (due <= 0 ? (due === 0 ? '오늘까지' : 'D+' + Math.abs(due)) : 'D-' + due)) + '</span>';
      }
      return '<tr class="' + cls + '">' +
        '<td class="d">' + dot(r.date) + '</td>' +
        '<td class="l"><span class="nm">' + esc(r.pet || '—') + '</span>' +
          '<span class="sub">' + esc(r.owner || '보호자 —') + ' · ' + esc(r.species || '개') +
          ' <button class="eye" type="button" data-eye="' + r.id + '" aria-label="주민번호 보기">👁</button>' +
          '<span class="rrn" data-rrn="' + r.id + '">' + esc(rrnMask(r.rrn)) + '</span></span></td>' +
        '<td class="l"><span class="nm">' + esc(r.drug) + '</span><span class="sub">' + esc(r.purpose || '') + (r.bottle ? ' · 병 ' + esc(r.bottle) : '') + '</span></td>' +
        '<td class="qty">' + esc(fmtQty(r.qty)) + ' ' + esc(r.unit || d.unit || '') + '</td>' +
        '<td>' + (r.weight ? esc(r.weight) + 'kg' : '—') + '</td>' +
        '<td>' + report + '</td>' +
        '<td><button class="x" type="button" data-del="' + r.id + '" title="이 줄 삭제">✕</button></td>' +
      '</tr>';
    }).join('');
  }

  /* ---------- 보고 대기함 ---------- */
  var lastGroups = [];
  function renderQueue() {
    var host = $('#gnQueue');
    if (!host) return;
    var gs = groups();
    lastGroups = gs;
    var s = summary();
    var head = '<div class="callout" style="margin-top:0"><b>오늘 보고번호</b> — 지금 보고하면 <b>' +
      makeRid(today(), nextSerial(today())) + '</b> 부터. 그날 보고 순서대로 0001, 0002…로 올라갑니다.' +
      (s.rows ? '' : ' 대기 중인 건이 없습니다.') + '</div>';
    if (!gs.length) {
      host.innerHTML = head + '<div class="gn-alert ok" style="margin-top:12px"><b>보고 대기함이 비어 있습니다.</b> 사용 기록을 넣으면 여기에 자동으로 쌓입니다.</div>';
      return;
    }
    host.innerHTML = head + gs.map(function (g, gi) {
      var badge;
      if (g.dday) {
        badge = g.dday.due <= 0
          ? '<div class="dbadge over">' + (g.dday.due === 0 ? 'D-DAY' : 'D+' + Math.abs(g.dday.due)) + '<s>' + esc(g.dday.drug) + '</s></div>'
          : '<div class="dbadge soon">D-' + g.dday.due + '<s>' + esc(g.dday.drug) + '</s></div>';
      } else {
        badge = '<div class="dbadge none">기한 미정<s>매뉴얼에 기한 없음</s></div>';
      }
      var lines = g.rows.map(function (r) {
        var d = DRUG[r.drug] || { rule: '' };
        var p = prodOf(r.drug);
        var meta = [];
        meta.push(d.rule || '');
        if (p.code) meta.push('제품코드 ' + p.code);
        if (p.lot) meta.push('제조 ' + p.lot);
        if (p.exp) meta.push('유효 ' + p.exp);
        if (p.serial) meta.push('일련 ' + p.serial);
        return '<div class="drugline">' +
          '<div class="nm">' + esc(r.drug) + '<em>' + esc(r.purpose || '') + (r.bottle ? ' · 병·봉투 ' + esc(r.bottle) : '') + ' · ' + esc(r.vet || S.cfg.vet || '') + '</em></div>' +
          '<div class="qt">' + esc(fmtQty(r.qty)) + ' ' + esc(r.unit || '') + '</div>' +
          '<div class="meta">' + esc(meta.filter(Boolean).join(' · ')) + '</div>' +
        '</div>';
      }).join('');
      var needRrn = g.rows.some(function (r) { return r.drug === '하나페노바르비탈정'; });
      var rxopt = needRrn ? '<div class="rxopt">' +
          '<span>페노바비탈 처방전발급번호:</span>' +
          '<label><input type="radio" name="rxm-' + gi + '" data-rxm="' + gi + '" value="serial" checked> 년월일+일련번호 (p.245)</label>' +
          '<label><input type="radio" name="rxm-' + gi + '" data-rxm="' + gi + '" value="rrn"> 보호자 주민번호 (p.244)</label>' +
        '</div>' : '';
      var screenOnly = g.rows.every(function (r) { return (DRUG[r.drug] || {}).screen; });
      return '<div class="qcard ' + (g.hot ? 'over' : (g.soon ? 'soon' : '')) + '" data-gk="' + gi + '">' +
        '<div class="qh"><div class="who"><b>' + esc(g.owner || '보호자 미입력') + '</b>' +
          '<span>' + esc(g.pet || '아이 미입력') + ' · ' + dot(g.date) + ' 사용' +
          (g.oldest ? ' (' + g.oldest + '일 경과)' : '') + ' · ' + g.rows.length + '건</span></div>' + badge + '</div>' +
        lines + rxopt +
        '<div class="num">보고 전: ' + (screenOnly ? 'NIMS 화면에서 직접 투약보고(동물병원 신규보고)' : 'NIMS ≫ 보고관리 ≫ 투약보고(동물병원엑셀) 업로드') +
          ' · 이 묶음 ' + (g.rows.length) + '줄</div>' +
        '<div class="qfoot">' +
          '<button class="btn primary" type="button" data-done="' + gi + '">✅ 보고 완료</button>' +
          '<button class="btn ghost" type="button" data-copyex="' + gi + '">📋 엑셀 25칸 복사</button>' +
          '<button class="btn ghost" type="button" data-copynum="' + gi + '">🔢 보고번호 복사</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ---------- 월 마감 ---------- */
  function monthValue() {
    var el = $('#gnMonth');
    return (el && el.value) || (ymd(today()).slice(0, 6).replace(/(\d{4})(\d{2})/, '$1-$2'));
  }
  function monthRows(m) { return S.rows.filter(function (r) { return String(r.date || '').slice(0, 7) === m; }); }
  function renderMonth() {
    var m = monthValue();
    var rows = monthRows(m);
    var host = $('#gnMonthOut');
    if (!host) return;
    var byDrug = {};
    rows.forEach(function (r) {
      var k = r.drug;
      if (!byDrug[k]) byDrug[k] = { n: 0, q: 0, unit: r.unit || (DRUG[k] ? DRUG[k].unit : '') };
      byDrug[k].n++; byDrug[k].q += num(r.qty);
    });
    var done = rows.filter(function (r) { return r.done; }).length;
    var pending = rows.length - done;
    var reports = {};
    rows.forEach(function (r) { if (r.done && r.rid) reports[r.rid] = 1; });
    var stat =
      '<div class="mstat">' +
        '<div class="box"><span>사용 기록</span><b>' + rows.length + '<small>건</small></b></div>' +
        '<div class="box"><span>보고 완료</span><b>' + done + '<small>건</small></b></div>' +
        '<div class="box ' + (pending ? 'bad' : '') + '"><span>미보고</span><b>' + pending + '<small>건</small></b></div>' +
        '<div class="box"><span>보고번호</span><b>' + Object.keys(reports).length + '<small>묶음</small></b></div>' +
      '</div>';
    var dtable = Object.keys(byDrug).length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>약</th><th>건수</th><th>사용량 합계</th></tr></thead><tbody>' +
      Object.keys(byDrug).map(function (k) {
        var v = byDrug[k];
        return '<tr><td class="l">' + esc(k) + '</td><td>' + v.n + '</td><td><b>' + esc(String(Math.round(v.q * 100) / 100)) + ' ' + esc(v.unit) + '</b></td></tr>';
      }).join('') + '</tbody></table></div>' : '<p class="tip">이 달 기록이 없습니다.</p>';
    host.innerHTML = stat + dtable;
  }

  /* ---------- 약별 제품 정보 ---------- */
  function renderProd() {
    var host = $('#gnProd');
    if (!host) return;
    host.innerHTML = DRUGS.map(function (d) {
      var p = prodOf(d.id);
      return '<div class="pcard">' +
        '<div class="ph"><b>' + esc(d.id) + '</b><i>' + esc(d.grade) + ' · 기본 단위 ' + esc(d.unit) + '</i></div>' +
        '<div class="g4">' +
          '<div class="field"><label>제품코드</label><input type="text" inputmode="numeric" data-prod="' + d.id + '" data-f="code" value="' + esc(p.code) + '"></div>' +
          '<div class="field"><label>제조번호</label><input type="text" data-prod="' + d.id + '" data-f="lot" value="' + esc(p.lot) + '"></div>' +
          '<div class="field"><label>유효기한 (YYYYMMDD)</label><input type="text" inputmode="numeric" data-prod="' + d.id + '" data-f="exp" value="' + esc(p.exp) + '"></div>' +
          '<div class="field"><label>제조일련번호</label><input type="text" data-prod="' + d.id + '" data-f="serial" value="' + esc(p.serial) + '"></div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ---------- CSV ---------- */
  var CSV_HEAD = ['① 보고식별번호', '② 취급일자', '③ 소유자구분', '④ 식별유형', '⑤ 식별번호', '⑥ 소유자명', '⑦ 처방의 유형',
    '⑧ 처방의 면허번호', '⑨ 처방의명', '⑩ 처방기관코드', '⑪ 처방전발급번호', '⑫ 동물질병명', '⑬ 동물의 종류구분', '⑭ 기타 동물의 종류',
    '⑮ 동물마릿수', '⑯ 저장번호', '⑰ 제품코드', '⑱ 제조번호', '⑲ 유효기한', '⑳ 제조일련번호', '㉑ 조제/투약수량', '㉒ 1회 투여량',
    '㉓ 1일 투여횟수', '㉔ 총투여일수', '㉕ 사용후 폐기량'];
  function nimsCells(r) {
    var p = prodOf(r.drug);
    var rx = r.done ? (r.rx || ridToRx(r.rid)) : '';
    var gidMode = S.cfg.idMode === 'gid' && r.gid;
    return [
      r.rid || '', ymd(r.date), '동물소유자', gidMode ? '' : '주민등록번호',
      gidMode ? r.gid : rrnDigits(r.rrn), r.owner || '',
      '3', S.cfg.lic || '', S.cfg.vet || '', S.cfg.org || '', rx,
      r.disease || r.purpose || '', r.species || '개', '', '1', S.cfg.store || 'S0001',
      p.code || '', p.lot || '', p.exp || '', p.serial || '',
      fmtQty(r.qty), fmtQty(r.qty), '1', '1', '0'
    ];
  }
  function csvCell(v) {
    var s = String(v == null ? '' : v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function downloadCSV(rows, name, withHead) {
    rows = rows.slice().sort(function (a, b) { return (a.date || '') < (b.date || '') ? -1 : 1; });
    var lines = [];
    if (withHead) lines.push(CSV_HEAD.map(csvCell).join(','));
    rows.forEach(function (r) { lines.push(nimsCells(r).map(csvCell).join(',')); });
    var txt = '\ufeff' + lines.join('\r\n');
    var blob = new Blob([txt], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1200);
  }

  /* ---------- 입력 ---------- */
  function fillDrugSelect() {
    var sel = $('#fDrug');
    if (!sel) return;
    sel.innerHTML = DRUGS.map(function (d) { return '<option value="' + d.id + '">' + d.id + '</option>'; }).join('');
  }
  function fillSelects() {
    var p = $('#fPurpose');
    if (p) p.innerHTML = PURPOSES.map(function (x) { return '<option>' + x + '</option>'; }).join('');
    var u = $('#fUnit');
    if (u) u.innerHTML = UNITS.map(function (x) { return '<option>' + x + '</option>'; }).join('');
    fillDrugSelect();
  }
  function syncUnit() {
    var d = DRUG[$('#fDrug').value];
    if (!d) return;
    $('#fUnit').value = d.unit;
    var hint = $('#fRule');
    if (hint) hint.textContent = d.rule;
  }
  function addRow() {
    var dv = $('#fDate').value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dv)) dv = today();
    var r = {
      id: ++seq, date: dv,
      pet: ($('#fPet').value || '').trim(), owner: ($('#fOwner').value || '').trim(),
      rrn: rrnFmt($('#fRrn').value), weight: ($('#fWeight').value || '').trim(),
      drug: $('#fDrug').value, qty: fmtQty($('#fQty').value), unit: $('#fUnit').value,
      left: ($('#fLeft').value || '').trim(), purpose: $('#fPurpose').value,
      disease: ($('#fDisease').value || '').trim(), vet: ($('#fVet').value || S.cfg.vet || '').trim(),
      bottle: ($('#fBottle').value || '').trim(), species: $('#fSpecies').value,
      gid: ($('#fGid') ? ($('#fGid').value || '').trim() : ''),
      memo: '', done: false, rid: '', rx: '', doneDate: ''
    };
    if (!r.pet) { G.toast('아이 이름을 넣어 주세요'); $('#fPet').focus(); return; }
    if (!r.qty || num(r.qty) <= 0) { G.toast('사용량을 숫자로 넣어 주세요'); $('#fQty').focus(); return; }
    if (r.drug === '하나페노바르비탈정' && rrnDigits(r.rrn).length !== 13) {
      G.toast('페노바비탈은 보호자 주민등록번호 13자리가 필요합니다');
      $('#fRrn').focus(); return;
    }
    S.rows.push(r);
    saveState();
    ['fPet', 'fOwner', 'fRrn', 'fWeight', 'fQty', 'fLeft', 'fBottle', 'fDisease', 'fGid'].forEach(function (id) { var el = $('#' + id); if (el) el.value = ''; });
    $('#fOwner').focus();
    renderAll();
    G.toast('기록했습니다 — 보고 대기함에 올렸습니다' + (DRUG[r.drug].days ? ' (페노바비탈 · ' + DRUG[r.drug].days + '일 내 보고)' : ''));
  }

  /* ---------- 완료 처리 ---------- */
  function groupByIndex(i) { return lastGroups[parseInt(i, 10)] || null; }
  function completeGroup(i) {
    var g = groupByIndex(i);
    if (!g) return;
    var t = today();
    var rid = makeRid(t, nextSerial(t));
    var mode = 'serial';
    var radio = $('input[data-rxm="' + i + '"]:checked');
    if (radio) mode = radio.value;
    g.rows.forEach(function (r) {
      r.done = true; r.rid = rid; r.doneDate = t;
      r.rx = (mode === 'rrn') ? rrnDigits(r.rrn) : ridToRx(rid);
    });
    saveState(); renderAll();
    G.toast('보고 완료 — ' + rid + ' (' + g.rows.length + '줄). 엑셀 25칸을 복사해 관리대장에 붙여 넣으세요');
  }
  function undoGroup(rid) {
    S.rows.forEach(function (r) { if (r.rid === rid) { r.done = false; r.rid = ''; r.rx = ''; r.doneDate = ''; } });
    saveState(); renderAll();
    G.toast(rid + ' 보고 완료를 되돌렸습니다');
  }
  function copyExcel(i) {
    var g = groupByIndex(i);
    if (!g) return;
    var t = today();
    var rid = makeRid(t, nextSerial(t));
    var mode = 'serial';
    var radio = $('input[data-rxm="' + i + '"]:checked');
    if (radio) mode = radio.value;
    var out = g.rows.map(function (r) {
      var tmp = { date: r.date, rrn: r.rrn, gid: r.gid, owner: r.owner, drug: r.drug, qty: r.qty, disease: r.disease,
        purpose: r.purpose, species: r.species, done: true, rid: rid, rx: (mode === 'rrn' ? rrnDigits(r.rrn) : ridToRx(rid)) };
      return nimsCells(tmp).join('\t');
    }).join('\n');
    G.copy(out).then(function (ok) {
      G.toast(ok ? '엑셀 25칸 복사 — 관리대장 4번째 줄부터 붙여넣으세요' : '복사가 막혔어요. 길게 눌러 직접 복사해 주세요');
    });
  }
  function copyNumber(i) {
    var g = groupByIndex(i);
    if (!g) return;
    var t = today();
    var rid = makeRid(t, nextSerial(t));
    var txt = '보고식별번호 ' + rid + '\n처방전발급번호 ' + ridToRx(rid) + '\n취급일자 ' + ymd(g.date);
    G.copy(txt).then(function (ok) { G.toast(ok ? '보고번호를 복사했습니다' : '복사가 막혔어요'); });
  }

  /* ---------- 예시 ---------- */
  function sampleData() {
    var tday = today();
    var d1 = addDays(tday, -1);
    var d0 = tday;
    var base = [
      { date: d0, pet: '보리', owner: '김서연', rrn: '870512-2345678', weight: '5.2', drug: '프리폴-엔시티주(프로포폴)', qty: '0.5', unit: '병', purpose: '마취 유도', disease: '스케일링', bottle: 'A-12', species: '개', memo: '예시' },
      { date: d0, pet: '보리', owner: '김서연', rrn: '870512-2345678', weight: '5.2', drug: '부토판주사', qty: '1', unit: '앰플', purpose: '마취 전처치', disease: '스케일링', bottle: 'A-12', species: '개', memo: '예시' },
      { date: d1, pet: '나비', owner: '이준호', rrn: '910203-1456789', weight: '4.1', drug: '하나페노바르비탈정', qty: '22', unit: '정', purpose: '기타', disease: '경련', bottle: '', species: '고양이', memo: '예시' }
    ];
    base.forEach(function (b) {
      b.id = ++seq; b.vet = S.cfg.vet; b.done = false; b.rid = ''; b.rx = ''; b.doneDate = '';
      S.rows.push(b);
    });
    saveState(); renderAll();
    G.toast('예시 3건을 넣었습니다 — 확인 후 지워 주세요');
  }
  function clearSample() {
    S.rows = S.rows.filter(function (r) { return r.memo !== '예시'; });
    saveState(); renderAll();
    G.toast('예시 데이터를 지웠습니다');
  }

  /* ---------- 전체 렌더 ---------- */
  function renderAll() {
    renderSummary(); renderAlert(); renderLedger(); renderQueue(); renderMonth(); renderProd();
    var hasSample = S.rows.some(function (r) { return r.memo === '예시'; });
    if ($('#gnSampleClear')) $('#gnSampleClear').style.display = hasSample ? '' : 'none';
  }

  /* ---------- 이벤트 ---------- */
  function bind() {
    $('#fDate').value = today();
    $('#fVet').value = S.cfg.vet || '';
    fillSelects(); syncUnit();
    $('#fDrug').addEventListener('change', syncUnit);
    $('#fAdd').addEventListener('click', addRow);
    $('#fRrn').addEventListener('blur', function () { this.value = rrnFmt(this.value); });
    $('#gnFind').addEventListener('input', renderLedger);
    $('#gnMonth').addEventListener('change', function () {
      try { localStorage.setItem(MONTH_KEY, this.value); } catch (e) {}
      renderMonth();
    });

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.getAttribute) return;
      var d;
      if ((d = t.getAttribute('data-del'))) {
        var row = S.rows.filter(function (r) { return String(r.id) === d; })[0];
        if (!row) return;
        if (!confirm((row.pet || '이 줄') + ' 기록을 지울까요?')) return;
        S.rows = S.rows.filter(function (r) { return String(r.id) !== d; });
        saveState(); renderAll();
      } else if ((d = t.getAttribute('data-eye'))) {
        var row2 = S.rows.filter(function (r) { return String(r.id) === d; })[0];
        var cell = $('[data-rrn="' + d + '"]');
        if (!row2 || !cell) return;
        var masked = cell.getAttribute('data-shown') === '1';
        cell.textContent = masked ? rrnMask(row2.rrn) : rrnFmt(row2.rrn);
        cell.setAttribute('data-shown', masked ? '0' : '1');
        t.textContent = masked ? '👁' : '🙈';
      } else if ((d = t.getAttribute('data-done'))) {
        completeGroup(d);
      } else if ((d = t.getAttribute('data-copyex'))) {
        copyExcel(d);
      } else if ((d = t.getAttribute('data-copynum'))) {
        copyNumber(d);
      } else if (t.id === 'gnSample') {
        sampleData();
      } else if (t.id === 'gnSampleClear') {
        clearSample();
      } else if (t.id === 'gnPrint') {
        window.print();
      } else if (t.id === 'gnCSV') {
        var m = monthValue();
        var rows = monthRows(m);
        if (!rows.length) { G.toast('이 달 기록이 없습니다'); return; }
        downloadCSV(rows, 'NIMS-투약보고-' + m.replace('-', '') + '.csv', true);
        G.toast(rows.length + '줄을 CSV로 내보냈습니다');
      } else if (t.id === 'gnCopySum') {
        var mm = monthValue();
        var rs = monthRows(mm);
        var byD = {};
        rs.forEach(function (r) { byD[r.drug] = (byD[r.drug] || 0) + 1; });
        var text = '[향정 월 마감] ' + mm.replace('-', '. ') + '\n' +
          '· 사용 ' + rs.length + '건 · 보고 완료 ' + rs.filter(function (r) { return r.done; }).length + '건' +
          (rs.length - rs.filter(function (r) { return r.done; }).length ? ' · 미보고 ' + (rs.length - rs.filter(function (r) { return r.done; }).length) + '건' : '') + '\n' +
          Object.keys(byD).map(function (k) { return '· ' + k + ' ' + byD[k] + '건'; }).join('\n') +
          '\n\n- ' + G.settings().hospital;
        text = G.cut(text, 400);
        G.copy(text).then(function (ok) { G.toast(ok ? '월 마감 요약을 복사했습니다' : '복사가 막혔어요'); });
      } else if (t.id === 'gnWipe') {
        if (!S.rows.length) { G.toast('지울 기록이 없습니다'); return; }
        if (!confirm('이 기기에 저장된 기록 ' + S.rows.length + '건을 모두 지웁니다.\n먼저 월 마감에서 CSV로 내보내 두셨습니까?')) return;
        if (!confirm('되돌릴 수 없습니다. 정말 지울까요?')) return;
        S.rows = []; saveState(); renderAll(); G.toast('기록을 비웠습니다');
      }
    });

    document.addEventListener('change', function (e) {
      var t = e.target;
      if (!t || !t.getAttribute) return;
      var rid = t.getAttribute('data-rid');
      if (rid && t.value.trim()) {
        var v = t.value.trim();
        var serial = v.split('-')[1];
        if (/^\d{8}-\d{4}$/.test(v)) {
          S.rows.forEach(function (r) {
            if (String(r.id) === rid) { r.done = true; r.rid = v; r.doneDate = v.slice(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'); r.rx = ridToRx(v); }
          });
          saveState(); renderAll(); G.toast('보고번호 ' + v + ' 로 기록했습니다');
        } else {
          G.toast('번호는 20261128-0001 형식(8자리-4자리)으로 넣어 주세요');
          t.value = '';
        }
        return;
      }
      var pid = t.getAttribute('data-prod');
      if (pid) {
        prodOf(pid)[t.getAttribute('data-f')] = t.value.trim();
        saveState(); renderQueue();
        return;
      }
      var ck = t.getAttribute('data-cfg');
      if (ck) {
        S.cfg[ck] = (t.tagName === 'SELECT') ? t.value : t.value.trim();
        if (ck === 'vet' && $('#fVet') && !$('#fVet').value) $('#fVet').value = S.cfg.vet;
        saveState(); renderQueue();
      }
    });

    // 보고 기본값 (처방의명·면허번호·처방기관코드·저장번호·식별번호 기준)
    ['vet', 'lic', 'org', 'store', 'idMode'].forEach(function (k) {
      var el = $('[data-cfg="' + k + '"]');
      if (!el) return;
      if (el.type === 'checkbox') el.checked = S.cfg[k] === 'gid';
      else el.value = S.cfg[k] || '';
    });
    var idSel = $('[data-cfg="idMode"]');
    if (idSel && idSel.tagName === 'SELECT') idSel.value = S.cfg.idMode || 'rrn';

    // 완료 취소 (대장에서 보고번호 클릭)
    $('#gnBody').addEventListener('click', function (e) {
      var el = e.target;
      if (el && el.classList && el.classList.contains('done')) {
        var rid = el.textContent.trim();
        if (rid && confirm(rid + ' 보고 완료를 되돌릴까요? (대기함으로 돌아갑니다)')) undoGroup(rid);
      }
    });
  }

  /* ---------- 시작 ---------- */
  function init() {
    loadState();
    try {
      var m = localStorage.getItem(MONTH_KEY);
      if ($('#gnMonth')) $('#gnMonth').value = m || ymd(today()).slice(0, 4) + '-' + ymd(today()).slice(4, 6);
    } catch (e) {}
    bind();
    renderAll();
    document.addEventListener('g-settings', renderAll);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

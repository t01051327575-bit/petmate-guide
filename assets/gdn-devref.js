/* GDN 장비별 참고치 자동 채우기 — gdn.html 전용 */
(function () {
  var REF = window.GDN_REF;
  if (!REF) return;
  var $ = function (s) { return document.querySelector(s); };
  var devSel = $('#dev'), profSel = $('#prof'), lab = $('#lab'), panel = $('#panel'), sumEl = $('#sum');
  var draft = $('#draft'), refview = $('#refview'), refwrap = $('#refviewwrap'), devnone = $('#devnone');
  var devcustom = $('#devcustom'), draftlen = $('#draftlen');
  var KEY = 'gdn_devref_v1';
  var GROUPS = ['CBC', '생화학', '전해질·혈액가스', '기타 단일마커'];

  /* ---------- 별칭 ---------- */
  var ALIAS = {};
  Object.keys(REF.analytes).forEach(function (code) {
    (REF.analytes[code].alias || []).forEach(function (a) { ALIAS[norm(a)] = code; });
  });
  function norm(s) { return String(s).toUpperCase().replace(/\s+/g, '').replace(/#/g, ''); }

  /* ---------- 장비 선택 ---------- */
  var byMaker = {}, order = [];
  REF.devices.forEach(function (d) {
    if (!byMaker[d.maker]) { byMaker[d.maker] = []; order.push(d.maker); }
    byMaker[d.maker].push(d);
  });
  var html = '<option value="">— 장비를 선택하세요 —</option>';
  order.forEach(function (m) {
    html += '<optgroup label="' + esc(m) + '">';
    byMaker[m].forEach(function (d) {
      html += '<option value="' + d.id + '">' + esc(d.model) + '</option>';
    });
    html += '</optgroup>';
  });
  html += '<option value="__custom">목록에 없는 장비 (직접 입력)</option>';
  devSel.innerHTML = html;

  function dev() {
    var id = devSel.value;
    for (var i = 0; i < REF.devices.length; i++) if (REF.devices[i].id === id) return REF.devices[i];
    return null;
  }
  function prof(d) {
    if (!d) return null;
    for (var i = 0; i < d.profiles.length; i++) if (d.profiles[i].id === profSel.value) return d.profiles[i];
    return d.profiles[0] || null;
  }

  function fillProfiles() {
    var d = dev();
    profSel.innerHTML = '';
    if (!d) { profSel.disabled = true; profSel.innerHTML = '<option>—</option>'; return; }
    profSel.disabled = false;
    d.profiles.forEach(function (p) {
      var o = document.createElement('option');
      o.value = p.id; o.textContent = p.label;
      profSel.appendChild(o);
    });
  }

  /* ---------- 입력 파싱 ---------- */
  function parse(text) {
    var out = [], seen = {};
    text.split(/\n/).forEach(function (line) {
      var clean = line.replace(/[:=]/g, ' ').replace(/[()\[\]]/g, ' ');
      var toks = clean.trim().split(/[\s,;|\t]+/).filter(Boolean);
      var code = null, at = -1;
      for (var i = 0; i < toks.length; i++) {
        var k = norm(toks[i]);
        if (ALIAS[k]) { code = ALIAS[k]; at = i; break; }
      }
      if (!code || seen[code]) return;
      var val = null, unit = '', lessMore = '';
      for (var j = at + 1; j < toks.length; j++) {
        var t = toks[j];
        var m = /^([<>≤≥])?(-?\d+(?:\.\d+)?)$/.exec(t);
        if (m) {
          val = parseFloat(m[2]); lessMore = m[1] || '';
          var u = toks[j + 1];
          if (u && /^[A-Za-zµμ%\/\^0-9³⁶²·]+$/.test(u) && !/^\d/.test(u)) unit = u;
          break;
        }
      }
      if (val === null || isNaN(val)) return;
      seen[code] = 1;
      out.push({ code: code, value: val, unit: unit, lessMore: lessMore, raw: line.trim() });
    });
    return out;
  }

  /* ---------- 판정 ---------- */
  function fmt(v) {
    return (Math.round(v * 100) / 100).toString();
  }
  function rangeText(r) {
    return fmt(r.lo) + '–' + fmt(r.hi) + ' ' + (r.unit || '');
  }
  function judge(r, v) {
    if (!r) return { level: 'hold', label: '판정 보류' };
    var lo = r.lo, hi = r.hi;
    if (v >= lo && v <= hi) return { level: 'ok', label: '정상' };
    var w = hi - lo;
    if (w <= 0) w = Math.abs(hi) * 0.2 || 1;
    var over = v > hi ? (v - hi) / w : (lo - v) / w;
    if (over <= 0.2) return { level: 'edge', label: '경계', over: over };
    return { level: 'bad', label: '치료 필요', over: over };
  }
  var CLS = { ok: 'v-ok', edge: 'v-edge', bad: 'v-bad', hold: 'v-hold' };

  function srcLabel(id, full) {
    var s = REF.sources[id];
    if (!s) return id;
    if (full) return s.doc + ' · ' + s.org + ' · ' + s.year + ' · ' + s.url;
    return s.short || (s.org + ' ' + s.year);
  }
  function srcLine(r) {
    var ids = r.src || [];
    var parts = ids.map(function (id) { return srcLabel(id); });
    var full = ids.map(function (id) { return srcLabel(id, true); }).join('\n');
    var t = '출처: ' + parts.join(' / ');
    if (r.conflict) t += ' · 출처 간 차이 있음';
    return { short: t, full: full };
  }

  /* ---------- 표 ---------- */
  function render() {
    var d = dev(), p = prof(d), rows = parse(lab.value || '');
    sumEl.innerHTML = '';
    panel.innerHTML = '';
    if (!d) {
      refview.innerHTML = '';
      if (devSel.value === '__custom') {
        devnone.hidden = false;
        panel.innerHTML = '<div class="callout"><b>제조사 삽입문서 확인 필요.</b> 목록에 없는 장비는 참고치를 자동으로 채우지 않습니다. ' +
          '제조사 삽입문서나 장비에서 출력된 참고범위를 확인해 <b>측정값 / 참고범위</b>를 직접 적고, 판정은 원장님이 확정해 주세요.</div>';
      } else {
        devnone.hidden = true;
      }
      buildDraft([], {});
      return;
    }
    devnone.hidden = true;
    var vals = p.values || {};
    var unres = {};
    (p.unverified || []).forEach(function (u) { unres[u.code] = u.note; });

    /* 요약 */
    var cnt = { ok: 0, edge: 0, bad: 0, hold: 0, na: 0 };
    rows.forEach(function (row) {
      var r = vals[row.code];
      if (!r && !unres[row.code]) { row.ref = null; row.j = { level: 'na', label: '—' }; cnt.na++; return; }
      var j = judge(r, row.value);
      row.ref = r; row.j = j; cnt[j.level]++;
    });
    sumEl.innerHTML =
      '<span class="chip c-ok">정상 ' + cnt.ok + '</span>' +
      '<span class="chip c-edge">경계 ' + cnt.edge + '</span>' +
      '<span class="chip c-bad">치료 필요 ' + cnt.bad + '</span>' +
      '<span class="chip c-hold">판정 보류 ' + cnt.hold + '</span>' +
      (cnt.na ? '<span class="chip c-hold">이 장비에 없음 ' + cnt.na + '</span>' : '') +
      '<span class="chip c-hold">' + esc(p.label) + ' · ' + rows.length + '항목 입력</span>';

    /* 그룹별 표 */
    if (rows.length) {
      GROUPS.forEach(function (g) {
        var rs = rows.filter(function (row) { return (REF.analytes[row.code] || {}).group === g; });
        if (!rs.length) return;
        var bad = rs.some(function (r) { return r.j.level !== 'ok'; });
        var det = document.createElement('details');
        det.className = 'g';
        if (bad) det.open = true;
        det.innerHTML = '<summary>' + esc(g) + '<span class="n">' + rs.length + '항목' + (bad ? ' · 확인 필요' : '') + '</span></summary>' +
          '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>항목</th><th>측정값</th><th>참고범위</th><th>판정</th><th>출처</th></tr></thead><tbody>' +
          rs.map(function (row) {
            var a = REF.analytes[row.code] || {};
            var s = row.ref ? srcLine(row.ref) : null;
            var refTxt, verd, srcTxt, cls = '';
            if (row.ref) {
              refTxt = rangeText(row.ref);
              if (row.ref.conflict && row.ref.alt) {
                refTxt += '<div class="src">다른 출처: ' + rangeText(row.ref.alt) + ' (' + esc(srcLabel(row.ref.alt.src)) + ')</div>';
              }
              verd = '<span class="badge ' + (row.j.level === 'ok' ? 'ok' : row.j.level === 'edge' ? 'warn' : '') + '">' + row.j.label + '</span>';
              srcTxt = '<span title="' + esc(s.full) + '">' + esc(s.short) + '</span>';
              cls = 'lv-' + (row.j.level === 'ok' ? 'ok' : row.j.level === 'edge' ? 'edge' : 'bad');
            } else if (unres[row.code]) {
              refTxt = '<span class="muted">참고치 확인 필요</span>';
              verd = '<span class="badge">판정 보류</span>';
              srcTxt = esc(unres[row.code]);
              cls = 'lv-hold';
            } else {
              refTxt = '<span class="muted">이 장비에 없음</span>';
              verd = '<span class="badge">—</span>';
              srcTxt = '장비 검사 항목 아님';
              cls = 'lv-hold';
            }
            return '<tr class="' + cls + '"><th>' + esc(a.name || row.code) + '<div class="src">' + esc(a.ko || '') + '</div></th>' +
              '<td>' + row.lessMore + fmt(row.value) + ' <span class="muted">' + esc(row.unit || (row.ref ? row.ref.unit : '')) + '</span></td>' +
              '<td>' + refTxt + '</td><td>' + verd + '</td><td class="src">' + srcTxt + '</td></tr>';
          }).join('') + '</tbody></table></div>';
        panel.appendChild(det);
      });
      if (!panel.children.length) panel.innerHTML = '<div class="callout">입력한 줄에서 검사 항목을 찾지 못했습니다. <b>항목명 수치</b> 순서로 한 줄에 하나씩 넣어 주세요.</div>';
    } else {
      panel.innerHTML = '<div class="callout muted">검사 결과를 붙여넣으면 항목별 <b>측정값 / 참고범위 / 판정 / 출처</b> 표가 나옵니다.</div>';
    }

    /* 참고치 전체 보기 */
    var rv = '';
    GROUPS.forEach(function (g) {
      var codes = Object.keys(vals).filter(function (c) { return (REF.analytes[c] || {}).group === g; });
      if (!codes.length) return;
      rv += '<div style="margin:10px 0 4px;font-weight:700;font-size:13px">' + esc(g) + '</div>';
      rv += '<div class="tbl-wrap"><table class="tbl"><tbody>';
      codes.sort(function (a, b) { return a.localeCompare(b); }).forEach(function (c) {
        var r = vals[c], s = srcLine(r);
        rv += '<tr><th>' + esc((REF.analytes[c] || {}).name || c) + '</th><td>' + rangeText(r) + '</td><td class="src">' +
          esc(s.short) + (r.conflict && r.alt ? '<br><b>다른 출처: ' + rangeText(r.alt) + ' (' + esc(srcLabel(r.alt.src)) + ')</b>' : '') + '</td></tr>';
      });
      rv += '</tbody></table></div>';
    });
    (p.unverified || []).forEach(function (u) {
      rv += '<div class="src" style="margin-top:8px">· ' + esc((REF.analytes[u.code] || {}).name || u.code) + ' — ' + esc(u.note) + '</div>';
    });
    (d.notes || []).forEach(function (n) { rv += '<div class="src" style="margin-top:8px">· ' + esc(n) + '</div>'; });
    rv += '<div class="src" style="margin-top:10px">장비 구분: ' + esc(d.method) + ' · 데이터 갱신 ' + esc(REF.updated) + '</div>';
    refview.innerHTML = rv;

    buildDraft(rows, unres);
  }

  /* ---------- 코멘트 초안 ---------- */
  function buildDraft(rows, unres) {
    unres = unres || {};
    if (!rows.length) { draft.value = ''; draftlen.textContent = ''; return; }
    var d = dev(), p = prof(d);
    var a = [], b = [], abn = [];
    rows.forEach(function (row) {
      var nm = (REF.analytes[row.code] || {}).name || row.code;
      if (row.ref) {
        a.push('- ' + nm + ' ' + fmt(row.value) + ' ' + (row.unit || row.ref.unit) + ' (참고 ' + fmt(row.ref.lo) + '–' + fmt(row.ref.hi) + ') — ' + row.j.label);
        b.push('- ' + nm + ': ' + srcLine(row.ref).short.replace(/^출처: /, ''));
        if (row.j.level !== 'ok') abn.push(nm);
      } else if (unres[row.code]) {
        a.push('- ' + nm + ' ' + fmt(row.value) + ' — 판정 보류(참고치 확인 필요)');
        b.push('- ' + nm + ': 근거 없음 — 원장님 판단');
        abn.push(nm);
      } else {
        a.push('- ' + nm + ' ' + fmt(row.value) + ' — 이 장비 검사 항목 아님');
      }
    });
    var t = '① 현재 상태\n' + a.join('\n') + '\n\n' +
      '② 판정 근거\n' + b.join('\n') + '\n\n' +
      '③ 앞으로 할 일\n' +
      (abn.length ? '· 확인 필요 항목: ' + abn.join(', ') + '\n' : '') +
      '지금 — (원장님 판단)\n이번 주 — (원장님 판단)\n다음 검사 때 — (원장님 판단)\n\n' +
      '* ' + (d ? d.model + ' · ' + p.label + ' 기준. ' : '') + REF.warning;
    draft.value = t;
    draftlen.textContent = G.count(t) + '자';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- 이벤트 ---------- */
  devSel.addEventListener('change', function () { fillProfiles(); render(); save(); });
  profSel.addEventListener('change', function () { render(); save(); });
  lab.addEventListener('input', function () { render(); save(); });
  devcustom.addEventListener('input', save);
  $('#go').addEventListener('click', render);
  $('#clear').addEventListener('click', function () { lab.value = ''; render(); save(); });
  $('#copydraft').addEventListener('click', function () {
    if (!draft.value) return;
    if (navigator.clipboard) navigator.clipboard.writeText(draft.value).then(function () { G.toast('코멘트 초안을 복사했습니다'); });
    else { draft.select(); document.execCommand('copy'); G.toast('코멘트 초안을 복사했습니다'); }
  });

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ dev: devSel.value, prof: profSel.value, lab: lab.value, custom: devcustom.value })); } catch (e) {}
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (s.dev) devSel.value = s.dev;
      fillProfiles();
      if (s.prof) profSel.value = s.prof;
      if (s.lab) lab.value = s.lab;
      if (s.custom) devcustom.value = s.custom;
    } catch (e) { fillProfiles(); }
  }

  $('#warnfix').textContent = REF.warning;
  load();
  render();
})();

/**
 * GKN · 복약 접수 웹앱 (굿모닝펫)
 * - gkn.html(복약 관리 페이지)이 이 웹앱으로 처방·체크·약 사진을 보낸다.
 * - 저장 위치: GCN_실시간_데이터 시트의 `복약` 탭 (없으면 이 스크립트가 만든다)
 * - 사진: 드라이브 GKN_복약사진/{아이}/ 에 올리고 링크를 사진링크 칸에 적는다(실패해도 글은 먼저 저장).
 * - 같은 아이·복약일·시간대·약이름 행이 이미 있으면 새 줄을 만들지 않고 체크만 채운다(upsert).
 *
 * 배포: 웹 앱 · 실행 주체 나 · 액세스 모든 사용자
 * (GBN 미용·GWN 체중 웹앱과 다른 별도 프로젝트다. 기존 프로젝트의 함수는 건드리지 않는다.)
 */
var VERSION = '2026-11-28-v1';
var SHEET_ID = '1qBrHBcGRy0LDrCrj11HS5bZr3a-T1J32nFGZOF09dG8'; // GCN_실시간_데이터
var TAB = '복약';
var ROOT = 'GKN_복약사진';

var HEADERS = ['접수시각', '보호자', '아이', '처방일', '복약일', '시간대', '약이름', '종류', '좌우',
  '용량', '횟수/일', '일수', '체크시각', '이행여부', '뚜껑색', '사진링크', '비고', '처방상세', '접수ID'];
var C = {
  at: 1, guardian: 2, pet: 3, rxDate: 4, date: 5, slot: 6, name: 7, kind: 8, side: 9,
  dose: 10, freq: 11, days: 12, chkAt: 13, state: 14, cap: 15, photo: 16, note: 17, detail: 18, id: 19
};

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    var action = String(p.action || 'ping');
    if (action === 'ping') return out_({ ok: true, service: 'gkn-med', version: VERSION });
    if (action === 'med_get') return out_(getRx_(p));
    return out_({ ok: false, error: '알 수 없는 요청: ' + action });
  } catch (err) {
    return out_({ ok: false, error: String((err && err.message) || err) });
  }
}

function doPost(e) {
  try {
    var b = parseBody_(e);
    var action = String(b.action || 'med_submit').toLowerCase();
    if (action === 'med_submit') return out_(submit_(b));
    if (action === 'med_photo') return out_(photo_(b));
    if (action === 'ping') return out_({ ok: true, service: 'gkn-med', version: VERSION });
    return out_({ ok: false, error: '알 수 없는 요청: ' + action });
  } catch (err) {
    return out_({ ok: false, error: String((err && err.message) || err) });
  }
}

/* ================= 처방·체크 저장 ================= */
function submit_(b) {
  var pet = str_(b.pet, 40);
  if (!pet) throw new Error('아이 이름이 없습니다.');
  var guardian = str_(b.guardian, 40);
  var rxDate = dstr_(b.rxDate);
  var date = dstr_(b.date);
  var sh = sheet_();
  var last = sh.getLastRow();
  var rows = last > 1 ? sh.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];
  var map = {};
  for (var i = 0; i < rows.length; i++) {
    var k = key_(rows[i][C.pet - 1], rows[i][C.date - 1], rows[i][C.slot - 1], rows[i][C.name - 1], rows[i][C.kind - 1], rows[i][C.side - 1]);
    map[k] = i + 2;
  }
  var meds = b.meds || [];
  var checks = {};
  (b.checks || []).forEach(function (c) { checks[String(c.slot) + '|' + String(c.medId)] = c; });
  var now = nowStr_();
  var id = id_(pet + date + now);
  var wrote = 0, done = 0, news = [];

  meds.forEach(function (m) {
    var times = (m.times && m.times.length) ? m.times : ['09:00'];
    var detail = JSON.stringify({
      id: m.id, name: str_(m.name, 60), kind: m.kind || 'oral', side: m.side || '',
      dose: m.dose || '', freq: num_(m.freq), days: num_(m.days), form: m.form || '',
      cap: m.cap || '', photoUrl: m.photoUrl || '', note: m.note || '', seq: num_(m.seq),
      meal: b.meal || '', times: times
    });
    for (var ti = 0; ti < times.length; ti++) {
      var slot = String(times[ti]);
      var kk = key_(pet, date, slot, m.name, m.kind || 'oral', m.side || '');
      var chk = checks[slot + '|' + m.id] || null;
      var r = map[kk] ? map[kk] : 0;
      if (!r) {
        r = sh.getLastRow() + 1;
        sh.getRange(r, 1, 1, HEADERS.length).setValues([[now, guardian, pet, rxDate, date, slot,
          str_(m.name, 60), m.kind || 'oral', m.side || '', m.dose || '', num_(m.freq), num_(m.days),
          '', '', m.cap || '', m.photoUrl || '', m.note || '', detail, id]]);
        map[kk] = r; news.push(r);
      } else {
        sh.getRange(r, C.guardian).setValue(guardian);
        sh.getRange(r, C.rxDate).setValue(rxDate);
        sh.getRange(r, C.dose).setValue(m.dose || '');
        sh.getRange(r, C.freq).setValue(num_(m.freq));
        sh.getRange(r, C.days).setValue(num_(m.days));
        sh.getRange(r, C.cap).setValue(m.cap || '');
        if (m.photoUrl) sh.getRange(r, C.photo).setValue(m.photoUrl);
        sh.getRange(r, C.detail).setValue(detail);
      }
      if (chk) {
        sh.getRange(r, C.chkAt).setValue(fmt_(chk.at));
        sh.getRange(r, C.state).setValue('완료');
        done++;
      } else if (!sh.getRange(r, C.state).getValue()) {
        sh.getRange(r, C.state).setValue('예정');
      }
      wrote++;
    }
  });
  if (news.length) {
    // 새로 만든 행은 한 번에 서식(날짜 칸은 문자열 유지)
    news.forEach(function (r) { sh.getRange(r, C.date, 1, 3).setNumberFormat('@'); });
  }
  return { ok: true, rows: wrote, checked: done, date: date, rxDate: rxDate };
}

/* ================= 처방 불러오기(보호자 링크) ================= */
function getRx_(p) {
  var pet = str_(p.pet, 40);
  if (!pet) return { ok: false, error: '아이 이름이 없습니다.' };
  var guardian = str_(p.guardian, 40);
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return { ok: true, rows: 0, rx: null };
  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var mine = rows.filter(function (r) {
    if (norm_(r[C.pet - 1]) !== norm_(pet)) return false;
    if (guardian && norm_(r[C.guardian - 1]) && norm_(r[C.guardian - 1]) !== norm_(guardian)) return false;
    return true;
  });
  if (!mine.length) return { ok: true, rows: 0, rx: null };

  var latest = '';
  mine.forEach(function (r) { var d = dstr_(r[C.rxDate - 1]); if (d > latest) latest = d; });
  var latestRows = mine.filter(function (r) { return dstr_(r[C.rxDate - 1]) === latest; });

  var meds = [], seen = {};
  latestRows.forEach(function (r) {
    var detail = r[C.detail - 1];
    var m = null;
    try { m = detail ? JSON.parse(detail) : null; } catch (e) { m = null; }
    if (!m) {
      m = { id: 'g' + (meds.length + 1), name: String(r[C.name - 1] || ''), kind: r[C.kind - 1] || 'oral',
        side: r[C.side - 1] || '', dose: r[C.dose - 1] || '', freq: num_(r[C.freq - 1]),
        days: num_(r[C.days - 1]), form: '', cap: r[C.cap - 1] || '', photoUrl: r[C.photo - 1] || '',
        note: r[C.note - 1] || '', seq: 0, times: [String(r[C.slot - 1] || '09:00')] };
    }
    var key = norm_(m.name) + '|' + (m.kind || '');
    if (seen[key]) return;
    seen[key] = 1;
    meds.push(m);
  });

  var today = p.date ? dstr_(p.date) : todayStr_();
  var checks = [];
  mine.forEach(function (r) {
    if (dstr_(r[C.date - 1]) !== today) return;
    if (String(r[C.state - 1] || '') !== '완료') return;
    var name = norm_(r[C.name - 1]);
    var med = null;
    for (var i = 0; i < meds.length; i++) { if (norm_(meds[i].name) === name) { med = meds[i]; break; } }
    if (!med) return;
    var t = r[C.chkAt - 1];
    var ms = t instanceof Date ? t.getTime() : Date.parse(String(t).replace(' ', 'T') + '+09:00');
    if (isNaN(ms)) ms = Date.now();
    checks.push({ slot: String(r[C.slot - 1] || ''), medId: med.id, at: ms });
  });

  return {
    ok: true, rows: mine.length,
    rx: {
      pet: pet, guardian: guardian, rxDate: latest, interval: 5,
      start: '오늘 저녁부터', meal: '', extra: '', meds: meds, rxAt: Date.parse(latest + 'T00:00:00+09:00') || 0
    },
    date: today, checks: checks
  };
}

/* ================= 약 사진 ================= */
function photo_(b) {
  var pet = str_(b.pet, 40) || '아이';
  var data = String(b.data || '');
  var m = data.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!m) throw new Error('사진 형식이 아닙니다.');
  var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], (str_(b.medName, 30) || 'med') + '_' + todayStr_() + '.jpg');
  var folder = folder_(pet);
  var file = folder.createFile(blob);
  return { ok: true, url: file.getUrl(), id: file.getId(), name: file.getName() };
}
function folder_(pet) {
  var root;
  var it = DriveApp.getFoldersByName(ROOT);
  root = it.hasNext() ? it.next() : DriveApp.createFolder(ROOT);
  var name = String(pet).replace(/[\\\/:*?"<>|]/g, '_');
  var sub = root.getFoldersByName(name);
  return sub.hasNext() ? sub.next() : root.createFolder(name);
}

/* ================= 도구 ================= */
function sheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#eaf7fd');
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#eaf7fd');
    sh.setFrozenRows(1);
  }
  return sh;
}
function key_(pet, date, slot, name, kind, side) {
  return [norm_(pet), dstr_(date), String(slot || ''), norm_(name), String(kind || ''), String(side || '')].join('|');
}
function norm_(v) { return String(v == null ? '' : v).replace(/\s+/g, '').replace(/[()\[\]]/g, '').toLowerCase(); }
function str_(v, n) { return String(v == null ? '' : v).trim().slice(0, n || 200); }
function num_(v) { var n = parseFloat(v); return isNaN(n) ? '' : n; }
function dstr_(v) {
  if (!v) return '';
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd');
  var s = String(v);
  var m = s.match(/(\d{4})[-.\/]\s?(\d{1,2})[-.\/]\s?(\d{1,2})/);
  if (m) return m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
  return s.slice(0, 10);
}
function todayStr_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd'); }
function nowStr_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm'); }
function fmt_(ms) {
  var n = parseFloat(ms);
  if (!n || isNaN(n)) return '';
  return Utilities.formatDate(new Date(n), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
}
function id_(s) { return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, s)).replace(/[^A-Za-z0-9]/g, '').slice(0, 10); }
function parseBody_(e) {
  var raw = (e && e.postData && e.postData.contents) || '';
  try { return JSON.parse(raw); } catch (err) {}
  var o = {};
  if (raw) raw.split('&').forEach(function (kv) {
    var a = kv.split('=');
    if (a[0]) o[decodeURIComponent(a[0])] = decodeURIComponent((a[1] || '').replace(/\+/g, ' '));
  });
  if (e && e.parameter) for (var k in e.parameter) o[k] = e.parameter[k];
  return o;
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

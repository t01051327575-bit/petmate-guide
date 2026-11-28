/**
 * GWN · 체중·BCS 사진·식이 관리 접수 웹앱 (굿모닝펫)
 * - gwn.html(보호자용 체중관리 페이지)이 이 웹앱으로 기록을 보낸다.
 * - 저장 위치: GCN_실시간_데이터 시트의 `체중` 탭과 `식이관리` 탭 (없으면 이 스크립트가 만든다)
 * - 사진은 드라이브 GWN_체중사진/{측정일}_{아이}/ , 먹은 것 사진은 GWN_식이관리사진/{날짜}_{아이}/ 에 올리고
 *   링크를 각 탭의 사진 칸에 적는다. 사진 업로드가 실패해도 숫자·글은 먼저 저장한다.
 * - 같은 아이·보호자·날짜 행이 이미 있으면 새 줄을 만들지 않고 빈 칸만 채운다(upsert).
 *
 * 배포: 웹 앱 · 실행 주체 나 · 액세스 모든 사용자
 * 이 프로젝트는 GBN(GCN 미용) 웹앱과 다른 별도 프로젝트다.
 * (GBN 프로젝트의 doPost는 미용 접수 전용 분기라, 같은 프로젝트에 함수를 더해도
 *  HTTP로 부를 수 없고, 그 작업이 동시에 배포를 바꾸고 있어 덮어쓸 위험이 있다.)
 */
var VERSION = '2026-11-28-v1';
var SHEET_ID = '1qBrHBcGRy0LDrCrj11HS5bZr3a-T1J32nFGZOF09dG8'; // GCN_실시간_데이터
var TAB_W = '체중';
var TAB_D = '식이관리';
var ROOT_W = 'GWN_체중사진';
var ROOT_D = 'GWN_식이관리사진';

var HW = ['접수시각', '보호자', '아이', '측정일', '체중kg', '목표kg', 'BCS', '출처', '사진링크',
  '추정BCS', '허리/갈비', '갈비폭px', '허리폭px', '엉덩이폭px',
  '운동분', '운동강도', '운동메모', '사료', '급여량', '급여단위', '급여횟수', '간식', '간식양', '메모',
  '병원확인BCS', '사진수', '접수ID'];
var CW = {
  at: 1, guardian: 2, pet: 3, date: 4, weight: 5, target: 6, bcs: 7, src: 8, photo: 9,
  est: 10, ratio: 11, ribPx: 12, waistPx: 13, hipPx: 14,
  walkMin: 15, walkLevel: 16, walkMemo: 17, food: 18, foodAmt: 19, foodUnit: 20, meals: 21,
  treat: 22, treatAmt: 23, memo: 24, hospBcs: 25, photoN: 26, id: 27
};

var HD = ['접수시각', '보호자', '아이', '날짜', '목표', '운동분', '운동횟수', '운동시작', '운동종료',
  '운동내용', '사료', '급여량', '급여단위', '급여횟수', '간식', '간식양', '알러지노출', '먹은것사진',
  '사진수', '칭찬일수', '칭찬내용', '메모', '출처', '접수ID'];
var CD = {
  at: 1, guardian: 2, pet: 3, date: 4, goal: 5, walkMin: 6, walkN: 7, walkStart: 8, walkEnd: 9,
  walkWhat: 10, food: 11, foodAmt: 12, foodUnit: 13, meals: 14, treat: 15, treatAmt: 16,
  allergy: 17, photo: 18, photoN: 19, praiseN: 20, praiseText: 21, memo: 22, src: 23, id: 24
};

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    var action = String(p.action || 'ping');
    if (action === 'weight_list') return out_({ ok: true, rows: list_(sheet_(TAB_W, HW), HW, p.pet, p.guardian, p.limit) });
    if (action === 'diet_list') return out_({ ok: true, rows: list_(sheet_(TAB_D, HD), HD, p.pet, p.guardian, p.limit) });
    if (action === 'list') return out_({ ok: true, rows: list_(sheet_(TAB_W, HW), HW, p.pet, p.guardian, p.limit) });
    if (action === 'ping') return out_({ ok: true, service: 'gwn', version: VERSION, time: nowStr_() });
    return out_({ ok: false, error: '알 수 없는 요청: ' + action });
  } catch (err) {
    return out_({ ok: false, error: String((err && err.message) || err) });
  }
}

function doPost(e) {
  try {
    var b = parseBody_(e);
    var action = String(b.action || 'weight');
    if (action === 'weight') return out_(saveWeight_(b));
    if (action === 'diet') return out_(saveDiet_(b));
    if (action === 'ping') return out_({ ok: true, service: 'gwn', version: VERSION });
    return out_({ ok: false, error: '알 수 없는 요청: ' + action });
  } catch (err) {
    return out_({ ok: false, error: String((err && err.message) || err) });
  }
}

/* ================= 체중·BCS 저장 ================= */
function saveWeight_(b) {
  var pet = str_(b.pet, 40);
  var guardian = str_(b.guardian, 40);
  var date = str_(b.date, 10);
  if (!pet) throw new Error('아이 이름이 없습니다.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) date = todayStr_();

  var v = {
    weight: num_(b.weight), target: num_(b.target), bcs: str_(b.bcs, 4), hospBcs: str_(b.hospBcs, 4),
    est: str_(b.est, 4), ratio: str_(b.ratio, 8),
    ribPx: str_(b.ribPx, 6), waistPx: str_(b.waistPx, 6), hipPx: str_(b.hipPx, 6)
  };
  if (!(v.weight > 0) && !v.est && !b.photo) throw new Error('저장할 값이 없습니다.');

  var sh = sheet_(TAB_W, HW);
  var row = findRow_(sh, HW, CW, pet, guardian, date);
  var hadRow = !!row;
  var photo = null, photoErr = '';
  if (b.photo && b.photo.data) {
    try { photo = upload_(b.photo, ROOT_W, date, pet, guardian); }
    catch (err) { photoErr = String((err && err.message) || err); }
  }
  var id = row ? String(sh.getRange(row, CW.id).getValue() || '') : newId_();
  var vals;
  if (row) {
    vals = sh.getRange(row, 1, 1, HW.length).getValues()[0];
    if (!vals[CW.at - 1]) vals[CW.at - 1] = nowStr_();
  } else {
    vals = [];
    for (var i = 0; i < HW.length; i++) vals.push('');
    vals[CW.at - 1] = nowStr_();
  }
  vals[CW.guardian - 1] = guardian;
  vals[CW.pet - 1] = pet;
  vals[CW.date - 1] = date;
  put_(vals, CW.weight, v.weight); put_(vals, CW.target, v.target); put_(vals, CW.bcs, v.bcs);
  put_(vals, CW.hospBcs, v.hospBcs); put_(vals, CW.est, v.est); put_(vals, CW.ratio, v.ratio);
  put_(vals, CW.ribPx, v.ribPx); put_(vals, CW.waistPx, v.waistPx); put_(vals, CW.hipPx, v.hipPx);
  vals[CW.src - 1] = str_(b.src, 20) || 'GWN';
  if (photo) { vals[CW.photo - 1] = photo.url; vals[CW.photoN - 1] = photo.count; }
  vals[CW.id - 1] = id;
  if (hadRow) {
    sh.getRange(row, 1).setNumberFormat('@');
    sh.getRange(row, 1, 1, HW.length).setValues([vals]);
  } else {
    sh.appendRow(vals);
    row = sh.getLastRow();
    sh.getRange(row, 1).setNumberFormat('@').setValue(vals[0]);
  }
  return { ok: true, updated: hadRow, row: row, id: id, photoUrl: photo ? photo.url : '', photoError: photoErr, version: VERSION };
}

/* ================= 식이 관리 저장 ================= */
function saveDiet_(b) {
  var pet = str_(b.pet, 40);
  var guardian = str_(b.guardian, 40);
  var date = str_(b.date, 10);
  if (!pet) throw new Error('아이 이름이 없습니다.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) date = todayStr_();

  var sessions = Array.isArray(b.sessions) ? b.sessions : [];
  var walkMin = num_(b.walkMin);
  if (!walkMin && sessions.length) {
    walkMin = sessions.reduce(function (s, x) { return s + (Number(x.min) || 0); }, 0);
  }
  var kinds = [], starts = [], ends = [];
  sessions.forEach(function (s) {
    if (s && s.kind && kinds.indexOf(s.kind) < 0) kinds.push(s.kind);
    if (s && s.start) starts.push(s.start);
    if (s && s.end) ends.push(s.end);
  });
  if (Array.isArray(b.exKinds)) b.exKinds.forEach(function (k) { if (k && kinds.indexOf(k) < 0) kinds.push(k); });

  var goal = str_(b.goal, 20);
  var food = str_(b.food, 60);
  if (goal === '알러지 관리' && !food && !b.photo) throw new Error('알러지 관리 목표는 먹는 것 사진이나 사료 이름이 필요합니다.');

  var sh = sheet_(TAB_D, HD);
  var row = findRow_(sh, HD, CD, pet, guardian, date);
  var hadRow = !!row;
  var photo = null, photoErr = '';
  if (b.photo && b.photo.data) {
    try { photo = upload_(b.photo, ROOT_D, date, pet, guardian); }
    catch (err) { photoErr = String((err && err.message) || err); }
  }
  var id = row ? String(sh.getRange(row, CD.id).getValue() || '') : newId_();
  var vals;
  if (row) {
    vals = sh.getRange(row, 1, 1, HD.length).getValues()[0];
    if (!vals[CD.at - 1]) vals[CD.at - 1] = nowStr_();
  } else {
    vals = [];
    for (var i = 0; i < HD.length; i++) vals.push('');
    vals[CD.at - 1] = nowStr_();
  }
  vals[CD.guardian - 1] = guardian;
  vals[CD.pet - 1] = pet;
  vals[CD.date - 1] = date;
  put_(vals, CD.goal, goal);
  put_(vals, CD.walkMin, walkMin); put_(vals, CD.walkN, sessions.length);
  put_(vals, CD.walkStart, starts.join(' ')); put_(vals, CD.walkEnd, ends.join(' '));
  put_(vals, CD.walkWhat, kinds.join('·'));
  put_(vals, CD.food, food); put_(vals, CD.foodAmt, num_(b.foodAmt)); put_(vals, CD.foodUnit, str_(b.foodUnit, 4));
  put_(vals, CD.meals, str_(b.meals, 6)); put_(vals, CD.treat, str_(b.treat, 8)); put_(vals, CD.treatAmt, str_(b.treatAmt, 60));
  put_(vals, CD.allergy, str_(b.allergy, 80)); put_(vals, CD.memo, str_(b.memo, 300));
  put_(vals, CD.praiseN, str_(b.praiseN, 4)); put_(vals, CD.praiseText, str_(b.praiseText, 200));
  vals[CD.src - 1] = str_(b.src, 20) || 'GWN';
  if (photo) { vals[CD.photo - 1] = photo.url; vals[CD.photoN - 1] = photo.count; }
  vals[CD.id - 1] = id;
  if (hadRow) {
    sh.getRange(row, 1).setNumberFormat('@');
    sh.getRange(row, 1, 1, HD.length).setValues([vals]);
  } else {
    sh.appendRow(vals);
    row = sh.getLastRow();
    sh.getRange(row, 1).setNumberFormat('@').setValue(vals[0]);
  }
  return { ok: true, updated: hadRow, row: row, id: id, photoUrl: photo ? photo.url : '', photoError: photoErr, version: VERSION };
}

/* ================= 읽기 ================= */
function list_(sh, headers, pet, guardian, limit) {
  var last = sh.getLastRow();
  if (last < 2) return [];
  var petQ = norm_(pet), gQ = norm_(guardian);
  var max = Math.max(1, Math.min(Number(limit) || 400, 3000));
  var values = sh.getRange(2, 1, last - 1, headers.length).getValues();
  var out = [];
  var petCol = headers.indexOf('아이'), gCol = headers.indexOf('보호자');
  for (var i = values.length - 1; i >= 0 && out.length < max; i--) {
    var r = values[i];
    if (petQ && norm_(r[petCol]) !== petQ) continue;
    if (gQ && norm_(r[gCol]) !== gQ) continue;
    var o = {};
    for (var k = 0; k < headers.length; k++) o[headers[k]] = r[k] instanceof Date ? fmt_(r[k], headers[k]) : r[k];
    out.push(o);
  }
  return out.reverse();
}

/* ================= 시트·드라이브 ================= */
function sheet_(tab, headers) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(tab);
  if (!sh) {
    sh = ss.insertSheet(tab);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 132);
  }
  return sh;
}

function findRow_(sh, headers, cols, pet, guardian, date) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var pQ = norm_(pet), gQ = norm_(guardian);
  var rows = sh.getRange(2, 1, last - 1, headers.length).getValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    if (norm_(rows[i][cols.pet - 1]) !== pQ) continue;
    if (norm_(rows[i][cols.guardian - 1]) !== gQ) continue;
    if (fmt_(rows[i][cols.date - 1]) !== date) continue;
    return i + 2;
  }
  return 0;
}

function upload_(photo, rootName, date, pet, guardian) {
  var data = String(photo.data || '');
  var mime = String(photo.mime || 'image/jpeg');
  if (!data) throw new Error('사진 데이터가 없습니다.');
  var bytes = Utilities.base64Decode(data);
  if (bytes.length > 8 * 1024 * 1024) throw new Error('사진이 너무 큽니다(8MB 초과).');
  var props = PropertiesService.getScriptProperties();
  var key = 'ROOT_' + rootName;
  var root = null, rootId = props.getProperty(key);
  if (rootId) { try { root = DriveApp.getFolderById(rootId); } catch (e) { root = null; } }
  if (!root) {
    var it = DriveApp.getFoldersByName(rootName);
    root = it.hasNext() ? it.next() : DriveApp.createFolder(rootName);
    props.setProperty(key, root.getId());
  }
  var clean = function (s) { return String(s || '').replace(/[\\\/:*?"<>|]/g, '').slice(0, 30); };
  var name = date + '_' + clean(pet) + (guardian ? '_' + clean(guardian) : '');
  var fit = root.getFoldersByName(name);
  var folder = fit.hasNext() ? fit.next() : root.createFolder(name);
  var stamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'HHmmss');
  var file = folder.createFile(Utilities.newBlob(bytes, mime, 'gwn_' + date + '_' + stamp + '.jpg'));
  return { url: file.getUrl(), folder: folder.getUrl(), count: countFiles_(folder) };
}

function countFiles_(folder) {
  var n = 0, it = folder.getFiles();
  while (it.hasNext() && n < 300) { it.next(); n++; }
  return n;
}

/* ================= 도구 ================= */
function put_(vals, col, v) {
  if (v === '' || v == null) return;
  if (typeof v === 'number' && !(v > 0)) return;
  vals[col - 1] = v;
}
function parseBody_(e) {
  if (e && e.postData && e.postData.contents) {
    var t = e.postData.contents;
    try { return JSON.parse(t); } catch (err) { }
    try { return JSON.parse(decodeURIComponent(t.replace(/^data=/, ''))); } catch (err2) { }
    throw new Error('요청 본문을 읽지 못했습니다.');
  }
  return (e && e.parameter) || {};
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function str_(v, max) {
  if (v == null) return '';
  var s = String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim();
  return max ? s.slice(0, max) : s;
}
function num_(v) { var n = Number(v); return isFinite(n) ? n : ''; }
function norm_(v) { return String(v == null ? '' : v).replace(/[\s()\[\]{}·.,-]/g, '').toLowerCase(); }
function fmt_(v, kind) {
  if (v instanceof Date) {
    if (v.getFullYear() < 1900) return Utilities.formatDate(v, 'Asia/Seoul', 'HH:mm');
    if (kind === '접수시각') return Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
    return Utilities.formatDate(v, 'Asia/Seoul', 'yyyy-MM-dd');
  }
  return String(v == null ? '' : v).trim().replace(/\//g, '-').slice(0, 10);
}
function nowStr_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm'); }
function todayStr_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd'); }
function newId_() { return Utilities.getUuid().replace(/-/g, '').slice(0, 10); }

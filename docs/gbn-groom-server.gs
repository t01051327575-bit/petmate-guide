/**
 * GBN · 미용 전 체크 접수 웹앱 (굿모닝펫)
 * - groom.html(미용사용 페이지)이 이 웹앱으로 접수한다.
 * - 접수 텍스트는 먼저 시트 `미용` 탭에 저장되고, 사진·영상은 접수ID 폴더에 따로 올린다(실패해도 텍스트는 남는다).
 * - 미용실 이름을 병원의 '원내 미용실 이름'과 비교해 원내/외부를 자동 분류한다.
 * - GCN은 진료 예약이 있는 아이의 카드에만 이 기록을 표시한다.
 * 배포: 웹 앱 · 실행 주체 나 · 액세스 모든 사용자
 */
var VERSION = '2026-11-28-v3';
var SHEET_ID = '1qBrHBcGRy0LDrCrj11HS5bZr3a-T1J32nFGZOF09dG8'; // GCN_실시간_데이터
var TAB = '미용';
var MAIL_TO = 't01051327575@gmail.com';
var ROOT_NAME = 'GBN_미용체크';
var DEFAULT_INHOUSE = '굿모닝펫 미용실';
var HEADERS = ['접수ID', '접수시각', '미용일', '아이', '보호자', '미용실', '미용사', '출처',
  '이상 수', '이상 항목', '정상 수', '해당없음 수', '메모', '병원 전달',
  '사진 수', '영상 수', '폴더 링크', '사진 링크', '영상 링크', '상세', '폴더ID'];
var C = { id: 1, at: 2, date: 3, pet: 4, guardian: 5, shop: 6, groomer: 7, src: 8, badN: 9, badList: 10,
  okN: 11, naN: 12, memo: 13, must: 14, photoN: 15, videoN: 16, folder: 17, photos: 18, videos: 19, detail: 20, folderId: 21 };
var MAX_MEDIA_BYTES = 14 * 1024 * 1024;

function doGet(e) {
  var p = (e && e.parameter) || {};
  var res = { ok: true, service: 'gbn-groom', version: VERSION, time: nowStr_() };
  if (p.action === 'find' && p.id) {
    var found = findRow_(String(p.id).trim());
    res.found = !!found;
    if (found) res.row = found.row;
  }
  return out_(res);
}

function doPost(e) {
  try {
    var b = parseBody_(e);
    var action = String(b.action || 'submit').toLowerCase();
    if (action === 'submit') return out_(submit_(b));
    if (action === 'media') return out_(media_(b));
    if (action === 'finalize') return out_(finalize_(b));
    if (action === 'ping') return out_({ ok: true, service: 'gbn-groom', version: VERSION });
    return out_({ ok: false, error: '알 수 없는 요청: ' + action });
  } catch (err) {
    try { notifyError_(err); } catch (e2) { }
    return out_({ ok: false, error: String((err && err.message) || err) });
  }
}

/* ================= 접수(텍스트 먼저 저장) ================= */
function submit_(b) {
  var pet = str_(b.pet || b.petName, 40);
  var guardian = str_(b.guardian || b.guardianName, 40);
  var shop = str_(b.shop || b.shopName || b.groomer || b.staff, 40);
  var groomer = str_(b.groomerName || b.staffName, 40);
  var groomDate = str_(b.groomDate || b.date, 10);
  if (!pet) throw new Error('아이 이름이 없습니다.');
  if (!shop) throw new Error('미용실 이름이 없습니다.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(groomDate)) groomDate = todayStr_();
  var inhouse = str_(b.inhouse, 40) || String(PropertiesService.getScriptProperties().getProperty('INHOUSE_NAME') || DEFAULT_INHOUSE);
  var src = classify_(shop, inhouse);

  var answers = Array.isArray(b.answers) ? b.answers : [];
  var bad = [], notes = [], okn = 0, nan = 0;
  answers.forEach(function (a) {
    var label = str_(a.label, 30);
    var state = String(a.state || a.v || '');
    if (!label) return;
    if (state === 'bad' || state === 'abnormal') {
      bad.push(label);
      var nt = str_(a.note, 120);
      if (nt) notes.push(label + ': ' + nt);
    } else if (state === 'ok' || state === 'normal') okn++;
    else if (state === 'na') nan++;
  });

  var memo = str_(b.memo, 600);
  var mustTell = !!b.mustTell;
  var detail = JSON.stringify({ answers: answers, memo: memo, mustTell: mustTell, shop: shop, groomer: groomer, src: src }).slice(0, 45000);
  var id = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
  var folder = makeFolder_(groomDate, pet, id);

  var sh = sheet_();
  var row = Math.max(sh.getLastRow() + 1, 2);
  var values = [[id, nowStr_(), groomDate, pet, guardian, shop, groomer, src,
  bad.length, bad.join(' · '), okn, nan,
  memo, mustTell ? '예' : '', 0, 0, folder ? folder.url : '', '', '', detail, folder && folder.folder ? folder.folder.getId() : '']];
  sh.getRange(row, 1, 1, HEADERS.length).setValues(values);
  sh.getRange(row, C.date).setNumberFormat('@').setValue(groomDate);
  if (folder && folder.url) sh.getRange(row, C.folder).setNumberFormat('@').setValue(folder.url);
  if (folder && folder.folder) sh.getRange(row, C.folderId).setNumberFormat('@').setValue(folder.folder.getId());

  try {
    mailSubmit_({
      pet: pet, guardian: guardian, shop: shop, groomer: groomer, src: src, groomDate: groomDate,
      bad: bad, notes: notes, okn: okn, nan: nan, memo: memo, mustTell: mustTell,
      folder: folder ? folder.url : '', id: id, test: !!b.test
    });
  } catch (e) { }

  return {
    ok: true, id: id, row: row, abnormal: bad.length, abnormalItems: bad, source: src,
    folder: folder ? folder.url : '', at: nowStr_()
  };
}

/* ================= 사진·영상 1개씩 업로드 ================= */
function media_(b) {
  var id = str_(b.id, 20);
  if (!id) throw new Error('접수ID가 없습니다.');
  var found = findRow_(id);
  if (!found) throw new Error('접수ID를 찾지 못했습니다: ' + id);
  var sh = found.sh, row = found.row;
  var groomDate = String(sh.getRange(row, C.date).getValue() || '').slice(0, 10) || todayStr_();
  var pet = String(sh.getRange(row, C.pet).getValue() || '');
  var kind = String(b.kind || 'photo').toLowerCase() === 'video' ? 'video' : 'photo';
  var data = String(b.data || '');
  var m = data.match(/^data:([^;,]+)?(?:;base64)?,(.*)$/);
  if (m) data = m[2];
  data = data.replace(/\s/g, '');
  if (!data) throw new Error('파일 내용이 비어 있습니다.');
  var bytes = Utilities.base64Decode(data);
  if (bytes.length > MAX_MEDIA_BYTES) throw new Error('파일이 너무 큽니다(' + Math.round(bytes.length / 1048576) + 'MB)');

  var folder = folderOf_(sh, row, groomDate, pet, id);
  if (!folder || !folder.folder) throw new Error('저장 폴더를 만들지 못했습니다.');

  var name = str_(b.name, 60).replace(/[\\/:*?"<>|]/g, '');
  var seq = Number(b.seq || 0);
  var ext = kind === 'video' ? '.webm' : '.jpg';
  var lower = name.toLowerCase();
  if (/\.(jpe?g|png|webp|heic|heif)$/.test(lower)) ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  if (/\.(mp4|mov|webm|m4v|3gp)$/.test(lower)) ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  var label = str_(b.label, 30) || '';
  var fileName = pad2_(seq || folder.folder.getFiles().length + 1) + '_' +
    (kind === 'video' ? '영상' : '사진') + (label ? '_' + label.replace(/[\\/:*?"<>|\s]/g, '') : '') + ext;

  var mime = m ? m[1] : (str_(b.mime, 60) || (kind === 'video' ? 'video/webm' : 'image/jpeg'));
  var blob = Utilities.newBlob(bytes, mime || (kind === 'video' ? 'video/webm' : 'image/jpeg'), fileName);
  var file = folder.folder.createFile(blob);
  var url = file.getUrl();

  var col = kind === 'video' ? C.videos : C.photos;
  var cell = sh.getRange(row, col);
  var prev = String(cell.getValue() || '');
  cell.setNumberFormat('@').setValue(prev ? prev + '\n' + url : url);
  var cntCol = kind === 'video' ? C.videoN : C.photoN;
  var cntCell = sh.getRange(row, cntCol);
  cntCell.setValue(Number(cntCell.getValue() || 0) + 1);

  return { ok: true, id: id, kind: kind, seq: seq, file: fileName, url: url, bytes: bytes.length };
}

function finalize_(b) {
  var id = str_(b.id, 20);
  var found = findRow_(id);
  if (!found) throw new Error('접수ID를 찾지 못했습니다: ' + id);
  return {
    ok: true, id: id, row: found.row,
    photos: Number(found.sh.getRange(found.row, C.photoN).getValue() || 0),
    videos: Number(found.sh.getRange(found.row, C.videoN).getValue() || 0)
  };
}

/* ================= 원내/외부 분류 ================= */
function normShop_(s) {
  var t = String(s || '').toLowerCase().replace(/[\s()\[\]{}·.,\-_/]+/g, '');
  var suf = ['애견미용실', '미용실', '동물병원', '동물의료센터', '병원', '펫샵', '샵'];
  var changed = true;
  while (changed) {
    changed = false;
    for (var i = 0; i < suf.length; i++) {
      if (t.length > suf[i].length + 1 && t.slice(-suf[i].length) === suf[i]) {
        t = t.slice(0, -suf[i].length);
        changed = true;
      }
    }
  }
  return t;
}
function classify_(shop, inhouse) {
  var a = normShop_(shop), b = normShop_(inhouse);
  if (!a || !b) return '외부';
  if (a === b) return '원내';
  if (a.indexOf(b) === 0 || b.indexOf(a) === 0) return '원내';
  return '외부';
}

/* ================= 시트 ================= */
function sheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setBackground('#eaf6fb');
    sh.setColumnWidth(C.id, 100); sh.setColumnWidth(C.date, 90); sh.setColumnWidth(C.folder, 220);
  } else if (String(sh.getRange(1, 1).getValue() || '') !== HEADERS[0] ||
    String(sh.getRange(1, C.shop).getValue() || '') !== HEADERS[C.shop - 1]) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function findRow_(id) {
  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return null;
  var ids = sh.getRange(2, C.id, last - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]).trim() === id) return { sh: sh, row: i + 2 };
  }
  return null;
}

/* ================= 드라이브 ================= */
function folderOf_(sh, row, groomDate, pet, id) {
  var fid = String(sh.getRange(row, C.folderId).getValue() || '').trim();
  if (fid) {
    try { var f0 = DriveApp.getFolderById(fid); return { folder: f0, url: 'https://drive.google.com/drive/folders/' + fid }; } catch (e) { }
  }
  var made = makeFolder_(groomDate, pet, id);
  if (made && made.folder) {
    try {
      sh.getRange(row, C.folderId).setNumberFormat('@').setValue(made.folder.getId());
      if (!String(sh.getRange(row, C.folder).getValue() || '')) sh.getRange(row, C.folder).setNumberFormat('@').setValue(made.url);
    } catch (e) { }
  }
  return made;
}
function makeFolder_(groomDate, pet, id) {
  try {
    var props = PropertiesService.getScriptProperties();
    var rootId = props.getProperty('ROOT_FOLDER_ID');
    var root = null;
    if (rootId) { try { root = DriveApp.getFolderById(rootId); } catch (e) { root = null; } }
    if (!root) {
      var it = DriveApp.getFoldersByName(ROOT_NAME);
      root = it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_NAME);
      props.setProperty('ROOT_FOLDER_ID', root.getId());
    }
    var name = (/^\d{4}-\d{2}-\d{2}$/.test(groomDate || '') ? groomDate : todayStr_()) + '_' + (pet || '아이');
    var sub = null;
    var s = root.getFoldersByName(name);
    while (s.hasNext()) {
      var f = s.next();
      if (f.getName() === name) { sub = f; break; }
    }
    if (!sub) sub = root.createFolder(name);
    return { folder: sub, url: 'https://drive.google.com/drive/folders/' + sub.getId() };
  } catch (e) {
    return null;
  }
}

/* ================= 메일 ================= */
function mailSubmit_(d) {
  var lines = [];
  lines.push('[GBN 미용 전 체크 접수]');
  lines.push('');
  lines.push('아이: ' + d.pet + (d.guardian ? ' / 보호자: ' + d.guardian : ''));
  lines.push('미용일: ' + d.groomDate);
  lines.push('미용실: ' + (d.shop || '-') + ' · ' + (d.src === '원내' ? '🏠 원내 미용' : '🏪 외부 미용') +
    (d.groomer ? ' · 미용사 ' + d.groomer : ''));
  lines.push('이상: ' + (d.bad.length ? d.bad.length + '곳 — ' + d.bad.join(', ') : '없음'));
  lines.push('정상 ' + d.okn + '곳 · 해당 없음 ' + d.nan + '곳');
  if (d.mustTell) lines.push('★ 병원에 꼭 전달한다고 표시했습니다.');
  if (d.notes.length) lines.push('항목 메모: ' + d.notes.join(' / '));
  if (d.memo) lines.push('메모: ' + d.memo);
  if (d.folder) lines.push('');
  if (d.folder) lines.push('사진·영상 폴더: ' + d.folder);
  lines.push('GCN 진료보드(진료 예약이 있는 날에만 표시): https://t01051327575-bit.github.io/Gcn/');
  lines.push('접수ID: ' + d.id);
  var subject = (d.test ? '[테스트] ' : '') + '[GBN 미용 체크] ' + d.pet + (d.guardian ? '(' + d.guardian + ')' : '') +
    ' · ' + (d.src === '원내' ? '원내' : '외부') + ' · 이상 ' + d.bad.length + '곳';
  MailApp.sendEmail({ to: MAIL_TO, subject: subject, body: lines.join('\n') });
}

function notifyError_(err) {
  MailApp.sendEmail({
    to: MAIL_TO,
    subject: '[GBN 미용 체크 오류] ' + String((err && err.message) || err).slice(0, 80),
    body: '오류: ' + ((err && err.stack) || err) + '\n시각: ' + nowStr_()
  });
}

/* ================= 도우미 ================= */
function parseBody_(e) {
  if (e && e.postData && e.postData.contents) {
    var t = e.postData.contents;
    try { return JSON.parse(t); } catch (err) { }
    try { return JSON.parse(decodeURIComponent(t.replace(/^payload=/, ''))); } catch (err) { }
  }
  return (e && e.parameter) || {};
}
function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function str_(v, max) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max || 200);
}
function pad2_(n) { n = Number(n) || 1; return n < 10 ? '0' + n : '' + n; }
function nowStr_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm'); }
function todayStr_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd'); }

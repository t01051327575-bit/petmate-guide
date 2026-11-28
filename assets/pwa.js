/* 굿모닝펫 G-시리즈 · PWA 등록 (모든 페이지 공통)
   - 서비스워커 등록(오프라인·홈화면 앱)
   - Android: 설치 배너 / iOS: 홈 화면 추가 안내 */
(function () {
  'use strict';
  var BUILD = '2026-11-28a';

  /* ---------- 서비스워커 ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        if (reg.waiting && reg.waiting.postMessage) {
          try { reg.waiting.postMessage('skip-waiting'); } catch (e) {}
        }
      }).catch(function () {});
    });
  }

  /* ---------- 설치 안내 ---------- */
  var KEY = 'g_pwa_install_hint_v1';
  function seen() { try { return localStorage.getItem(KEY); } catch (e) { return '1'; } }
  function mark() { try { localStorage.setItem(KEY, '1'); } catch (e) {} }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    showBar('app');
  });
  window.addEventListener('appinstalled', function () {
    mark();
    hideBar();
  });

  function standalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
  }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent || ''); }
  function isAndroid() { return /android/i.test(navigator.userAgent || ''); }

  function showBar(kind) {
    if (standalone() || seen()) return;
    if (document.getElementById('g-pwa-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'g-pwa-bar';
    bar.className = 'g-pwa-bar';
    var txt, btn;
    if (kind === 'app') {
      txt = '<b>홈 화면에 굿모닝펫 앱으로 추가</b><span>한 번 누르면 다음부터 앱처럼 열립니다.</span>';
      btn = '<button type="button" class="p" data-act="install">앱으로 설치</button>';
    } else if (isIOS()) {
      txt = '<b>홈 화면에 추가</b><span>공유(□↑) → <b>홈 화면에 추가</b>를 누르면 앱처럼 열립니다.</span>';
      btn = '';
    } else {
      txt = '<b>홈 화면에 추가</b><span>브라우저 메뉴(⋮) → <b>홈 화면에 추가</b>를 누르면 앱처럼 열립니다.</span>';
      btn = '';
    }
    bar.innerHTML = '<div class="t">' + txt + '</div>' + btn +
      '<button type="button" class="x" data-act="close" aria-label="닫기">✕</button>';
    document.body.appendChild(bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'close') { mark(); hideBar(); return; }
      if (act === 'install' && deferred) {
        deferred.prompt();
        deferred.userChoice.then(function () { mark(); hideBar(); deferred = null; });
      }
    });
  }
  function hideBar() {
    var b = document.getElementById('g-pwa-bar');
    if (b) b.parentNode.removeChild(b);
  }

  var css = document.createElement('style');
  css.textContent = '.g-pwa-bar{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:90;' +
    'display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #d6e9f3;border-radius:16px;' +
    'box-shadow:0 8px 28px rgba(15,60,80,.18);padding:10px 11px;font-family:inherit}' +
    '.g-pwa-bar .t{flex:1 1 auto;min-width:0;font-size:12px;line-height:1.45;color:#4b6068}' +
    '.g-pwa-bar .t b{display:block;font-size:12.5px;color:#1f6f96;margin-bottom:1px}' +
    '.g-pwa-bar button{appearance:none;font-family:inherit;font-weight:800;cursor:pointer;border-radius:11px;min-height:38px}' +
    '.g-pwa-bar .p{flex:0 0 auto;background:#2f86b5;color:#fff;border:0;padding:0 13px;font-size:12.5px}' +
    '.g-pwa-bar .x{flex:0 0 auto;width:34px;background:#f4f9fc;border:1px solid #d6e9f3;color:#6b8087}';
  document.head.appendChild(css);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!standalone() && !seen() && isIOS()) showBar('hint');
    });
  }

  /* 디버그용 */
  window.G_PWA = { build: BUILD, standalone: standalone, isIOS: isIOS, isAndroid: isAndroid };
})();

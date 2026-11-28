/* 굿모닝펫 G-시리즈 · 서비스워커
   - 앱 셸만 캐시해 홈화면 앱처럼 바로 열리게 합니다.
   - HTML은 네트워크 우선(최신 유지), 실패하면 캐시.
   - CSS/JS/이미지는 캐시 우선 + 뒤에서 갱신.
   - 다른 사이트(is.gd 등)는 건드리지 않습니다. */
var CACHE = 'gmp-shell-v5';
var CORE = [
  './',
  './net.html',
  './tips.html',
  './ghn.html',
  './gcn.html',
  './gdn.html',
  './gkn.html',
  './gtn.html',
  './gyn.html',
  './rebuy.html',
  './order.html',
  './universal.html',
  './welcome.html',
  './manifest.webmanifest',
  './assets/g-common.css',
  './assets/g-common.js',
  './assets/g-tips.js',
  './assets/g-products.js',
  './assets/g-practice.js',
  './assets/g-practice.css',
  './assets/pwa.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(CORE.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var isDoc = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') >= 0;
  if (isDoc) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('./net.html'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});


/* ---------- 알림 눌렀을 때 (GKN 복약) ---------- */
self.addEventListener('notificationclick', function (e) {
  var d = (e.notification && e.notification.data) || {};
  var url = d.url || './';
  try { e.notification.close(); } catch (err) {}
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url.indexOf('gkn.html') >= 0 && 'focus' in c) {
          try { c.postMessage({ type: 'gkn-slot', slot: d.slot || '' }); } catch (err) {}
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

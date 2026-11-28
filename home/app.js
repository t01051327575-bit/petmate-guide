/* 분당 굿모닝펫동물병원 — 공식 홈페이지 스크립트 */
(function () {
  "use strict";

  /* ---------- 1. 헤더 상태 ---------- */
  var body = document.body;

  function onScroll() {
    if (window.scrollY > 24) body.classList.add("scrolled");
    else body.classList.remove("scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 2. 모바일 메뉴 ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var nav = document.getElementById("nav");

  function closeNav() {
    body.classList.remove("nav-open");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "메뉴 열기");
    }
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- 3. 카카오톡 ID 복사 ---------- */
  var copyBtn = document.getElementById("copyKakao");
  var kakaoIdEl = document.getElementById("kakaoId");
  var toast = document.getElementById("toast");
  var toastTimer;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2400);
  }

  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  if (copyBtn && kakaoIdEl) {
    copyBtn.addEventListener("click", function () {
      var id = kakaoIdEl.textContent.trim();
      var done = function () { showToast("카카오톡 ID " + id + " 을 복사했습니다"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(id).then(done, function () {
          if (legacyCopy(id)) done();
          else showToast("복사가 어려우면 ‘" + id + "’을 직접 입력해 주세요");
        });
      } else if (legacyCopy(id)) {
        done();
      } else {
        showToast("복사가 어려우면 ‘" + id + "’을 직접 입력해 주세요");
      }
    });
  }

  /* ---------- 4. 오늘 진료 상태 (한국 시간 기준) ---------- */
  var statusEl = document.getElementById("todayStatus");
  var DAY = ["일", "월", "화", "수", "목", "금", "토"];

  function seoulNow() {
    // 방문자 기기 시간대와 무관하게 한국 시간으로 계산
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", hour12: false, weekday: "short"
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(map.weekday);
      return {
        day: wd,
        hour: Number(map.hour) % 24,
        minute: Number(map.minute),
        date: new Date(Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day)))
      };
    } catch (err) {
      var d = new Date();
      return {
        day: d.getDay(), hour: d.getHours(), minute: d.getMinutes(),
        date: new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
      };
    }
  }

  function nextOpenLabel(today) {
    var names = { 1: "월요일", 2: "화요일", 3: "수요일" };
    for (var i = 1; i <= 7; i++) {
      var d = new Date(today.date.getTime() + i * 86400000);
      var wd = d.getUTCDay();
      if (names[wd]) {
        return (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일 " + names[wd];
      }
    }
    return "월요일";
  }

  function renderToday() {
    if (!statusEl) return;
    var n = seoulNow();
    var t = n.hour * 60 + n.minute;
    var isOpenDay = n.day >= 1 && n.day <= 3;
    var text;

    if (!isOpenDay) {
      text = "오늘(" + DAY[n.day] + ")은 휴진일입니다 · 다음 진료일은 " + nextOpenLabel(n)
        + " · 응급 시 서현 해마루이차진료동물병원 031-781-2992";
      statusEl.classList.add("is-off");
    } else if (t < 510) {
      text = "오늘(" + DAY[n.day] + ") 진료일입니다 · 당일 접수는 오전 8시 30분부터";
      statusEl.classList.remove("is-off");
    } else if (t <= 660) {
      text = "오늘 당일 접수 진행 중 · 선착순이라 마감 전 카톡 확인을 권합니다";
      statusEl.classList.remove("is-off");
    } else if (t < 840) {
      text = "오늘 오전 진료가 끝났습니다 · 오후 2시부터 수술·검진";
      statusEl.classList.remove("is-off");
    } else if (t < 1080) {
      text = "오늘 오후 수술·검진 중입니다 · 처방약 픽업은 키오스크에서 24시간";
      statusEl.classList.remove("is-off");
    } else {
      text = "오늘 진료가 끝났습니다 · 다음 진료일은 " + nextOpenLabel(n);
      statusEl.classList.add("is-off");
    }
    statusEl.textContent = text;
  }
  renderToday();
  setInterval(renderToday, 60000);

  /* ---------- 5. 스크롤 등장 ---------- */
  var items = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduce) {
    items.forEach(function (el) { el.classList.add("will-reveal", "in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (el) {
      el.classList.add("will-reveal");
      io.observe(el);
    });
  }

  /* ---------- 6. 영상은 누를 때만 내려받기 ---------- */
  var video = document.getElementById("introVideo");
  if (video) {
    video.addEventListener("play", function once() {
      video.removeEventListener("play", once);
      try { video.setAttribute("preload", "auto"); } catch (e) {}
    });
  }
})();

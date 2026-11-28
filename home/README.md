# 분당 굿모닝펫동물병원 — 공식 홈페이지

분당 굿모닝펫동물병원의 공식 안내 페이지입니다.
GitHub Pages로 배포됩니다: <https://t01051327575-bit.github.io/goodmorningpet-home/>

## 구성

- `index.html` — 한 장짜리 안내 페이지 (병원 소개 · 작은 팀과 G-시리즈 A~Z · 진료 안내 · 내원 전 준비 · 수상·언론 · 오시는 길 · 문의 · FAQ)
- `styles.css` — 아이보리 `#F7F5F0` · 딥 네이비 `#1E3A5F` · 민트 `#2D7A6E` 팔레트, 모바일 우선 반응형
- `app.js` — 헤더 상태, 모바일 메뉴, 카카오톡 ID 복사, 한국 시간 기준 오늘 진료 상태, 스크롤 등장
- `assets/img/` — 실제 병원 사진(수상·방문단·강연·봉사), 병원 소개 영상(29초), OG 이미지

## 링크

| 항목 | 주소 |
| --- | --- |
| 내원 전 건강관리표 (GHN) | https://t01051327575-bit.github.io/petmate-guide/ghn.html |
| 수의사·병원 참관 신청 (GEN) | https://t01051327575-bit.github.io/petmate-guide/gen.html |
| G-시리즈 A~Z 그물망 포털 | https://t01051327575-bit.github.io/petmate-guide/net.html |
| 카카오맵 | http://place.map.kakao.com/8218269 |

## 문의처

- 카카오톡 ID `goodpet` (병원 일반 유선전화는 페이지에 넣지 않습니다)
- 유희진 경영부원장 직통 010-3993-2005

## 수정 방법

`index.html`의 문구를 고치고 커밋하면 GitHub Pages에 1~2분 안에 반영됩니다.

```
git add -A && git commit -m "문구 수정" && git push
```

사진을 바꾸려면 `assets/img/`에 같은 파일명으로 덮어쓰면 됩니다.

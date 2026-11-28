# GDN 장비별 참고치 — 자료 출처와 검증 기록

작성 2026-11-28 · 굿모닝펫동물병원 GDN(검사해설) 자동 참고치 데이터

데이터 파일: `assets/gdn-reference.js` (장비 10종 · 항목 값 450개)

## 1. 검증 숫자

| 구분 | 개수 |
|---|---|
| 전체 참고치 값(장비×종·연령×항목) | 450 |
| 문서 2건 이상으로 확인 | 296 |
| └ 서로 다른 문서·기관으로 교차 확인 | 107 |
| └ 같은 문서의 정판·개정판 대조(IDEXX Catalyst) | 189 |
| 문서 1건에서만 확인 | 154 |
| 출처 간 수치 차이(화면에 "출처 간 차이 있음") | 32 |
| 참고치 미확인(판정 보류) | 10 |

## 2. 장비별 현황

| 제조사 | 모델 | 프로파일 수 | 값 수 | 2건 이상 확인 | 1건만 | 차이 |
|---|---|---|---|---|---|---|
| IDEXX | Catalyst One / Catalyst Dx | 6 | 189 | 189 | 0 | 0 |
| IDEXX | ProCyte Dx | 2 | 36 | 0 | 36 | 0 |
| IDEXX | ProCyte One | 2 | 34 | 5 | 29 | 29 |
| IDEXX | LaserCyte / LaserCyte Dx | 1 | 13 | 6 | 7 | 1 |
| Zoetis(Abaxis) | VetScan VS2 | 2 | 40 | 38 | 2 | 2 |
| Zoetis(Abaxis) | VetScan HM5 | 2 | 28 | 28 | 0 | 0 |
| Heska(Antech) | Element HT5 | 2 | 30 | 30 | 0 | 0 |
| Heska(Antech) | Element POC | 2 | 34 | 0 | 34 | 0 |
| Samsung Electronics (현 i-SENS 유통) | Samsung PT10V | 2 | 40 | 0 | 40 | 0 |
| Boditech Med (국내 유통 웅비메디텍·웅비애니벳) | VetChroma (VET-CHROMA) | 2 | 6 | 0 | 6 | 0 |

## 3. 자료 출처 목록

- **idexx-cat-2024** — Reference Ranges for the Catalyst One Chemistry Analyzer and Catalyst Dx Chemistry Analyzer (06-18790-09) (IDEXX Laboratories, 2024) · 제조사 참고치표
  - https://www.idexx.com/files/06-18790-09-catalyst-species-reference-ranges-en.pdf
- **idexx-cat-rev** — Reference Ranges for the Catalyst One and Catalyst Dx Chemistry Analyzers (catalyst-species-reference-ranges.pdf, 개정판) (IDEXX Laboratories, 2024(판본 확인)) · 제조사 참고치표(개정판 대조)
  - https://www.idexx.com/files/catalyst-species-reference-ranges.pdf
- **idexx-cat-opg-ko** — Catalyst One Chemistry Analyzer 사용자 가이드(한국어, 06-0038584-01) / Catalyst CRP 빠른 참조 가이드 (IDEXX Laboratories, 2022·2024) · 제조사 사용설명서
  - https://www.idexx.com/media/filer_public/52/d8/52d846fd-6b9a-4802-9a64-270d21b0ba58/catalyst-one-operators-guide-ko.pdf
- **idexx-procyte-dx** — Reference Intervals for the IDEXX ProCyte Dx Hematology Analyzer (VetLab Station SW 5.01, 06-27445-12) (IDEXX Laboratories, 2019) · 제조사 참고구간표
  - https://www.idexx.com/files/procyte-dx-reference-ranges-en.pdf
- **idexx-procyte-one-2026** — ProCyte One Hematology Analyzer Reference Intervals (VetLab Station SW 8.5.1 이상, 06-0015050-02) (IDEXX Laboratories, 2026) · 제조사 참고구간표
  - https://www.idexx.com/files/procyte-one-reference-ranges-en.pdf
- **idexx-procyte-one-ko-2021** — IDEXX ProCyte One 혈액 분석기 참고 범위(한국어, SW 5.08 기준, 06-0015050-01) (IDEXX Laboratories, 2021) · 제조사 참고구간표(한국어판)
  - https://www.idexx.kr/files/procyte-one-reference-ranges-ko-kr.pdf
- **lasercyte-uzh** — Wenger-Riggenbach B. et al. Evaluation of the LaserCyte: an in-house haematology analyzer for dogs and cats (Zurich Open Repository, 박사논문; 선형성 표에 LaserCyte 성견 참고구간 기재) (University of Zurich, 2006) · 2차 문헌(제조사 참고구간 인용)
  - https://doi.org/10.5167/uzh-163351
- **lasercyte-galgo** — Couto G. Hematología del Galgo Español utilizando el analizador hematológico LaserCyte (IDEXX). Clin. Vet. Peq. Anim. 31(4):205-207; "제조사(IDEXX) 제공 참고구간" 명시 (AVEPA / Clin. Vet. Peq. Anim., 2011) · 2차 문헌(제조사 참고구간 인용)
  - https://ddd.uab.cat/pub/clivetpeqani/clivetpeqani_a2011v31n4/clivetpeqaniv31n4p205.pdf
- **vs2-guide** — VETSCAN VS2 Hospital Resource Guide — Reference Intervals (common units / SI units) (Zoetis, (게시본, 발행연도 미표기)) · 제조사 기술문서
  - https://www.zoetisus.com/content/pages/diagnostics/product-support/Resources/Documents/VETSCAN-VS2-Hospital-Resource-Guide.pdf
- **vs2-flyer** — VETSCAN VS2 Reference Ranges V1.6 (VTS-00038) (Zoetis, V1.6) · 제조사 참고치표
  - https://www.zoetisus.com/content/_assets/docs/Diagnostics/technical-papers/VETSCAN-VS2-Reference-Ranges-VTS-00038.pdf
- **hm5-flyer** — VETSCAN HM5 Reference Intervals (Common Species), VTS-00426 (Zoetis, (게시본)) · 제조사 참고치표
  - https://www.zoetisus.com/content/_assets/docs/Diagnostics/technical-papers/HM5-Reference-Ranges-iPad-VTS-00426.pdf
- **hm5-uk-guide** — VETSCAN HM5 Hospital Resource Guide (UK) — Reference Intervals, SI units / common units (Zoetis, (게시본)) · 제조사 기술문서
  - https://www.zoetisdiagnostics.com/uk/assets/Resources/PDF/Vetscan-HM5-Hospital-Resource-Guide,-United-Kingdom.pdf
- **hm5-jp** — ゾエティス・ジャパン ベトスキャン HM5 Reference Intervals (販売会社受領資料) (Zoetis Japan / 펫커뮤니케이션즈, 2025) · 유통사 기술문서
  - https://www.ahmics.com/support/karte-docs/kensa-sankouti/%E3%82%BE%E3%82%A8%E3%83%86%E3%82%A3%E3%82%B9%E3%82%B8%E3%83%A3%E3%83%91%E3%83%B3_VETSCAN%20HM5_20251121%E5%8F%97%E9%A0%98.pdf
- **ht5-bulletin** — Element HT5 Reference Ranges — Product Bulletin (US19LT0408_001) (Heska / Antech Diagnostics, 2024) · 제조사 참고치표
  - https://customerportal.heska.com/Analyzers/Analyzer?fileName=Reference+Ranges+-+Product+Bulletin-+Element+HT5.pdf&handler=DownloadFile
- **ht5-de** — Element HT5 Referenzwerte (DE, V_202412) (Antech Diagnostics, 2024-12) · 제조사 참고치표(독일어판)
  - https://www.antechdiagnostics.de/sites/g/files/fnmzdf6206/files/2025-12/Referenzwerttabelle_Element%20HT5_DEU_20241217.pdf
- **epoc-bulletin** — Element POC Blood Gas & Electrolyte Analyzer — Reference Ranges and Reportable Ranges, Product Bulletin (18LT0903) (Heska, 2018) · 제조사 참고치표
  - https://customerportal.heska.com/Analyzers/Analyzer?fileName=Reference+Ranges+-+EPOC.pdf&handler=DownloadFile
- **epoc-manual** — Element POC Product Manual (US23MD0402-001) — 종별 참고범위 제공(개·고양이·말) 명시 (Heska / Antech, 2024) · 제조사 사용설명서
  - https://www.antechdiagnostics.com/wp-content/uploads/2025/03/Heska_Element-POC-Product-Manual_US23MD0402-001_032824_Digital-1.pdf
- **pt10v-ri** — Samsung PT10V Reference Intervals 1·2 (제조사 참고구간표, Scil 유통본) (Samsung Electronics (현 i-SENS 유통), (발행연도 미표기)) · 제조사 참고치표
  - https://www.scilvet.com/fileadmin/editors/UNITED_KINGDOM/PT10V_Reference_Intervals.pdf
- **pt10v-news** — 데일리벳 "삼성 동물임상화학분석기 PT10V" / 전자신문 "삼성전자 의료기기, 수의학 시장 겨냥" — 국내 유통·판매 확인 (데일리벳·전자신문, 2015·2016) · 언론(국내 유통 확인)
  - https://www.dailyvet.co.kr/news/industry/48332
- **vetchroma-brochure** — VET CHROMA Animal Immunofluorescence Analyzer (Boditech Med, Ver 01_20180308_8P_EN) — 항목별 cut-off/판정구간 (Boditech Med, 2018) · 제조사 제품자료
  - https://www.procodehub.in/sr/pdf/Vet%20Chroma%E2%84%8F%EF%B8%8F%20(KIN%20Diagnostics).pdf
- **vetchroma-hba1c** — Adam D. et al. Evaluation of a canine hemoglobin A1c point-of-care assay (VetChroma), 2026 — 건강한 젊은 개 HbA1c 참고구간 1.25–2.75% (PMC (peer-reviewed), 2026) · 공개 논문
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC13594662/
- **vetchroma-dailyvet** — 데일리벳 "베트 크로마 출시" / "벳크로마 신제품" — 국내 유통사(웅비메디텍·웅비애니벳), 검사 항목 (데일리벳, 2017·2019) · 언론(국내 유통 확인)
  - https://www.dailyvet.co.kr/news/practice/companion-animal/74177

## 4. 출처 간 수치가 달라 함께 표시한 항목

임의로 하나를 고르지 않고 두 값을 모두 화면에 표시합니다(주 표시값 + "다른 출처").

| 장비 | 구분 | 항목 | 주 표시 | 다른 출처 | 다른 출처 기관 |
|---|---|---|---|---|---|
| ProCyte One | 개 | RBC | 5.6–9.21 | 5.65–8.87 | IDEXX Laboratories |
| ProCyte One | 개 | HCT | 36.6–61.1 | 37.3–61.7 | IDEXX Laboratories |
| ProCyte One | 개 | HGB | 12.4–22.0 | 13.1–20.5 | IDEXX Laboratories |
| ProCyte One | 개 | MCV | 57.6–75.2 | 61.6–73.5 | IDEXX Laboratories |
| ProCyte One | 개 | MCH | 20.1–27.6 | 21.2–25.9 | IDEXX Laboratories |
| ProCyte One | 개 | MCHC | 31.9–39.3 | 32.0–37.9 | IDEXX Laboratories |
| ProCyte One | 개 | RDW | 13.7–22.1 | 13.6–21.7 | IDEXX Laboratories |
| ProCyte One | 개 | WBC | 5.05–18.6 | 5.05–16.76 | IDEXX Laboratories |
| ProCyte One | 개 | NEU | 2.92–13.8 | 2.95–11.64 | IDEXX Laboratories |
| ProCyte One | 개 | LYM | 0.76–4.4 | 1.05–5.1 | IDEXX Laboratories |
| ProCyte One | 개 | MON | 0.31–1.95 | 0.16–1.12 | IDEXX Laboratories |
| ProCyte One | 개 | PLT | 148.0–674.0 | 148.0–484.0 | IDEXX Laboratories |
| ProCyte One | 개 | MPV | 8.1–14.7 | 8.7–13.2 | IDEXX Laboratories |
| ProCyte One | 개 | PCT | 0.16–0.75 | 0.14–0.46 | IDEXX Laboratories |
| ProCyte One | 고양이 | RBC | 6.69–12.0 | 6.54–12.2 | IDEXX Laboratories |
| ProCyte One | 고양이 | HCT | 28.4–54.2 | 30.3–52.3 | IDEXX Laboratories |
| ProCyte One | 고양이 | HGB | 9.2–18.1 | 9.8–16.2 | IDEXX Laboratories |
| ProCyte One | 고양이 | MCV | 34.2–56.2 | 35.9–53.1 | IDEXX Laboratories |
| ProCyte One | 고양이 | MCH | 12.0–18.5 | 11.8–17.3 | IDEXX Laboratories |
| ProCyte One | 고양이 | MCHC | 28.9–37.2 | 28.1–35.8 | IDEXX Laboratories |
| ProCyte One | 고양이 | RDW | 18.4–30.5 | 15.0–27.0 | IDEXX Laboratories |
| ProCyte One | 고양이 | WBC | 3.37–19.9 | 2.87–17.02 | IDEXX Laboratories |
| ProCyte One | 고양이 | NEU | 1.61–15.1 | 2.3–10.29 | IDEXX Laboratories |
| ProCyte One | 고양이 | LYM | 0.58–5.37 | 0.92–6.88 | IDEXX Laboratories |
| ProCyte One | 고양이 | MON | 0.11–1.32 | 0.05–0.67 | IDEXX Laboratories |
| ProCyte One | 고양이 | EOS | 0.14–1.57 | 0.17–1.57 | IDEXX Laboratories |
| ProCyte One | 고양이 | PLT | 151.0–585.0 | 151.0–600.0 | IDEXX Laboratories |
| ProCyte One | 고양이 | MPV | 10.4–20.4 | 11.4–21.6 | IDEXX Laboratories |
| ProCyte One | 고양이 | PCT | 0.19–0.83 | 0.17–0.86 | IDEXX Laboratories |
| LaserCyte / LaserCyte Dx | 개 · 성견 | LYM | 0.5–4.9 | 0.7–4.9 | University of Zurich |
| VetScan VS2 | 개 | Cl | 95–119 | 106–120 | Zoetis |
| VetScan VS2 | 고양이 | Cl | 99–122 | 112–126 | Zoetis |

## 5. 목록에서 뺀 장비와 이유

- **IDEXX VetLab Station** — 분석기가 아니라 여러 IDEXX 장비를 묶는 관리 소프트웨어(VetLab Station)입니다. 참고구간은 각 분석기 문서를 보세요.
- **Zoetis VetScan VSpro** — PT/aPTT 등 응고 검사 전용 장비로, CBC·생화학 참고치는 제공되지 않습니다.
- **Heska Scout** — "Heska Scout"라는 이름의 동물용 CBC·생화학 장비는 제조사(Heska/Antech) 문서에서 확인되지 않았습니다. Heska 계열은 Element HT5·HT5+, Element POC, Element DC입니다.
- **Samsung LABGEO HC10** — 삼성전자의 인체용 18항목 3분류 혈액분석기입니다(2011년 식약처 허가). 수의용 참고구간 문서가 없어 목록에서 뺐습니다. 삼성의 수의용 장비는 PT10V(생화학)입니다.
- **Bionote Vcheck H6 / M10** — 바이오노트 Vcheck H6(2026년 출시 혈액분석기)와 M10(면역형광)은 확인했으나, H6의 종별 기본 참고치 수치표를 확보하지 못해 넣지 않았습니다. H6 매뉴얼(I7806-4E, 2025)에 참고범위 설정 기능만 확인됩니다.
- **이원 계열** — 국내에 "이원" 이름의 동물용 CBC·생화학 분석기는 확인되지 않았습니다.
- **(참고) Heska Element DC** — Samsung PT10V와 같은 계열로 보이지만 일부 항목 참고치가 달라(개 ALT 12–101 등) PT10V 값의 교차 출처로 쓰지 않았습니다.

## 6. 한계

- 값은 제조사 문서에 적힌 그대로이며, 병원 장비의 시약 로트·소프트웨어 버전에 따라 달라질 수 있습니다.
- IDEXX Catalyst는 같은 문서의 정판·개정판만 대조했고, 제3자 문서와의 교차 확인은 하지 못했습니다.
- LaserCyte는 제조사 원문을 확보하지 못해 제조사 값을 인용한 논문 2편으로 대조했고, 고양이 값은 넣지 못했습니다.
- Samsung PT10V·VetChroma·Element POC·ProCyte Dx는 문서 1건에서만 확인했습니다.
- 판정의 정상/경계/치료 필요 구분은 병원 표시 규칙(참고범위 폭의 20%)이며 제조사 기준이 아닙니다.

/* =========================================================
   굿모닝펫 · 소견별 권장 카탈로그 (영양제 / 간식 / 밥 각 Best 1·2·3)
   ---------------------------------------------------------
   근거: 병원 실제 판매자료 `1년_판매내역_261112.xls` (20,262행)
        — 2025-10 ~ 2026-11 판매 품목명·판매건수를 집계해
          우리 병원이 실제로 쓰고 파는 제품만 올렸습니다.
   원칙: 가격·거래처·보호자 정보는 넣지 않습니다(제품명과 권장 이유만).
        최종 선택은 항상 원장님 판단이 우선입니다.
   ========================================================= */
var G_PRODUCTS = (function () {
  'use strict';

  /* ---------- 제품 사전 ---------- */
  var P = {
    /* 영양제 · 보조제 */
    complivit:  { n: '콤플리비트 150g', t: '영양제', d: '종합비타민 액상' },
    omega3:     { n: '세라마이드&오메가3 10ea', t: '영양제', d: '오메가3' },
    lactoenz:   { n: '락토엔자임 32g', t: '영양제', d: '유산균+소화효소' },
    promax:     { n: '프로멕스S 9ml', t: '영양제', d: '농축 유산균' },
    atokine:    { n: '아토카인 캡슐 100c', t: '영양제', d: '장·피부면역 유산균' },
    synbiotic:  { n: '신바이오틱DC 50c', t: '영양제', d: '장 유산균' },
    welcare_gi: { n: '웰케어 G/I 30포', t: '영양제', d: '위장관 액상' },
    fmt_s:      { n: 'FMT 마이크로바이옴 캡슐 S', t: '영양제', d: 'FMT' },
    fmt_o:      { n: 'FMT 마이크로바이옴 캡슐 O', t: '영양제', d: 'FMT' },
    fmt_l:      { n: 'FMT 마이크로바이옴 캡슐 L', t: '영양제', d: 'FMT' },
    embiome:    { n: 'FMT 엠바이옴 7500mg 캡슐', t: '영양제', d: 'FMT' },
    renal_ad:   { n: '레날AD 레날어드밴스 70g', t: '영양제', d: '신장 유산균' },
    renalin:    { n: '레나크린 120캡슐', t: '영양제', d: '신장 흡착제' },
    xtonin:     { n: '엑스토닌 8g', t: '영양제', d: '요로·방광' },
    stonecare:  { n: '결석케어스트루 24g', t: '영양제', d: '결석 관리' },
    cystopro:   { n: '시스토프로 30정', t: '영양제', d: '방광·요로' },
    liveral:    { n: '리버랄 8g', t: '영양제', d: '간 보호' },
    hepamex:    { n: '간케어 헤파멕스 24g', t: '영양제', d: '간 보호' },
    samylin:    { n: '새밀린 타블릿 30T', t: '영양제', d: '간(SAMe)' },
    flexadin:   { n: '플렉사딘 어드밴스 관절', t: '영양제', d: '관절·연골' },
    runagain:   { n: '런어게인 60c', t: '영양제', d: '관절(초록입홍합)' },
    joint_sup:  { n: '펫보이스 관절 60g', t: '영양제', d: '관절 파우더' },
    wc_heart:   { n: '웰케어 하트 100g', t: '영양제', d: '심장' },
    cardivex:   { n: '카디벡스 플러스 240g', t: '영양제', d: '심장·신장' },
    cq10:       { n: 'CQ-10 심장 이노캡스 60c', t: '영양제', d: '심장' },
    activate:   { n: '액티베이트XS 60c', t: '영양제', d: '눈·항산화' },
    wc_eye:     { n: '웰케어 눈 O/V 30포', t: '영양제', d: '눈' },
    pb_immune:  { n: '펫보이스 면역 60g', t: '영양제', d: '면역' },
    multivit:   { n: '멀티비타 시니어 24g', t: '영양제', d: '종합비타민' },
    pankreatin: { n: '췌장케어 판크레딘 24g', t: '영양제', d: '소화효소' },
    da_powder:  { n: 'd/a 시그니처바이 60g', t: '영양제', d: '췌장 효소' },
    ez8:        { n: 'EZ-8 소화효소 이노캡스 90c', t: '영양제', d: '소화효소' },
    nanolabs:   { n: '나노랩스 덴탈필름 85g', t: '영양제', d: '구강 필름' },
    vc_tooth:   { n: '벳큐어 바르는 치약 70ml', t: '영양제', d: '구강' },

    /* 간식 · 껌 */
    drk_intest: { n: '닥터케이 인테스틴 100g', t: '간식', d: '소화 처방 간식' },
    drk_joint:  { n: '닥터케이 조인트 100g', t: '간식', d: '관절 처방 간식' },
    drk_skin:   { n: '닥터케이 스킨 100g', t: '간식', d: '피부 처방 간식' },
    jointol:    { n: '닥터조인톨 280g', t: '간식', d: '관절 껌' },
    drdentol:   { n: '닥터덴톨 310g', t: '간식', d: '먹는 치약 껌' },
    naerak:     { n: '네이락 퓨어트릿 프로바이오 150g', t: '간식', d: '유산균 간식' },
    ic_body:    { n: '네이락 퓨어트릿 아이앤바디 150g', t: '간식', d: '눈·항산화 간식' },
    vitalic:    { n: '바이탈릭 150g', t: '간식', d: '간·심장·신장 간식' },
    diet_joint: { n: '다이어트&조인트츄 150g', t: '간식', d: '체중+관절' },
    vc_dental:  { n: '벳큐어 식이알러지+덴탈 180g', t: '간식', d: '알러지+치아' },
    vc_joint:   { n: '벳큐어 식이알러지+관절 150g', t: '간식', d: '알러지+관절' },
    vc_urinary: { n: '벳큐어 식이알러지+요로 150g', t: '간식', d: '알러지+요로' },
    milkstick:  { n: '밀크스틱 12p', t: '간식', d: '구강·스트레스' },
    fucoidan:   { n: '후코이단 트릿 300g', t: '간식', d: '항산화·면역' },

    /* 밥 (처방식·화식·스튜) */
    dm_gd:      { n: '닥터마스터 G/D 100g', t: '밥', d: '가스트로 화식' },
    m3_lowfat:  { n: 'M3 USF/로우팻 1.5kg', t: '밥', d: '가수분해 로우팻' },
    m1_urinary: { n: 'M1 USF/유리너리 S/O 1.5kg', t: '밥', d: '유리너리 처방식' },
    of_diet:    { n: 'USF 06 O/F 체중관리 1.5kg', t: '밥', d: '체중관리 처방식' },
    m2_weight:  { n: 'M2 USF/웨이트 컨트롤 1.5kg', t: '밥', d: '체중관리 처방식' },
    lf_diet:    { n: 'USF 09 LF/F 1.5kg', t: '밥', d: '저지방 처방식' },
    jf_diet:    { n: 'USF 04 J/F 관절 1.5kg', t: '밥', d: '관절 처방식' },
    hf_diet:    { n: 'USF 14 H/F 심장 1.5kg', t: '밥', d: '저염 심장 처방식' },
    a3_diet:    { n: 'USF 16 A3/F 1.5kg', t: '밥', d: '알러지·결석 겸용' },
    usf10:      { n: 'USF 10 US/F 5kg', t: '밥', d: '가수분해 피부' },
    usf:        { n: 'S/A 닥터힐메딕스 소프트알러제닉 1kg', t: '밥', d: '가수분해 알러지' },
    kf_diet:    { n: 'USF 12 K/F 신장 1.5kg', t: '밥', d: '신장 처방식' },
    ulf_diet:   { n: 'USF 15 UL/유리너리 1.5kg', t: '밥', d: '유리너리 처방식' },
    dh_diet:    { n: 'D/H 헤파틱 1.5kg', t: '밥', d: '간·저지방 처방식' },
    vet_am:     { n: '벳트러스 에이엠 1.2kg', t: '밥', d: '가수분해 소프트' },
    recovery:   { n: '리커버리알엑스 아노레딕스 오리 1kg', t: '밥', d: '회복·소프트' },
    sig_gi:     { n: '시그니처바이 GI/A 240g', t: '밥', d: 'GI 로우팻' },
    vet_lowfat: { n: '벳큐어 로우팻-뉴 300g', t: '밥', d: '로우팻 캔' },
    allercut:   { n: '알러컷 캥거루 500g', t: '밥', d: '자연식 알러지' },
    cs_pouch:   { n: '닥터마스터 C/S 100g', t: '밥', d: '관절·시니어 화식' },
    herbal_stew:{ n: '산양삼 영양스튜 닭 85g', t: '밥', d: '회복 스튜' }
  };

  /* 카테고리 */
  var CATS = [
    { id: 'sup', ko: '영양제', em: '💊', hint: '종합비타민·오메가3·유산균 기본 + 소견 맞춤' },
    { id: 'snack', ko: '간식', em: '🦴', hint: '처방 간식·껌 중에서' },
    { id: 'food', ko: '밥', em: '🍚', hint: '처방식·화식·스튜 중에서' }
  ];

  /* 소견 태그 — kw는 진료 메모 자동 감지용 낱말 */
  var TAGS = [
    { id: 'gut', ko: '장·소화 (설사·구토)', short: '장·소화', em: '🫄',
      kw: ['장', '소화', '설사', '묽은변', '구토', '위장', '장염', '식이', '변비', '복통', '가스트로', '장내'],
      explain: '장 점막이 회복되고 좋은 균이 자리 잡기까지 보통 2~4주가 걸립니다.',
      care: '장이 안정될 때까지 사료·간식은 한 가지만, 7일 동안 10%씩 바꿔 주세요',
      pick: {
        sup: [
          { id: 'promax', why: '농축 유산균 — 설사·장염 급성기 장내 환경부터 정리' },
          { id: 'lactoenz', why: '유산균+소화효소 — 묽은 변·소화 불량에 함께' },
          { id: 'welcare_gi', why: '위장관 액상 — 먹기 힘들 때 한 포로' }
        ],
        snack: [
          { id: 'drk_intest', why: '소화 전용 처방 간식 — 자극 없이 먹이면서 관리' },
          { id: 'naerak', why: '유산균 간식 — 장 관리 하면서 간식까지' },
          { id: 'vitalic', why: '간·심장·신장 겸용 — 장 쉬는 동안 기력 보충' }
        ],
        food: [
          { id: 'dm_gd', why: '가스트로인테스티널 화식 — 자극 없이 장을 쉬게' },
          { id: 'sig_gi', why: 'GI/A 로우팻 — 소화 부담 적은 처방식' },
          { id: 'vet_lowfat', why: '로우팻 캔 — 잘 안 먹을 때 넘기기 좋음' }
        ]
      },
      alt: {
        sup: ['atokine', 'synbiotic', 'complivit', 'omega3'],
        snack: ['drk_skin', 'ceramide', 'milkstick', 'ic_body'],
        food: ['m3_lowfat', 'recovery', 'lf_diet', 'a3_diet']
      } },

    { id: 'fmt', ko: 'FMT·장내미생물', short: 'FMT', em: '🧬',
      kw: ['fmt', '마이크로바이옴', '장내미생물', '엠바이옴', '케이나인', '유익균', '미생물'],
      explain: '장내 유익균이 자리 잡는 데는 시간이 걸려, 한 번에 바뀌지 않습니다.',
      care: '유익균이 안착하도록 처방식·유산균을 끊지 말고 꾸준히',
      pick: {
        sup: [
          { id: 'fmt_s', why: 'FMT 캡슐 — 장내미생물 이식 뒤 균 자리 잡기' },
          { id: 'atokine', why: '포스트바이오틱스로 장·면역 함께 관리' },
          { id: 'lactoenz', why: '소화효소까지 더해 이식 후 소화 부담을 줄임' }
        ],
        snack: [
          { id: 'naerak', why: '유산균 간식 — 안착 기간 동안 매일 조금씩' },
          { id: 'drk_intest', why: '소화 처방 간식 — 장 자극을 피하면서' },
          { id: 'ic_body', why: '항산화 간식 — 장·면역 함께' }
        ],
        food: [
          { id: 'recovery', why: '아노레딕스 소프트 — 이식 후 장 부담을 줄인 식사' },
          { id: 'dm_gd', why: '가스트로 화식 — 소화가 편한 쪽으로' },
          { id: 'a3_diet', why: '알러지·결석 겸용 처방식 — 자극 최소' }
        ]
      },
      alt: {
        sup: ['fmt_o', 'fmt_l', 'embiome', 'synbiotic', 'promax', 'complivit'],
        snack: ['drk_skin', 'vitalic', 'milkstick', 'fucoidan'],
        food: ['m3_lowfat', 'lf_diet', 'sig_gi', 'vet_am']
      } },

    { id: 'skin', ko: '피부·알러지 (아토피)', short: '피부·알러지', em: '🧴',
      kw: ['피부', '알러지', '아토피', '가려움', '긁', '탈모', '발진', '귀', '식이알러지', '가수분해'],
      explain: '피부는 한 달 주기로 새로 나므로, 4주는 지나야 변화가 보입니다.',
      care: '가수분해 처방식 유지 + 간식은 처방 간식만, 4주 뒤 경과 확인',
      pick: {
        sup: [
          { id: 'atokine', why: '피부면역 포스트바이오틱스 — 가려움을 장에서부터' },
          { id: 'omega3', why: '세라마이드+오메가3 — 피부 장벽·보습' },
          { id: 'lactoenz', why: '유산균+소화효소 — 알러지 반응 줄이는 기본' }
        ],
        snack: [
          { id: 'drk_skin', why: '피부 전용 처방 간식 — 긁는 아이 간식까지 관리' },
          { id: 'vc_joint', why: '식이알러지 겸용 껌 — 알러지 아이도 안전하게' },
          { id: 'naerak', why: '유산균 간식 — 피부·장 함께' }
        ],
        food: [
          { id: 'usf', why: '가수분해 처방식 — 알러지 항원 노출을 줄임' },
          { id: 'm3_lowfat', why: '식이알러지·피부 겸용 로우팻 처방식' },
          { id: 'usf10', why: '가수분해 피부 처방식 — 대형견·장기 급여' }
        ]
      },
      alt: {
        sup: ['complivit', 'synbiotic', 'multivit'],
        snack: ['ceramide', 'vitalic', 'milkstick', 'ic_body'],
        food: ['a3_diet', 'vet_am', 'allercut', 'dm_gd']
      } },

    { id: 'renal', ko: '신장', short: '신장', em: '💧',
      kw: ['신장', '신부전', 'bun', 'creatinine', '크레아티닌', 'sdma', '레날', '단백뇨'],
      explain: '신장은 한 번 나빠지면 회복이 느려, 수치 추적과 식이 관리가 핵심입니다.',
      care: '물 섭취 늘리고 인·단백질 제한, 2~3달마다 혈액·소변 재검',
      pick: {
        sup: [
          { id: 'renal_ad', why: '신장 유산균·인 흡착 — 신장 부담을 낮추는 보조' },
          { id: 'renalin', why: '신장 흡착제 — 요독 물질 흡착 보조' },
          { id: 'omega3', why: '오메가3 — 신장 염증·단백뇨 관리 보조' }
        ],
        snack: [
          { id: 'ic_body', why: '신장·눈 겸용 처방 간식 — 단백질 부담 적게' },
          { id: 'vitalic', why: '간·심장·신장용 — 신장 아이 기본 간식' },
          { id: 'naerak', why: '유산균 간식 — 요독·장내 환경 관리' }
        ],
        food: [
          { id: 'kf_diet', why: '신장 처방식 — 인·단백질을 직접 제한' },
          { id: 'recovery', why: '소프트 처방식 — 식욕 떨어질 때 넘기기 좋음' },
          { id: 'lf_diet', why: '저지방 처방식 — 신장·췌장 함께 볼 때' }
        ]
      },
      alt: {
        sup: ['complivit', 'lactoenz', 'multivit'],
        snack: ['drk_intest', 'ceramide', 'milkstick'],
        food: ['m3_lowfat', 'a3_diet', 'dm_gd']
      } },

    { id: 'urinary', ko: '방광·결석 (요로)', short: '방광·결석', em: '🚽',
      kw: ['방광', '결석', '요로', '혈뇨', '배뇨', '소변', '스투바이트', '옥살레이트', '요실금'],
      explain: '결석은 재발이 잦아, 물을 늘리고 처방식을 유지하는 것이 가장 중요합니다.',
      care: '음수량 늘리고 처방식 유지, 4~6주 뒤 소변·초음파 재검',
      pick: {
        sup: [
          { id: 'xtonin', why: '요로결석·방광 — 결석 성분 억제 보조' },
          { id: 'stonecare', why: '결석케어 — 크렌베리·글루코스로 요로 건강' },
          { id: 'cystopro', why: '방광 점막 보호 — 요로 슬러지·방광염' }
        ],
        snack: [
          { id: 'vc_urinary', why: '요로 건강 겸용 껌 — 결석 아이 간식' },
          { id: 'ic_body', why: '항산화 간식 — 방광 염증 관리' },
          { id: 'naerak', why: '유산균 간식 — 요로·장 함께' }
        ],
        food: [
          { id: 'm1_urinary', why: '유리너리 S/O 처방식 — 결정·결석 재발 방지' },
          { id: 'ulf_diet', why: '유리너리 처방식 — 음수량·소변 pH 관리' },
          { id: 'a3_diet', why: '결석 겸용 처방식 — 다른 질환 같이 볼 때' }
        ]
      },
      alt: {
        sup: ['omega3', 'complivit', 'lactoenz'],
        snack: ['vitalic', 'ceramide', 'milkstick'],
        food: ['kf_diet', 'm3_lowfat', 'recovery']
      } },

    { id: 'liver', ko: '간·담낭', short: '간·담낭', em: '🫀',
      kw: ['간', '담낭', 'alt', 'ast', 'alp', '빌리루빈', '간수치', '슬러지', '지방간', '헤파'],
      explain: '간은 재생력이 있어, 원인을 빼주고 1~2달 지켜보면 수치가 내려오는 경우가 많습니다.',
      care: '저지방 유지 + 1달 뒤 간수치 재검, 처방제는 2~3달 이어서',
      pick: {
        sup: [
          { id: 'liveral', why: '실리마린 간 보호 — 간수치 오른 아이 기본' },
          { id: 'hepamex', why: '밀크씨슬+포스파티딜콜린 — 간세포 회복 보조' },
          { id: 'samylin', why: 'SAMe — 담즙 정체·간세포 보호' }
        ],
        snack: [
          { id: 'naerak', why: '유산균 간식 — 간·장 함께 관리' },
          { id: 'vitalic', why: '간·심장·신장용 — 간 아이 기본 간식' },
          { id: 'fucoidan', why: '항산화 간식 — 간 염증·산화 스트레스' }
        ],
        food: [
          { id: 'dh_diet', why: '간·저지방 처방식 — 지방 부담을 줄임' },
          { id: 'lf_diet', why: '저지방 처방식 — 간·췌장 함께' },
          { id: 'recovery', why: '소프트 처방식 — 식욕·기력 떨어질 때' }
        ]
      },
      alt: {
        sup: ['omega3', 'complivit', 'multivit'],
        snack: ['ic_body', 'drk_intest', 'ceramide'],
        food: ['m3_lowfat', 'a3_diet', 'kf_diet']
      } },

    { id: 'joint', ko: '관절·슬개골', short: '관절', em: '🦴',
      kw: ['관절', '슬개', '파행', '절뚝', '연골', '디스크', '다리', '보행', '십자인대'],
      explain: '관절 연골은 혈관이 적어 회복이 느리고, 체중이 1kg 줄면 부담이 크게 줄어듭니다.',
      care: '체중을 먼저 줄이고 미끄러운 바닥을 막아 주세요, 4주 뒤 보행 확인',
      pick: {
        sup: [
          { id: 'flexadin', why: '초록홍합·연골 성분 — 통증·뻣뻣함 완화 보조' },
          { id: 'runagain', why: '초록입홍합 — 관절 염증·연골 관리' },
          { id: 'joint_sup', why: '관절 파우더 — 밥에 섞어 꾸준히' }
        ],
        snack: [
          { id: 'drk_joint', why: '관절 전용 처방 간식 — 먹이면서 관리' },
          { id: 'jointol', why: '관절 껌 — 씹는 재미와 관리 동시에' },
          { id: 'diet_joint', why: '체중+관절 — 감량 중 관절 부담까지' }
        ],
        food: [
          { id: 'jf_diet', why: '관절 처방식 — 체중·연골을 함께 관리' },
          { id: 'cs_pouch', why: '관절·시니어 화식 — 노령 아이 소화 편하게' },
          { id: 'm2_weight', why: '웨이트 컨트롤 — 관절 부담 줄이는 감량' }
        ]
      },
      alt: {
        sup: ['omega3', 'complivit', 'multivit'],
        snack: ['vc_joint', 'vitalic', 'milkstick'],
        food: ['m3_lowfat', 'recovery', 'of_diet']
      } },

    { id: 'heart', ko: '심장', short: '심장', em: '❤️',
      kw: ['심장', '심잡음', '심부전', '기침', 'bnp', '혈압', '부정맥', '청색'],
      explain: '심장은 대신 일해 주는 기관이 없어, 조기 발견과 꾸준한 약·저염 관리가 중요합니다.',
      care: '저염·체중 관리, 1~3달 뒤 심장초음파·호흡수 재확인',
      pick: {
        sup: [
          { id: 'wc_heart', why: '타우린·CQ10·오메가3 — 심장 보조의 기본' },
          { id: 'cardivex', why: '심장·신장 함께 보는 보조제' },
          { id: 'cq10', why: '코엔자임Q10 — 심근 에너지·항산화' }
        ],
        snack: [
          { id: 'vitalic', why: '심장용 처방 간식 — 저염 관리 중에도' },
          { id: 'ic_body', why: '항산화 간식 — 심장·눈 함께' },
          { id: 'naerak', why: '유산균 간식 — 심장약 먹는 아이 장 관리' }
        ],
        food: [
          { id: 'hf_diet', why: '저염 심장 처방식 — 나트륨 부담을 줄임' },
          { id: 'recovery', why: '소프트 처방식 — 식욕·기력 떨어질 때' },
          { id: 'm2_weight', why: '웨이트 컨트롤 — 심장 부담 줄이는 체중 관리' }
        ]
      },
      alt: {
        sup: ['omega3', 'complivit', 'multivit'],
        snack: ['ceramide', 'milkstick', 'drk_intest'],
        food: ['kf_diet', 'm3_lowfat', 'a3_diet']
      } },

    { id: 'dental', ko: '치아·구강', short: '치아·구강', em: '🦷',
      kw: ['치아', '구강', '치석', '잇몸', '구취', '치은', '스케일링', '발치'],
      explain: '치석은 사흘이면 다시 끼기 시작해, 집에서 매일 관리하는 것이 가장 효과적입니다.',
      care: '매일 한 번 구강 관리 + 6개월 뒤 치과 재검',
      pick: {
        sup: [
          { id: 'nanolabs', why: '덴탈필름 — 붙였다 떼는 데일리 구강 관리' },
          { id: 'vc_tooth', why: '바르는 치약 — 양치 어려운 아이도 매일' },
          { id: 'complivit', why: '종합비타민 — 잇몸·점막 회복 기본' }
        ],
        snack: [
          { id: 'drdentol', why: '먹는 치약 — 매일 씹으면서 치석 관리' },
          { id: 'vc_dental', why: '알러지 겸용 덴탈 껌 — 알러지 아이도' },
          { id: 'milkstick', why: '구강 건강 스틱 — 스트레스·치아 함께' }
        ],
        food: [
          { id: 'a3_diet', why: '치아·구강 겸용 처방식 — 알러지·결석까지' },
          { id: 'm3_lowfat', why: '로우팻 처방식 — 구강·피부 함께' },
          { id: 'of_diet', why: '체중관리 처방식 — 치아 관리와 감량 함께' }
        ]
      },
      alt: {
        sup: ['omega3', 'lactoenz', 'multivit'],
        snack: ['jointol', 'vc_joint', 'fucoidan'],
        food: ['dm_gd', 'recovery', 'jf_diet']
      } },

    { id: 'immune', ko: '면역·종양', short: '면역·종양', em: '🛡️',
      kw: ['면역', '종양', '혹', '암', '림프', '항산화', '글로불린', 'igg', '백혈구'],
      explain: '면역글로불린은 몸을 지키는 단백질로, 수치가 낮으면 감염에 취약해집니다.',
      care: '면역 수치·혹 크기 변화 기록, 정해진 날짜에 재검',
      pick: {
        sup: [
          { id: 'pb_immune', why: '발효 파우더 — 면역·기력 관리' },
          { id: 'atokine', why: '장·피부면역 포스트바이오틱스 — 면역 균형' },
          { id: 'multivit', why: '항산화·종합비타민으로 회복기 영양 보충' }
        ],
        snack: [
          { id: 'ic_body', why: '항산화 처방 간식 — 눈·면역 함께' },
          { id: 'fucoidan', why: '후코이단 — 항산화·면역 관리' },
          { id: 'naerak', why: '유산균 간식 — 장 면역의 기본' }
        ],
        food: [
          { id: 'recovery', why: '회복기 소프트 처방식 — 면역·기력 관리' },
          { id: 'herbal_stew', why: '산양삼 스튜 — 식욕·기력 보충' },
          { id: 'a3_diet', why: '알러지·결석 겸용 — 자극 최소 처방식' }
        ]
      },
      alt: {
        sup: ['complivit', 'omega3', 'lactoenz', 'synbiotic'],
        snack: ['drk_skin', 'vitalic', 'ceramide', 'milkstick'],
        food: ['m3_lowfat', 'vet_am', 'dm_gd']
      } },

    { id: 'eye', ko: '눈', short: '눈', em: '👁️',
      kw: ['눈', '안구', '각막', '결막', '눈물', '백내장', '포도막', '안압'],
      explain: '눈은 한 번 손상되면 되돌리기 어려워, 안약 횟수와 재검 시기를 지키는 것이 중요합니다.',
      care: '안약은 정해진 횟수를 지키고, 재검 전까지 목욕·먼지 노출을 줄여 주세요',
      pick: {
        sup: [
          { id: 'activate', why: '루테인·항산화 — 백내장·눈 노화 관리' },
          { id: 'wc_eye', why: '눈 전용 처방제 — 루테인·CQ10 보충' },
          { id: 'omega3', why: '오메가3 — 눈물막·각막 염증 관리' }
        ],
        snack: [
          { id: 'ic_body', why: '눈·항산화 전용 처방 간식 — 매일 관리' },
          { id: 'naerak', why: '유산균 간식 — 눈·장 함께' },
          { id: 'vitalic', why: '기력·영양 보충 간식 — 회복기' }
        ],
        food: [
          { id: 'a3_diet', why: '알러지·면역 겸용 처방식 — 눈 자극 줄이기' },
          { id: 'recovery', why: '회복기 소프트 처방식' },
          { id: 'm3_lowfat', why: '로우팻 처방식 — 피부·눈 함께' }
        ]
      },
      alt: {
        sup: ['complivit', 'multivit', 'lactoenz'],
        snack: ['drk_skin', 'ceramide', 'milkstick'],
        food: ['dm_gd', 'usf', 'jf_diet']
      } },

    { id: 'weight', ko: '체중·비만', short: '체중', em: '⚖️',
      kw: ['체중', '비만', '다이어트', '감량', '살', '뚱', '과체중'],
      explain: '감량은 빠르게 빼면 요요가 오기 쉬워, 한 달에 체중의 1~2%가 안전합니다.',
      care: '목표 체중의 1~2%씩만 감량, 2주마다 체중 기록',
      pick: {
        sup: [
          { id: 'complivit', why: '종합비타민 — 감량 중 영양 구멍을 메움' },
          { id: 'omega3', why: '오메가3 — 감량 중 피부·관절 보호' },
          { id: 'lactoenz', why: '유산균+소화효소 — 바뀐 식사에 장 적응' }
        ],
        snack: [
          { id: 'diet_joint', why: '다이어트+관절 — 칼로리 낮추고 관절 보호' },
          { id: 'vc_joint', why: '식이알러지 겸용 껌 — 간식 칼로리 부담 적게' },
          { id: 'milkstick', why: '구강 스틱 — 낮은 칼로리로 씹는 만족' }
        ],
        food: [
          { id: 'of_diet', why: '체중관리 처방식 — 칼로리 밀도를 낮춤' },
          { id: 'm2_weight', why: '웨이트 컨트롤 — 포만감 유지하며 감량' },
          { id: 'allercut', why: '캥거루 자연식 — 기호성 높은 감량식' }
        ]
      },
      alt: {
        sup: ['multivit', 'joint_sup', 'synbiotic'],
        snack: ['drk_joint', 'ceramide', 'fucoidan'],
        food: ['jf_diet', 'm3_lowfat', 'recovery']
      } },

    { id: 'pancreas', ko: '췌장·소화효소', short: '췌장', em: '🥣',
      kw: ['췌장', '췌장염', 'cpl', '소화효소', '리파아제', '지방변', '고지혈'],
      explain: '췌장은 지방 자극에 약해, 저지방 유지와 소화효소 보충이 회복을 돕습니다.',
      care: '저지방 유지 + 소화효소는 식사와 함께, 4주 뒤 재검',
      pick: {
        sup: [
          { id: 'pankreatin', why: '췌장 전용 소화효소 — 지방 소화를 직접 도움' },
          { id: 'da_powder', why: '소화효소 파우더 — 식사 때 섞여 편하게' },
          { id: 'ez8', why: 'EZ-8 — 식이섬유+효소로 소화 부담 완화' }
        ],
        snack: [
          { id: 'drk_intest', why: '소화 처방 간식 — 지방 적은 쪽으로' },
          { id: 'naerak', why: '유산균 간식 — 췌장·장 함께' },
          { id: 'vitalic', why: '기력 보충 간식 — 식욕 떨어질 때' }
        ],
        food: [
          { id: 'lf_diet', why: '저지방 처방식 — 췌장 자극을 줄임' },
          { id: 'm3_lowfat', why: '로우팻 — 소화가 편한 저지방' },
          { id: 'vet_lowfat', why: '로우팻 캔 — 잘 먹지 않을 때' }
        ]
      },
      alt: {
        sup: ['omega3', 'complivit', 'lactoenz'],
        snack: ['ic_body', 'ceramide', 'milkstick'],
        food: ['dm_gd', 'recovery', 'sig_gi']
      } },

    { id: 'senior', ko: '노령·종합', short: '노령·종합', em: '🐾',
      kw: ['노령', '시니어', '기력', '종합', '비타민', '건강검진', '회복', '수술후'],
      explain: '노령기에는 작은 변화가 큰 신호라, 6개월 검진과 기록이 가장 좋은 관리입니다.',
      care: '6개월마다 건강검진, 기력·체중 변화를 기록해 주세요',
      pick: {
        sup: [
          { id: 'complivit', why: '종합비타민 액상 — 기력·식욕 관리' },
          { id: 'omega3', why: '오메가3 — 관절·피부·신장 두루' },
          { id: 'lactoenz', why: '유산균+소화효소 — 노령 아이 소화 부담' }
        ],
        snack: [
          { id: 'vitalic', why: '간·심장·신장용 — 노령 기본 간식' },
          { id: 'jointol', why: '관절 껌 — 씹기·관절 함께' },
          { id: 'drdentol', why: '먹는 치약 — 노령 구강 관리' }
        ],
        food: [
          { id: 'recovery', why: '회복기 소프트 — 기력·식욕 보충' },
          { id: 'cs_pouch', why: '시니어 화식 — 씹기·소화 편하게' },
          { id: 'm2_weight', why: '웨이트 컨트롤 — 노령 체중 관리' }
        ]
      },
      alt: {
        sup: ['multivit', 'joint_sup', 'pb_immune'],
        snack: ['ic_body', 'naerak', 'milkstick'],
        food: ['a3_diet', 'herbal_stew', 'm3_lowfat']
      } }
  ];

  /* 기본 3종 영양제 — 소견이 없거나, 맞춤 영양제가 겹칠 때 바탕 */
  var BASE_SUP = ['complivit', 'omega3', 'lactoenz'];

  function byId(id) { return P[id] || null; }
  function tag(id) {
    for (var i = 0; i < TAGS.length; i++) { if (TAGS[i].id === id) return TAGS[i]; }
    return null;
  }
  function item(id, why) {
    var d = byId(id);
    if (!d) return null;
    return { id: id, name: d.n, type: d.t, note: d.d || '', why: why || '' };
  }
  function pick(tagId, cat, idx) {
    var t = tag(tagId);
    if (!t || !t.pick[cat] || !t.pick[cat][idx]) return null;
    var p = t.pick[cat][idx];
    return item(p.id, p.why);
  }
  function alt(tagId, cat) {
    var t = tag(tagId), out = [];
    if (!t) return out;
    var ids = (t.alt && t.alt[cat]) || [];
    for (var i = 0; i < ids.length; i++) {
      var it = item(ids[i], '');
      if (it) out.push(it);
    }
    return out;
  }
  function baseSup() {
    return BASE_SUP.map(function (id) { return item(id, ''); }).filter(Boolean);
  }
  function catMeta(id) {
    for (var i = 0; i < CATS.length; i++) { if (CATS[i].id === id) return CATS[i]; }
    return null;
  }

  /* 진료 메모에서 소견 태그 자동 감지 (많이 걸린 순, 최대 max개) */
  function detect(text, max) {
    var s = String(text || '').toLowerCase();
    var hits = [];
    for (var i = 0; i < TAGS.length; i++) {
      var t = TAGS[i], hit = 0;
      for (var k = 0; k < t.kw.length; k++) {
        if (s.indexOf(String(t.kw[k]).toLowerCase()) >= 0) hit++;
      }
      if (hit) hits.push({ id: t.id, n: hit, i: i });
    }
    hits.sort(function (a, b) { return b.n - a.n || a.i - b.i; });
    return hits.slice(0, max || 3).map(function (h) { return h.id; });
  }

  /* 이름으로 구분 추정 (order.html 용도코드와 같은 규칙) */
  function typeOf(name) {
    var s = String(name || '');
    if (/사료|처방식|화식|파우치|캔|키블|습식|건식|스튜|알러컷/.test(s)) return '밥';
    if (/유산균|프로바이오|엠바이옴|락토|신바이오|FMT/i.test(s)) return '영양제';
    if (/영양제|비타민|오메가|관절|콘드로|글루코|칼슘|보조제/.test(s)) return '영양제';
    return '간식';
  }

  return {
    version: '2026-11-28b',
    source: '병원 실제 판매자료(1년 판매내역_261112) 기준',
    TAGS: TAGS,
    CATS: CATS,
    BASE_SUP: BASE_SUP,
    byId: byId,
    tag: tag,
    item: item,
    pick: pick,
    alt: alt,
    baseSup: baseSup,
    catMeta: catMeta,
    detect: detect,
    typeOf: typeOf
  };
})();

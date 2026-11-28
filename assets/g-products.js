/* =========================================================
   굿모닝펫 · 소견별 권장 사료·처방제 카탈로그 (Best 1·2·3)
   ---------------------------------------------------------
   근거: 병원 실제 판매자료 `1년_판매내역_261112.xls` (20,262행)
        — 2025-10 ~ 2026-11 판매 품목명·판매건수를 그대로 집계해
          우리 병원이 실제로 쓰고 파는 제품만 올렸습니다.
   원칙: 가격·거래처·보호자 정보는 넣지 않습니다(제품명과 권장 이유만).
        최종 선택은 항상 원장님 판단이 우선입니다.
   ========================================================= */
var G_PRODUCTS = (function () {
  'use strict';

  /* 제품 사전 — n: 표시 이름, t: 구분 */
  var P = {
    promax:      { n: '프로멕스S 9ml', t: '처방제' },
    lactoenz:    { n: '락토엔자임 32g', t: '처방제' },
    atokine:     { n: '아토카인 캡슐 100c', t: '처방제' },
    synbiotic:   { n: '신바이오틱DC 50c', t: '처방제' },
    welcare_gi:  { n: '웰케어 G/I 30포', t: '처방제' },
    drk_intest:  { n: '닥터케이 인테스틴 100g', t: '간식' },
    dm_gd:       { n: '닥터마스터 G/D 100g', t: '처방식' },
    m3_lowfat:   { n: 'M3 USF/로우팻 1.5kg', t: '처방식' },
    sig_gi:      { n: '시그니처바이 GI/A 240g', t: '처방식' },
    vet_lowfat:  { n: '벳큐어 로우팻-뉴 300g', t: '처방식' },
    fmt_s:       { n: 'FMT 마이크로바이옴 캡슐 S', t: '처방제' },
    fmt_o:       { n: 'FMT 마이크로바이옴 캡슐 O', t: '처방제' },
    fmt_l:       { n: 'FMT 마이크로바이옴 캡슐 L', t: '처방제' },
    embiome:     { n: 'FMT 엠바이옴 7500mg 캡슐', t: '처방제' },
    renal_ad:    { n: '레날AD 레날어드밴스 70g', t: '처방제' },
    renalin:     { n: '레나크린 120캡슐', t: '처방제' },
    kf_diet:     { n: 'USF 12 K/F 신장 처방식 1.5kg', t: '처방식' },
    m1_urinary:  { n: 'M1 USF/유리너리 S/O 1.5kg', t: '처방식' },
    xtonin:      { n: '엑스토닌 8g', t: '처방제' },
    stonecare:   { n: '결석케어스트루 24g', t: '처방제' },
    cystopro:    { n: '시스토프로 30정', t: '처방제' },
    ulf_diet:    { n: 'USF 15 UL/F 유리너리 1.5kg', t: '처방식' },
    liveral:     { n: '리버랄 8g', t: '처방제' },
    hepamex:     { n: '간케어 헤파멕스 24g', t: '처방제' },
    samylin:     { n: '새밀린 타블릿 30T', t: '처방제' },
    dh_diet:     { n: 'D/H 헤파틱 1.5kg', t: '처방식' },
    vitalic:     { n: '바이탈릭 150g', t: '간식' },
    drk_joint:   { n: '닥터케이 조인트 100g', t: '간식' },
    jointol:     { n: '닥터조인톨 280g', t: '간식' },
    flexadin:    { n: '플렉사딘 어드밴스 관절', t: '처방제' },
    runagain:    { n: '런어게인 60c', t: '처방제' },
    jf_diet:     { n: 'USF 04 J/F 관절 처방식 1.5kg', t: '처방식' },
    cs_pouch:    { n: '닥터마스터 C/S 100g', t: '처방식' },
    librela:     { n: '리브렐라 주사 (병원 시술)', t: '병원' },
    wc_heart:    { n: '웰케어 하트 100g', t: '처방제' },
    hf_diet:     { n: 'USF 14 H/F 심장 처방식 1.5kg', t: '처방식' },
    cardivex:    { n: '카디벡스 플러스 240g', t: '처방제' },
    cq10:        { n: 'CQ-10 심장 이노캡스 60c', t: '처방제' },
    drdentol:    { n: '닥터덴톨 310g', t: '간식' },
    interberry:  { n: '인터베리 알파산', t: '처방제' },
    dentalgel:   { n: '덴탈벡스 오랄겔 20g', t: '처방제' },
    nanolabs:    { n: '나노랩스 덴탈필름 85g', t: '처방제' },
    vc_tooth:    { n: '벳큐어 바르는 치약 70ml', t: '처방제' },
    a3_diet:     { n: 'USF 16 A3/F 1.5kg', t: '처방식' },
    pb_immune:   { n: '펫보이스 면역 60g', t: '처방제' },
    multivit:    { n: '멀티비타 시니어 24g', t: '처방제' },
    complivit:   { n: '콤플리비트 150g', t: '처방제' },
    recovery:    { n: '리커버리알엑스 아노레딕스 오리 1kg', t: '처방식' },
    herbal_stew: { n: '산양삼 영양스튜 닭 85g', t: '처방식' },
    activate:    { n: '액티베이트XS 60c', t: '처방제' },
    wc_eye:      { n: '웰케어 눈 O/V 30포', t: '처방제' },
    idrops:      { n: '아이드롭스벳 0.5% 15ml', t: '처방제' },
    mb_vision:   { n: '마이뷰 비젼&옵틱 300ml', t: '처방제' },
    of_diet:     { n: 'USF 06 O/F 체중관리 1.5kg', t: '처방식' },
    m2_weight:   { n: 'M2 USF/웨이트 컨트롤 1.5kg', t: '처방식' },
    diet_joint:  { n: '다이어트&조인트츄 150g', t: '간식' },
    allercut:    { n: '알러컷 캥거루 500g', t: '처방식' },
    usf:         { n: 'S/A 닥터힐메딕스 소프트알러제닉 1kg', t: '처방식' },
    usf10:       { n: 'USF 10 US/F 5kg', t: '처방식' },
    drk_skin:    { n: '닥터케이 스킨 100g', t: '간식' },
    vet_am:      { n: '벳트러스 에이엠 1.2kg', t: '처방식' },
    pankreatin:  { n: '췌장케어 판크레딘 24g', t: '처방제' },
    lf_diet:     { n: 'USF 09 LF/F 1.5kg', t: '처방식' },
    da_powder:   { n: 'd/a 시그니처바이 60g', t: '처방제' },
    ez8:         { n: 'EZ-8 소화효소 이노캡스 90c', t: '처방제' },
    epikl:       { n: '에피클 췌장효소 60정', t: '처방제' },
    naerak:      { n: '네이락 퓨어트릿 프로바이오 150g', t: '간식' },
    ceramide:    { n: '세라마이드&오메가3 10ea', t: '간식' },
    ic_body:     { n: '네이락 퓨어트릿 아이앤바디 150g', t: '간식' }
  };

  /* 소견 태그 — kw는 진료 메모 자동 감지용 낱말 */
  var TAGS = [
    { id: 'gut', ko: '장·소화 (설사·구토)', short: '장·소화', em: '🫄',
      kw: ['장', '소화', '설사', '묽은변', '구토', '위장', '장염', '식이', '변비', '복통', '가스트로', '장내'],
      explain: '장 점막이 회복되고 좋은 균이 자리 잡기까지 보통 2~4주가 걸립니다.',
      care: '장이 안정될 때까지 사료·간식은 한 가지만, 7일 동안 10%씩 바꿔 주세요',
      pick: [
        { id: 'promax', why: '농축 유산균으로 설사·장염 급성기 장내 환경부터 정리' },
        { id: 'lactoenz', why: '유산균+소화효소 — 묽은 변·소화 불량에 함께' },
        { id: 'dm_gd', why: '가스트로인테스티널 화식 — 자극 없이 장을 쉬게' }
      ],
      alt: ['atokine', 'welcare_gi', 'm3_lowfat', 'sig_gi', 'vet_lowfat', 'drk_intest', 'naerak'] },

    { id: 'fmt', ko: 'FMT·장내미생물', short: 'FMT', em: '🧬',
      kw: ['fmt', '마이크로바이옴', '장내미생물', '엠바이옴', '케이나인', '유익균', '미생물'],
      explain: '장내 유익균이 자리 잡는 데는 시간이 걸려, 한 번에 바뀌지 않습니다.',
      care: '유익균이 안착하도록 처방식·유산균을 끊지 말고 꾸준히',
      pick: [
        { id: 'fmt_s', why: 'FMT 캡슐 — 장내미생물 이식 뒤 균 자리 잡기' },
        { id: 'atokine', why: '포스트바이오틱스로 장·면역 함께 관리' },
        { id: 'lactoenz', why: '소화효소까지 더해 이식 후 소화 부담을 줄임' }
      ],
      alt: ['fmt_o', 'fmt_l', 'embiome', 'synbiotic', 'promax', 'naerak'] },

    { id: 'skin', ko: '피부·알러지 (아토피)', short: '피부·알러지', em: '🧴',
      kw: ['피부', '알러지', '아토피', '가려움', '긁', '탈모', '발진', '귀', '식이알러지', '가수분해'],
      explain: '피부는 한 달 주기로 새로 나므로, 4주는 지나야 변화가 보입니다.',
      care: '가수분해 처방식 유지 + 간식은 처방 간식만, 4주 뒤 경과 확인',
      pick: [
        { id: 'atokine', why: '피부면역 포스트바이오틱스 — 가려움·아토피 장에서부터' },
        { id: 'usf', why: '가수분해 처방식으로 알러지 항원 노출을 줄임' },
        { id: 'm3_lowfat', why: '식이알러지·피부 겸용 로우팻 처방식' }
      ],
      alt: ['usf10', 'drk_skin', 'a3_diet', 'vet_am', 'lactoenz', 'allercut', 'ceramide'] },

    { id: 'renal', ko: '신장', short: '신장', em: '💧',
      kw: ['신장', '신부전', 'bun', 'creatinine', '크레아티닌', 'sdma', '레날', '단백뇨'],
      explain: '신장은 한 번 나빠지면 회복이 느려, 수치 추적과 식이 관리가 핵심입니다.',
      care: '물 섭취 늘리고 인·단백질 제한, 2~3달마다 혈액·소변 재검',
      pick: [
        { id: 'renal_ad', why: '신장 유산균·인 흡착 — 신장 부담을 낮추는 보조' },
        { id: 'kf_diet', why: '신장 처방식으로 인·단백질을 직접 제한' },
        { id: 'renalin', why: '신장 흡착제 — 요독 물질 흡착 보조' }
      ],
      alt: ['vitalic', 'ic_body', 'naerak', 'wlcare_gi'] },

    { id: 'urinary', ko: '방광·결석 (요로)', short: '방광·결석', em: '🚽',
      kw: ['방광', '결석', '요로', '혈뇨', '배뇨', '소변', '스투바이트', '옥살레이트', '요실금'],
      explain: '결석은 재발이 잦아, 물을 늘리고 처방식을 유지하는 것이 가장 중요합니다.',
      care: '음수량 늘리고 처방식 유지, 4~6주 뒤 소변·초음파 재검',
      pick: [
        { id: 'xtonin', why: '요로결석·방광 — 결석 성분 억제 보조' },
        { id: 'm1_urinary', why: '유리너리 처방식으로 결정·결석 재발 방지' },
        { id: 'stonecare', why: '결석케어 — 크렌베리·글루코스로 요로 건강' }
      ],
      alt: ['cystopro', 'ulf_diet', 'a3_diet'] },

    { id: 'liver', ko: '간·담낭', short: '간·담낭', em: '🫀',
      kw: ['간', '담낭', 'alt', 'ast', 'alp', '빌리루빈', '간수치', '슬러지', '지방간', '헤파'],
      explain: '간은 재생력이 있어, 원인을 빼주고 1~2달 지켜보면 수치가 내려오는 경우가 많습니다.',
      care: '저지방 유지 + 1달 뒤 간수치 재검, 처방제는 2~3달 이어서',
      pick: [
        { id: 'liveral', why: '실리마린 간 보호 — 간수치 오른 아이 기본' },
        { id: 'hepamex', why: '밀크씨슬+포스파티딜콜린 — 간세포 회복 보조' },
        { id: 'dh_diet', why: '간·저지방 처방식으로 지방 부담을 줄임' }
      ],
      alt: ['samylin', 'vitalic', 'naerak', 'ic_body', 'fn_diet'] },

    { id: 'joint', ko: '관절·슬개골', short: '관절', em: '🦴',
      kw: ['관절', '슬개', '파행', '절뚝', '연골', '디스크', '다리', '보행', '십자인대'],
      explain: '관절 연골은 혈관이 적어 회복이 느리고, 체중이 1kg 줄면 부담이 크게 줄어듭니다.',
      care: '체중을 먼저 줄이고 미끄러운 바닥을 막아 주세요, 4주 뒤 보행 확인',
      pick: [
        { id: 'drk_joint', why: '관절 전용 처방 간식 — 먹이면서 관리' },
        { id: 'flexadin', why: '초록홍합·연골 성분 — 통증·뻣뻣함 완화 보조' },
        { id: 'jf_diet', why: '관절 처방식으로 체중·연골을 함께 관리' }
      ],
      alt: ['jointol', 'runagain', 'cs_pouch', 'diet_joint', 'librela'] },

    { id: 'heart', ko: '심장', short: '심장', em: '❤️',
      kw: ['심장', '심잡음', '심부전', '기침', 'bnp', '혈압', '부정맥', '청색'],
      explain: '심장은 대신 일해 주는 기관이 없어, 조기 발견과 꾸준한 약·저염 관리가 중요합니다.',
      care: '저염·체중 관리, 1~3달 뒤 심장초음파·호흡수 재확인',
      pick: [
        { id: 'wc_heart', why: '타우린·CQ10·오메가3 — 심장 보조의 기본' },
        { id: 'hf_diet', why: '저염 심장 처방식 — 나트륨 부담을 줄임' },
        { id: 'cardivex', why: '심장·신장 함께 보는 보조제' }
      ],
      alt: ['cq10', 'vitalic', 'ic_body'] },

    { id: 'dental', ko: '치아·구강', short: '치아·구강', em: '🦷',
      kw: ['치아', '구강', '치석', '잇몸', '구취', '치은', '스케일링', '발치'],
      explain: '치석은 사흘이면 다시 끼기 시작해, 집에서 매일 관리하는 것이 가장 효과적입니다.',
      care: '매일 한 번 구강 관리 + 6개월 뒤 치과 재검',
      pick: [
        { id: 'drdentol', why: '먹는 치약 — 매일 씹으면서 치석 관리' },
        { id: 'interberry', why: '치은염 치료제 — 잇몸 염증·통증 완화' },
        { id: 'dentalgel', why: '오랄겔 — 염증 부위에 직접 발라 관리' }
      ],
      alt: ['nanolabs', 'vc_tooth', 'a3_diet'] },

    { id: 'immune', ko: '면역·종양', short: '면역·종양', em: '🛡️',
      kw: ['면역', '종양', '혹', '암', '림프', '항산화', '글로불린', 'igg', '백혈구'],
      explain: '면역글로불린은 몸을 지키는 단백질로, 수치가 낮으면 감염에 취약해집니다.',
      care: '면역 수치·혹 크기 변화 기록, 정해진 날짜에 재검',
      pick: [
        { id: 'atokine', why: '장·피부면역 포스트바이오틱스 — 면역 균형' },
        { id: 'pb_immune', why: '발효 파우더 — 면역·기력 관리' },
        { id: 'multivit', why: '항산화·종합비타민으로 회복기 영양 보충' }
      ],
      alt: ['complivit', 'recovery', 'herbal_stew', 'ic_body', 'lactoenz'] },

    { id: 'eye', ko: '눈', short: '눈', em: '👁️',
      kw: ['눈', '안구', '각막', '결막', '눈물', '백내장', '포도막', '안압'],
      explain: '눈은 한 번 손상되면 되돌리기 어려워, 안약 횟수와 재검 시기를 지키는 것이 중요합니다.',
      care: '안약은 정해진 횟수를 지키고, 재검 전까지 목욕·먼지 노출을 줄여 주세요',
      pick: [
        { id: 'activate', why: '루테인·항산화 — 백내장·눈 노화 관리' },
        { id: 'wc_eye', why: '눈 전용 처방제 — 루테인·CQ10 보충' },
        { id: 'idrops', why: '인공누액·세정 — 눈 자극·건조 완화' }
      ],
      alt: ['mb_vision', 'ic_body', 'multivit'] },

    { id: 'weight', ko: '체중·비만', short: '체중', em: '⚖️',
      kw: ['체중', '비만', '다이어트', '감량', '살', '뚱', '과체중'],
      explain: '감량은 빠르게 빼면 요요가 오기 쉬워, 한 달에 체중의 1~2%가 안전합니다.',
      care: '목표 체중의 1~2%씩만 감량, 2주마다 체중 기록',
      pick: [
        { id: 'of_diet', why: '체중관리 처방식 — 칼로리 밀도를 낮춤' },
        { id: 'm2_weight', why: '웨이트 컨트롤 — 포만감 유지하며 감량' },
        { id: 'diet_joint', why: '다이어트+관절 — 감량 중 관절 부담을 줄임' }
      ],
      alt: ['allercut', 'm3_lowfat', 'jf_diet'] },

    { id: 'pancreas', ko: '췌장·소화효소', short: '췌장', em: '🥣',
      kw: ['췌장', '췌장염', 'cpl', '소화효소', '리파아제', '지방변', '고지혈'],
      explain: '췌장은 지방 자극에 약해, 저지방 유지와 소화효소 보충이 회복을 돕습니다.',
      care: '저지방 유지 + 소화효소는 식사와 함께, 4주 뒤 재검',
      pick: [
        { id: 'pankreatin', why: '췌장 전용 소화효소 — 지방 소화를 직접 도움' },
        { id: 'lf_diet', why: '저지방 처방식으로 췌장 자극을 줄임' },
        { id: 'da_powder', why: '소화효소 파우더 — 식사 때 섞여 편하게' }
      ],
      alt: ['ez8', 'epikl', 'm3_lowfat', 'vet_lowfat'] },

    { id: 'senior', ko: '노령·종합', short: '노령·종합', em: '🐾',
      kw: ['노령', '시니어', '기력', '종합', '비타민', '건강검진', '회복', '수술후'],
      explain: '노령기에는 작은 변화가 큰 신호라, 6개월 검진과 기록이 가장 좋은 관리입니다.',
      care: '6개월마다 건강검진, 기력·체중 변화를 기록해 주세요',
      pick: [
        { id: 'complivit', why: '종합비타민 액상 — 기력·식욕 관리' },
        { id: 'multivit', why: '시니어 종합 — 항산화·관절·심장 함께' },
        { id: 'recovery', why: '회복기 소프트 처방식 — 수술·식욕부진 뒤' }
      ],
      alt: ['herbal_stew', 'vitalic', 'cs_pouch', 'ic_body'] }
  ];

  function byId(id) { return P[id] || null; }
  function tag(id) {
    for (var i = 0; i < TAGS.length; i++) { if (TAGS[i].id === id) return TAGS[i]; }
    return null;
  }
  function pick(tagId, idx) {
    var t = tag(tagId);
    if (!t || !t.pick[idx]) return null;
    var p = t.pick[idx];
    var d = byId(p.id);
    if (!d) return null;
    return { id: p.id, name: d.n, type: d.t, why: p.why };
  }
  function alt(tagId) {
    var t = tag(tagId), out = [];
    if (!t) return out;
    for (var i = 0; i < t.alt.length; i++) {
      var d = byId(t.alt[i]);
      if (d) out.push({ id: t.alt[i], name: d.n, type: d.t });
    }
    return out;
  }

  /* 진료 메모에서 소견 태그 자동 감지 (앞에서부터, 최대 max개) */
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

  /* 임의 제품명으로 구분 추정 (order.html 용도코드와 같은 규칙) */
  function typeOf(name) {
    var s = String(name || '');
    if (/사료|처방식|화식|파우치|캔|키블|습식|건식|스튜|알러컷/.test(s)) return '사료';
    if (/유산균|프로바이오|엠바이옴|락토|신바이오|FMT/i.test(s)) return '유산균';
    if (/영양제|비타민|오메가|관절|콘드로|글루코|칼슘|보조제/.test(s)) return '영양제';
    return '처방제';
  }

  return {
    version: '2026-11-28',
    source: '병원 실제 판매자료(1년 판매내역_261112) 기준',
    TAGS: TAGS,
    byId: byId,
    tag: tag,
    pick: pick,
    alt: alt,
    detect: detect,
    typeOf: typeOf
  };
})();

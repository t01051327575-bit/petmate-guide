/* =========================================================
   굿모닝펫 · NEWCARE / PROMO 공통 생성기 (DOM 없이 동작)
   ---------------------------------------------------------
   · 카톡 문구: 앞뒤 따옴표 없이, 문단마다 빈 줄, 400자 이내
   · 블로그 초안: 제목 + 본문 600~900자 + 해시태그
   · 인스타 카드 3장: 표지 / 신호 / 안내·CTA
   · FAQ 3문항 + FAQPage JSON-LD
   · GQN 형식 퀴즈(문제·정답·힌트·해설 분리) 자동 생성
   ========================================================= */
var G_CARE_CORE = (function () {
  'use strict';

  function count(s) {
    s = String(s == null ? '' : s);
    if (typeof Array.from === 'function') return Array.from(s).length;
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) i++;
      n++;
    }
    return n;
  }
  function cut(s, limit) {
    s = String(s == null ? '' : s);
    if (count(s) <= limit) return s;
    var arr = Array.from(s);
    return arr.slice(0, limit - 1).join('') + '…';
  }

  /* ---------- 카톡 문구 ---------- */
  function buildKakao(sym, opt) {
    opt = opt || {};
    var limit = opt.limit || 400;
    var paras = (sym.kakao || []).slice();

    if (opt.seasonLine) {
      /* 계절 문구는 첫 인사 다음에 붙입니다 */
      if (paras.length > 1) paras[1] = opt.seasonLine + paras[1];
      else paras.unshift(opt.seasonLine);
    }
    var sign = opt.hospital || '굿모닝펫동물병원';
    var phone = opt.phone || '031-715-7119';
    var tail = sign + ' · ' + phone;
    if (phone) paras.push(tail);

    var text = paras.join('\n\n');
    /* 넘치면 가운데 설명 문단부터 덜어냅니다(인사·고지는 남김) */
    var guard = 0;
    while (count(text) > limit && paras.length > 3 && guard < 6) {
      paras.splice(paras.length - 2, 1);
      text = paras.join('\n\n');
      guard++;
    }
    return count(text) > limit ? cut(text, limit) : text;
  }

  /* ---------- 블로그 초안 ---------- */
  function buildBlog(mat, opt) {
    opt = opt || {};
    var season = opt.seasonLine || '';
    var hospital = opt.hospital || '굿모닝펫동물병원';
    var phone = opt.phone || '031-715-7119';

    var title = mat.title;
    var p = [];
    p.push('안녕하세요, ' + hospital + '입니다.');
    p.push(season + mat.hook);
    p.push('아이들은 아프다고 말하지 않습니다. 그래서 보호자님이 발견한 작은 변화가 가장 좋은 단서가 됩니다.');
    p.push('이런 모습이 있다면 한 번쯤 살펴봐 주세요.\n· ' + mat.signs.join('\n· '));
    p.push(mat.why);
    p.push('같은 증상도 원인에 따라 치료가 달라집니다. 그래서 진찰과 필요한 검사로 원인을 먼저 확인합니다.');
    p.push('병원에서는 ' + mat.hospital);
    p.push('집에서는 ' + mat.home);
    if (mat.caution) p.push('꼭 확인해 주세요. ' + mat.caution);

    var body = p.join('\n\n');
    /* 600자에 못 미치면 마무리 문단을 더합니다 */
    if (count(body) < 600) {
      body += '\n\n' + '아이의 평소 모습을 가장 잘 아는 건 보호자님입니다. 조금이라도 달라졌다면 진료 때 함께 이야기해 주세요. 문의는 ' + phone + '로 주시면 됩니다.';
    }
    if (count(body) < 600) {
      body += '\n\n' + '진단과 처방은 진료 후에 정해집니다. 이 글은 병원 안내용이며 치료를 대신하지 않습니다.';
    }
    /* 900자를 넘으면 집에서 할 일 문단을 줄입니다 */
    if (count(body) > 900) {
      var parts = body.split('\n\n');
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].indexOf('집에서는 ') === 0) { parts[i] = '집에서는 ' + mat.home.split('. ')[0] + '.'; break; }
      }
      body = parts.join('\n\n');
    }
    body = cut(body, 900);

    return {
      title: title,
      body: body,
      tags: (mat.hashtags || []).join(' '),
      count: count(body)
    };
  }

  /* ---------- 인스타 카드 3장 ---------- */
  function buildInsta(mat, opt) {
    opt = opt || {};
    var insta = mat.insta || {};
    var hospital = opt.hospital || '굿모닝펫동물병원';
    var phone = opt.phone || '031-715-7119';
    return [
      {
        no: '1',
        kind: '표지',
        title: insta.cover || mat.subject,
        sub: insta.sub || mat.hook,
        foot: hospital
      },
      {
        no: '2',
        kind: '신호',
        title: insta.card2 || '이런 모습 있나요?',
        lines: mat.signs.slice(0, 3),
        foot: hospital
      },
      {
        no: '3',
        kind: '안내',
        title: insta.card3 || mat.subject,
        lines: [insta.cta || '진료로 확인해 보세요', phone],
        foot: hospital
      }
    ];
  }
  function instaText(cards) {
    return cards.map(function (c) {
      var head = '[' + c.no + ' ' + c.kind + ']';
      var lines = c.lines && c.lines.length ? '\n' + c.lines.join('\n') : (c.sub ? '\n' + c.sub : '');
      return head + '\n' + c.title + lines + '\n— ' + c.foot;
    }).join('\n\n');
  }

  /* ---------- FAQ · JSON-LD ---------- */
  function buildFaq(mat) {
    var faq = (mat.faq || []).slice(0, 3);
    return faq;
  }
  function faqText(faq) {
    return faq.map(function (f, i) {
      return 'Q' + (i + 1) + '. ' + f.q + '\nA. ' + f.a;
    }).join('\n\n');
  }
  function buildJsonLd(faq, opt) {
    opt = opt || {};
    var data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(function (f) {
        return {
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        };
      })
    };
    var obj = { faq: data };
    if (opt.publisher || opt.url) {
      obj.provider = {
        '@type': 'VeterinaryCare',
        name: opt.hospital || '굿모닝펫동물병원',
        telephone: opt.phone || '031-715-7119'
      };
      if (opt.url) obj.provider.url = opt.url;
    }
    return JSON.stringify(obj, null, 2);
  }

  /* ---------- GQN 퀴즈 ---------- */
  var FIELD_ASK = [
    { key: '성분', q: '%N의 성분은 무엇인가요?' },
    { key: '효능', q: '%N은(는) 어떤 경우에 쓰나요?' },
    { key: '용법·용량', q: '%N의 투여 방법과 간격은 어떻게 되나요?' },
    { key: '쓸 수 없는 경우', q: '%N을(를) 쓸 수 없는 경우는 어느 때인가요?' },
    { key: '주의', q: '%N을(를) 쓸 때 꼭 기억할 주의사항은?' }
  ];

  function fieldOf(item, key) {
    var f = item.facts || [];
    for (var i = 0; i < f.length; i++) {
      if (f[i].k === key && f[i].v) return f[i].v;
    }
    return '';
  }

  /* 다른 제품의 같은 항목 값을 오답 보기로 씁니다(지어내지 않기 위해서) */
  function distractors(key, selfId, pool) {
    var out = [];
    (pool || []).forEach(function (it) {
      if (it.id === selfId) return;
      var v = fieldOf(it, key);
      if (v && out.indexOf(v) < 0 && out.length < 2) out.push(v.split(' — ')[0].split('(')[0].trim());
    });
    while (out.length < 2) out.push(out.length === 0 ? '해당 없음' : '확인되지 않음');
    return out.slice(0, 2);
  }

  function generateQuiz(item, pool) {
    if (item.quiz && item.quiz.length) return item.quiz.slice();
    var qs = [];
    FIELD_ASK.forEach(function (t) {
      var v = fieldOf(item, t.key);
      if (!v) return;
      qs.push({
        q: t.q.replace('%N', item.name),
        a: v,
        wrong: distractors(t.key, item.id, pool),
        hint: t.key + ' 항목을 다시 보세요',
        why: '제품·시술 자료의 ' + t.key + ' 항목을 그대로 확인한 내용입니다.'
      });
    });
    var symLabel = (item.symptoms && item.symptoms[0]) || '';
    if (item.staff) {
      qs.push({
        q: '보호자가 "' + (symLabel || '아이가 불편해 보여요') + '"라고 할 때, 직원이 그대로 읽는 첫 문장은?',
        a: item.staff.split('. ')[0] + '.',
        wrong: ['나이 때문이라 어쩔 수 없다고 말한다', '정확한 진단명을 먼저 단정해서 말한다'],
        hint: '증상을 확인하는 질문으로 시작합니다',
        why: '진단을 단정하지 않고, 보호자가 본 모습을 확인하는 질문이 먼저입니다.'
      });
    }
    if (item.notes && item.notes.length) {
      qs.push({
        q: item.name + ' 설명에서 지켜야 할 원칙은?',
        a: item.notes[0],
        wrong: ['효과를 좋게 보이도록 수치를 만들어 말한다', '보호자에게 제품 이름만 알려 주고 끝낸다'],
        hint: '근거 없는 수치는 만들지 않습니다',
        why: '설명은 확인된 근거 안에서만 하고, 진단·처방을 대신하지 않습니다.'
      });
    }
    return qs.slice(0, 7);
  }

  /* GQN 문제 세트 — 정답은 빼고, 보기 순서는 문제마다 다르게 */
  function quizQuestionsText(quiz, topic) {
    return (topic || '🍀 신제품') + ' 퀴즈\n\n' + quiz.map(function (q, i) {
      var opts = [q.a].concat(q.wrong || []).slice(0, 3);
      var h = 0, s = q.q;
      for (var k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) | 0;
      var off = Math.abs(h) % opts.length;
      opts = opts.slice(off).concat(opts.slice(0, off));
      return 'Q' + (i + 1) + '. ' + q.q + '\n' + opts.map(function (o, j) { return (j + 1) + ') ' + o; }).join('\n') + (q.hint ? '\n힌트: ' + q.hint : '');
    }).join('\n\n') + '\n\n정답은 실장님께 보내 주세요!';
  }
  /* GQN 정답 세트 — 실장님 보관용 */
  function quizAnswersText(quiz) {
    return quiz.map(function (q, i) {
      return '[Q' + (i + 1) + '] ' + q.q + '\n[정답] ' + q.a + '\n[해설] ' + (q.why || '');
    }).join('\n\n');
  }

  return {
    count: count,
    cut: cut,
    buildKakao: buildKakao,
    buildBlog: buildBlog,
    buildInsta: buildInsta,
    instaText: instaText,
    buildFaq: buildFaq,
    faqText: faqText,
    buildJsonLd: buildJsonLd,
    generateQuiz: generateQuiz,
    quizQuestionsText: quizQuestionsText,
    quizAnswersText: quizAnswersText,
    fieldOf: fieldOf
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = G_CARE_CORE;
}

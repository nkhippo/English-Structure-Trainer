/** Framing expression bank for phrase practice (B2 target: 65 items). */

export const PHRASE_LEVELS = [
  {
    id: 'a12',
    label: 'A1 & A2',
    subtitle: '基礎フレーズ',
    description: '複合前置詞・否定副詞句（A2）— 全12語のバンク',
  },
  {
    id: 'b1',
    label: 'B1',
    subtitle: '中級フレーズ',
    description: '複合前置詞・接続副詞・否定副詞句（B1）— 全27語のバンク',
  },
  {
    id: 'b2',
    label: 'B2',
    subtitle: '上級フレーズ',
    description: '複合前置詞・接続副詞・否定副詞句（B2）— 全26語のバンク',
  },
];

const CATEGORY_LABELS = {
  compound_prep: '複合前置詞',
  conjunctive_adv: '接続副詞',
  negative_adv: '否定副詞句',
};

export const FRAMING_EXPRESSIONS = [
  // ── 複合前置詞 A2 ──
  { expr: 'according to', cefr: 'A2', category: 'compound_prep', jpHint: '〜によれば', note: '情報源・根拠を示す。文頭で使うことが多い' },
  { expr: 'because of', cefr: 'A2', category: 'compound_prep', jpHint: '〜のせいで', note: '原因・理由。because + S+V とは構造が異なる（後ろに名詞）' },
  { expr: 'instead of', cefr: 'A2', category: 'compound_prep', jpHint: '〜の代わりに', note: '置き換えを示す。後ろに名詞・動名詞' },
  { expr: 'in front of', cefr: 'A2', category: 'compound_prep', jpHint: '〜の前に', note: '場所を示す。3語で1つの前置詞' },
  { expr: 'out of', cefr: 'A2', category: 'compound_prep', jpHint: '〜の外へ/〜から', note: '起点・素材・理由など多義' },
  { expr: 'due to', cefr: 'A2', category: 'compound_prep', jpHint: '〜のせいで', note: 'because of よりフォーマル。ビジネス文書で頻出' },
  { expr: 'as for', cefr: 'A2', category: 'compound_prep', jpHint: '〜については', note: '話題を切り出す。文頭専用' },
  { expr: 'next to', cefr: 'A2', category: 'compound_prep', jpHint: '〜の隣に', note: '位置を示す' },
  // ── 複合前置詞 B1 ──
  { expr: 'in spite of', cefr: 'B1', category: 'compound_prep', jpHint: '〜にもかかわらず', note: '譲歩を示す。despite と同義・同格' },
  { expr: 'thanks to', cefr: 'B1', category: 'compound_prep', jpHint: '〜のおかげで', note: '肯定的な原因・理由。because of と違いポジティブな文脈' },
  { expr: 'apart from', cefr: 'B1', category: 'compound_prep', jpHint: '〜を除いて', note: '例外・除外を示す' },
  { expr: 'along with', cefr: 'B1', category: 'compound_prep', jpHint: '〜とともに', note: '同伴・付随を示す' },
  { expr: 'in addition to', cefr: 'B1', category: 'compound_prep', jpHint: '〜に加えて', note: '追加情報を導く。後ろに名詞・動名詞' },
  { expr: 'as well as', cefr: 'B1', category: 'compound_prep', jpHint: '〜と同様に', note: '追加・並列を示す' },
  { expr: 'regardless of', cefr: 'B1', category: 'compound_prep', jpHint: '〜に関わらず', note: '条件を問わないことを示す' },
  { expr: 'in terms of', cefr: 'B1', category: 'compound_prep', jpHint: '〜の観点から', note: '評価・比較の軸を示す' },
  { expr: 'in case of', cefr: 'B1', category: 'compound_prep', jpHint: '〜の場合に', note: '条件・仮定を示す' },
  { expr: 'on top of', cefr: 'B1', category: 'compound_prep', jpHint: '〜に加えて', note: 'in addition to と同義だがよりカジュアル' },
  { expr: 'together with', cefr: 'B1', category: 'compound_prep', jpHint: '〜とともに', note: 'along with と同義' },
  { expr: 'on account of', cefr: 'B1', category: 'compound_prep', jpHint: '〜のせいで', note: 'because of の文語的表現' },
  // ── 複合前置詞 B2 ──
  { expr: 'with regard to', cefr: 'B2', category: 'compound_prep', jpHint: '〜に関して', note: 'フォーマルなビジネス文書で頻出' },
  { expr: 'as a result of', cefr: 'B2', category: 'compound_prep', jpHint: '〜の結果として', note: '接続副詞の as a result とは別物（後ろに名詞が来る）' },
  { expr: 'in view of', cefr: 'B2', category: 'compound_prep', jpHint: '〜を考慮して', note: '状況・事情を踏まえた判断に使う' },
  { expr: 'by means of', cefr: 'B2', category: 'compound_prep', jpHint: '〜によって', note: '手段・方法を示す' },
  { expr: 'prior to', cefr: 'B2', category: 'compound_prep', jpHint: '〜の前に', note: 'before のフォーマル版' },
  { expr: 'in contrast to', cefr: 'B2', category: 'compound_prep', jpHint: '〜と対比して', note: '対照を示す。フォーマルな文章で使う' },
  { expr: 'in light of', cefr: 'B2', category: 'compound_prep', jpHint: '〜を踏まえて', note: '根拠・背景を踏まえた判断' },
  { expr: 'as opposed to', cefr: 'B2', category: 'compound_prep', jpHint: '〜と対照的に', note: '対比を強調する' },
  { expr: 'on behalf of', cefr: 'B2', category: 'compound_prep', jpHint: '〜を代表して', note: '代表・代理を示す。フォーマルなスピーチで頻出' },
  { expr: 'in the event of', cefr: 'B2', category: 'compound_prep', jpHint: '〜が起きた場合に', note: '条件・仮定を示すフォーマル表現' },
  // ── 接続副詞 B1 ──
  { expr: 'however', cefr: 'B1', category: 'conjunctive_adv', jpHint: 'しかしながら', note: '逆接。直前はピリオドが必要（comma splice 禁止）' },
  { expr: 'therefore', cefr: 'B1', category: 'conjunctive_adv', jpHint: 'したがって', note: '帰結' },
  { expr: 'moreover', cefr: 'B1', category: 'conjunctive_adv', jpHint: 'さらに', note: '追加（より良い情報）' },
  { expr: 'furthermore', cefr: 'B1', category: 'conjunctive_adv', jpHint: 'さらに（書き言葉）', note: '追加（フォーマル）' },
  { expr: 'in addition', cefr: 'B1', category: 'conjunctive_adv', jpHint: 'それに加えて', note: '追加' },
  { expr: 'as a result', cefr: 'B1', category: 'conjunctive_adv', jpHint: 'その結果', note: '結果。複合前置詞 as a result of とは別物' },
  { expr: 'on the other hand', cefr: 'B1', category: 'conjunctive_adv', jpHint: '一方で', note: '対比' },
  { expr: 'for example', cefr: 'B1', category: 'conjunctive_adv', jpHint: 'たとえば', note: '例示' },
  { expr: 'in conclusion', cefr: 'B1', category: 'conjunctive_adv', jpHint: '結論として', note: '締め・まとめ' },
  { expr: 'nevertheless', cefr: 'B1', category: 'conjunctive_adv', jpHint: 'それにもかかわらず', note: '譲歩の逆接（however より強い意志のニュアンス）' },
  // ── 接続副詞 B2 ──
  { expr: 'consequently', cefr: 'B2', category: 'conjunctive_adv', jpHint: 'その結果', note: '結果（as a result よりフォーマル）' },
  { expr: 'hence', cefr: 'B2', category: 'conjunctive_adv', jpHint: 'したがって', note: '帰結（論理的・数学的文脈でも使う）' },
  { expr: 'thus', cefr: 'B2', category: 'conjunctive_adv', jpHint: 'したがって', note: '帰結（論文・レポートで頻出）' },
  { expr: 'accordingly', cefr: 'B2', category: 'conjunctive_adv', jpHint: 'それゆえに', note: '帰結' },
  { expr: 'likewise', cefr: 'B2', category: 'conjunctive_adv', jpHint: '同様に', note: '類似' },
  { expr: 'similarly', cefr: 'B2', category: 'conjunctive_adv', jpHint: '同様に', note: '類似' },
  { expr: 'alternatively', cefr: 'B2', category: 'conjunctive_adv', jpHint: 'あるいは', note: '代替案' },
  { expr: 'in other words', cefr: 'B2', category: 'conjunctive_adv', jpHint: '言い換えれば', note: '言い換え・補足' },
  { expr: 'indeed', cefr: 'B2', category: 'conjunctive_adv', jpHint: '実際に', note: '強調・確認' },
  { expr: 'in short', cefr: 'B2', category: 'conjunctive_adv', jpHint: '要するに', note: '要約' },
  { expr: 'by contrast', cefr: 'B2', category: 'conjunctive_adv', jpHint: 'それとは対照的に', note: '対比' },
  { expr: 'to sum up', cefr: 'B2', category: 'conjunctive_adv', jpHint: 'まとめると', note: '要約・締め' },
  // ── 否定副詞句 A2 ──
  { expr: 'no longer', cefr: 'A2', category: 'negative_adv', jpHint: 'もはや〜ない', note: '動詞の直前に置く。文頭に置くと倒置が発生' },
  { expr: 'not yet', cefr: 'A2', category: 'negative_adv', jpHint: 'まだ〜ない', note: 'be動詞・助動詞の後ろに置く' },
  { expr: 'not at all', cefr: 'A2', category: 'negative_adv', jpHint: '全く〜ない', note: '強調否定。be動詞の後ろまたは文末' },
  { expr: 'not even', cefr: 'A2', category: 'negative_adv', jpHint: '〜さえない', note: '強調否定。強調したい語の直前' },
  // ── 否定副詞句 B1 ──
  { expr: 'no more', cefr: 'B1', category: 'negative_adv', jpHint: 'それ以上〜ない / もはや〜ない', note: 'no longer と同義。文頭で倒置あり' },
  { expr: 'not always', cefr: 'B1', category: 'negative_adv', jpHint: '必ずしも〜ない', note: '部分否定。always / every を否定するときに使う' },
  { expr: 'not necessarily', cefr: 'B1', category: 'negative_adv', jpHint: '必ずしも〜ではない', note: '部分否定。「〜とは限らない」' },
  { expr: 'hardly ever', cefr: 'B1', category: 'negative_adv', jpHint: 'めったに〜ない', note: 'seldom と同義。動詞の直前に置く' },
  { expr: 'never again', cefr: 'B1', category: 'negative_adv', jpHint: '二度と〜ない', note: '強調否定。文頭で倒置あり' },
  // ── 否定副詞句 B2 ──
  { expr: 'by no means', cefr: 'B2', category: 'negative_adv', jpHint: '決して〜ない', note: 'not at all のフォーマル版。文頭で倒置あり' },
  { expr: 'in no way', cefr: 'B2', category: 'negative_adv', jpHint: '決して〜ない', note: 'by no means と同義。文頭で倒置あり' },
  { expr: 'not in the least', cefr: 'B2', category: 'negative_adv', jpHint: '少しも〜ない', note: 'not at all の強調形' },
  { expr: 'far from', cefr: 'B2', category: 'negative_adv', jpHint: '〜どころか', note: '後ろに名詞・形容詞・動名詞が来る' },
];

const LEVEL_CEFR = {
  a12: 'A2',
  b1: 'B1',
  b2: 'B2',
};

export function getLevelConfig(levelId) {
  return PHRASE_LEVELS.find((l) => l.id === levelId) ?? PHRASE_LEVELS[0];
}

export function getExpressionsForLevel(levelId) {
  const cefr = LEVEL_CEFR[levelId];
  if (!cefr) return [];
  return FRAMING_EXPRESSIONS.filter((e) => e.cefr === cefr);
}

export function categoryLabel(category) {
  return CATEGORY_LABELS[category] ?? category;
}

/** Per-question probability that the correct answer is outside the tab bank. */
export const CROSS_LEVEL_RATIO = 0.2;

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandomFrom(pool, count, exclude = new Set()) {
  const available = pool.filter((e) => !exclude.has(e.expr));
  const copy = [...available];
  shuffleInPlace(copy);
  return copy.slice(0, Math.min(count, copy.length));
}

export function pickRandomExpressions(levelId, count) {
  return pickRandomFrom(getExpressionsForLevel(levelId), count);
}

export function getExpressionsOutsideLevel(levelId) {
  const levelExprs = new Set(getExpressionsForLevel(levelId).map((e) => e.expr));
  return FRAMING_EXPRESSIONS.filter((e) => !levelExprs.has(e.expr));
}

/**
 * Plan a quiz session: ~20% of slots use expressions outside the tab bank.
 */
export function planPhraseSession(levelId, count) {
  const levelBank = getExpressionsForLevel(levelId);
  const outsideBank = getExpressionsOutsideLevel(levelId);
  const used = new Set();
  const targets = [];

  for (let i = 0; i < count; i++) {
    const wantCross = Math.random() < CROSS_LEVEL_RATIO && outsideBank.length > 0;
    if (wantCross) {
      const crossPicks = pickRandomFrom(outsideBank, 1, used);
      if (crossPicks.length > 0) {
        used.add(crossPicks[0].expr);
        targets.push({ ...crossPicks[0], isCrossLevel: true });
        continue;
      }
    }
    const inPicks = pickRandomFrom(levelBank, 1, used);
    const pool = inPicks.length > 0 ? inPicks : pickRandomFrom(levelBank, 1);
    const picked = pool[0];
    used.add(picked.expr);
    targets.push({ ...picked, isCrossLevel: false });
  }

  return shuffleInPlace(targets);
}

const EXPR_LOOKUP = new Map(FRAMING_EXPRESSIONS.map((e) => [e.expr.toLowerCase(), e]));

/** Pairs that differ mainly in form, not semantics — unsuitable as MCQ distractors. */
const FORM_SIMILAR_PAIRS = [
  ['as a result', 'as a result of'],
  ['in addition', 'in addition to'],
  ['because', 'because of'],
];

/**
 * True when two phrases are too similar in spelling/shape to be fair distractors.
 */
export function isFormSimilarPhrase(a, b) {
  const na = a.toLowerCase().trim();
  const nb = b.toLowerCase().trim();
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;

  for (const [x, y] of FORM_SIMILAR_PAIRS) {
    if ((na === x && nb === y) || (na === y && nb === x)) return true;
  }

  const wa = na.split(/\s+/);
  const wb = nb.split(/\s+/);
  if (wa[0] === wb[0] && wa[0].length > 3 && wa.length <= 3 && wb.length <= 3) {
    return true;
  }

  const setB = new Set(wb);
  const overlap = wa.filter((w) => setB.has(w)).length;
  const minLen = Math.min(wa.length, wb.length);
  if (overlap >= minLen && minLen >= 2) return true;

  return false;
}

function resolveBankExpr(raw) {
  const key = String(raw || '').trim().toLowerCase();
  return EXPR_LOOKUP.get(key)?.expr ?? null;
}

function pickSemanticDistractors(correctExpr, levelId, count, exclude = new Set()) {
  const correctKey = correctExpr.toLowerCase();
  const correctEntry = EXPR_LOOKUP.get(correctKey);
  const used = new Set([...exclude, correctKey]);
  const picked = [];

  const pools = [
    FRAMING_EXPRESSIONS.filter((e) => e.category === correctEntry?.category),
    FRAMING_EXPRESSIONS,
  ];

  for (const pool of pools) {
    for (const e of shuffleInPlace([...pool])) {
      if (picked.length >= count) break;
      const key = e.expr.toLowerCase();
      if (used.has(key)) continue;
      if (isFormSimilarPhrase(correctExpr, e.expr)) continue;
      if (picked.some((p) => isFormSimilarPhrase(p, e.expr))) continue;
      picked.push(e.expr);
      used.add(key);
    }
    if (picked.length >= count) break;
  }

  return picked;
}

/**
 * Build 3 shuffled choices using API semantic distractors with validated fallbacks.
 */
export function buildPhraseChoices(correctExpr, levelId, { apiDistractors = [], isCrossLevel = false } = {}) {
  const correct = correctExpr.trim();
  const correctKey = correct.toLowerCase();
  const levelBank = getExpressionsForLevel(levelId);
  const levelKeys = new Set(levelBank.map((e) => e.expr.toLowerCase()));
  const used = new Set([correctKey]);

  let distractors = (apiDistractors || [])
    .map(resolveBankExpr)
    .filter(Boolean)
    .filter((d) => d.toLowerCase() !== correctKey)
    .filter((d) => !isFormSimilarPhrase(correct, d));

  distractors = [...new Map(distractors.map((d) => [d.toLowerCase(), d])).values()];

  if (isCrossLevel && !distractors.some((d) => levelKeys.has(d.toLowerCase()))) {
    const tabPick = pickSemanticDistractors(correct, levelId, 1, used);
    if (tabPick[0]) {
      distractors.unshift(tabPick[0]);
      used.add(tabPick[0].toLowerCase());
    }
  }

  distractors.forEach((d) => used.add(d.toLowerCase()));

  if (distractors.length < 2) {
    const need = 2 - distractors.length;
    const fallback = pickSemanticDistractors(correct, levelId, need, used);
    distractors = [...distractors, ...fallback];
  }

  distractors = distractors.slice(0, 2);
  if (distractors.length < 2) {
    const extra = pickRandomFrom(
      FRAMING_EXPRESSIONS.filter((e) => !used.has(e.expr.toLowerCase())),
      2 - distractors.length,
    ).map((e) => e.expr);
    distractors = [...distractors, ...extra];
  }

  return shuffleInPlace([correct, ...distractors.slice(0, 2)]);
}

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
  { expr: 'no longer', cefr: 'A2', category: 'negative_adv', jpHint: 'もはや〜ない', note: '動詞の直前に置く。文頭に置くと倒置が発生（STEP 7・第27/28章）' },
  { expr: 'not yet', cefr: 'A2', category: 'negative_adv', jpHint: 'まだ〜ない', note: 'be動詞・助動詞の後ろに置く' },
  { expr: 'not at all', cefr: 'A2', category: 'negative_adv', jpHint: '全く〜ない', note: '強調否定。be動詞の後ろまたは文末' },
  { expr: 'not even', cefr: 'A2', category: 'negative_adv', jpHint: '〜さえない', note: '強調否定。強調したい語の直前' },
  // ── 否定副詞句 B1 ──
  { expr: 'no more', cefr: 'B1', category: 'negative_adv', jpHint: 'それ以上〜ない / もはや〜ない', note: 'no longer と同義。文頭で倒置あり（STEP 7・第27章）' },
  { expr: 'not always', cefr: 'B1', category: 'negative_adv', jpHint: '必ずしも〜ない', note: '部分否定。always / every を否定するときに使う' },
  { expr: 'not necessarily', cefr: 'B1', category: 'negative_adv', jpHint: '必ずしも〜ではない', note: '部分否定。「〜とは限らない」' },
  { expr: 'hardly ever', cefr: 'B1', category: 'negative_adv', jpHint: 'めったに〜ない', note: 'seldom と同義。動詞の直前に置く' },
  { expr: 'never again', cefr: 'B1', category: 'negative_adv', jpHint: '二度と〜ない', note: '強調否定。文頭で倒置あり（STEP 7・第27章）' },
  // ── 否定副詞句 B2 ──
  { expr: 'by no means', cefr: 'B2', category: 'negative_adv', jpHint: '決して〜ない', note: 'not at all のフォーマル版。文頭で倒置あり（STEP 7・第27/28章）' },
  { expr: 'in no way', cefr: 'B2', category: 'negative_adv', jpHint: '決して〜ない', note: 'by no means と同義。文頭で倒置あり（STEP 7・第27章）' },
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

/**
 * Meaning-confusion clusters. Members are plausible 3-choice distractors for each other.
 * Includes bank-external phrases learners often mix up (e.g. about vs as for).
 */
const SEMANTIC_NEIGHBOR_GROUPS = [
  ['as for', 'with regard to', 'in terms of', 'about', 'regarding', 'instead of'],
  ['instead of', 'as opposed to', 'rather than'],
  ['because of', 'due to', 'on account of', 'thanks to', 'since'],
  ['according to', 'based on'],
  ['in spite of', 'regardless of', 'despite', 'nevertheless', 'however'],
  ['in addition to', 'as well as', 'on top of', 'together with', 'along with', 'moreover', 'furthermore', 'in addition'],
  ['apart from', 'except for'],
  ['in front of', 'next to', 'before'],
  ['out of', 'from'],
  ['in case of', 'in the event of', 'if'],
  ['in view of', 'in light of', 'considering'],
  ['in contrast to', 'as opposed to', 'on the other hand', 'by contrast'],
  ['as a result of', 'because of', 'due to'],
  ['on behalf of', 'for'],
  ['by means of', 'through'],
  ['prior to', 'before'],
  ['however', 'nevertheless', 'on the other hand', 'but'],
  ['therefore', 'consequently', 'as a result', 'hence', 'thus', 'accordingly', 'so'],
  ['moreover', 'furthermore', 'in addition', 'additionally'],
  ['in conclusion', 'to sum up', 'in short', 'finally'],
  ['for example', 'for instance'],
  ['in other words', 'that is'],
  ['similarly', 'likewise', 'also'],
  ['alternatively', 'or', 'instead'],
  ['indeed', 'in fact'],
  ['no longer', 'no more', 'not anymore'],
  ['not yet', 'still not'],
  ['not at all', 'by no means', 'in no way', 'not in the least'],
  ['not even', 'not at all'],
  ['not necessarily', 'not always'],
  ['hardly ever', 'seldom', 'rarely'],
  ['never again', 'no longer'],
  ['far from', 'not at all'],
];

const NEIGHBOR_LOOKUP = new Map();
for (const group of SEMANTIC_NEIGHBOR_GROUPS) {
  for (const expr of group) {
    const key = expr.toLowerCase();
    const others = group.filter((e) => e.toLowerCase() !== key);
    const existing = NEIGHBOR_LOOKUP.get(key) ?? [];
    NEIGHBOR_LOOKUP.set(key, [...new Set([...existing, ...others].map((e) => e.toLowerCase()))]);
  }
}

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

function getSemanticNeighbors(correctExpr) {
  return NEIGHBOR_LOOKUP.get(correctExpr.toLowerCase()) ?? [];
}

function normalizeChoicePhrase(raw, correct) {
  const trimmed = String(raw || '').trim();
  if (!trimmed || trimmed.toLowerCase() === correct.toLowerCase()) return null;
  if (isFormSimilarPhrase(correct, trimmed)) return null;
  const bank = resolveBankExpr(trimmed);
  if (bank) return bank;
  if (/^[a-z][a-z\s'-]{0,38}[a-z]$/i.test(trimmed) && trimmed.split(/\s+/).length <= 5) {
    return trimmed;
  }
  return null;
}

function isCompatibleDistractor(correct, distractor) {
  const correctEntry = EXPR_LOOKUP.get(correct.toLowerCase());
  const distractorEntry = EXPR_LOOKUP.get(distractor.toLowerCase());

  if (distractorEntry && correctEntry && distractorEntry.category !== correctEntry.category) {
    return false;
  }

  const neighbors = getSemanticNeighbors(correct);
  if (neighbors.includes(distractor.toLowerCase())) return true;

  if (distractorEntry && correctEntry && distractorEntry.category === correctEntry.category) {
    return neighbors.length === 0;
  }

  return !distractorEntry && neighbors.includes(distractor.toLowerCase());
}

function pickSemanticDistractors(correctExpr, count, exclude = new Set()) {
  const correctKey = correctExpr.toLowerCase();
  const used = new Set([...exclude, correctKey]);
  const picked = [];

  const neighborKeys = getSemanticNeighbors(correctExpr);
  const neighborPool = neighborKeys
    .map((k) => resolveBankExpr(k) ?? k)
    .filter((d) => d && !used.has(d.toLowerCase()) && isCompatibleDistractor(correctExpr, d));

  for (const d of shuffleInPlace([...neighborPool])) {
    if (picked.length >= count) break;
    if (picked.some((p) => isFormSimilarPhrase(p, d))) continue;
    picked.push(d);
    used.add(d.toLowerCase());
  }

  if (picked.length < count) {
    const correctEntry = EXPR_LOOKUP.get(correctKey);
    const categoryPool = FRAMING_EXPRESSIONS.filter(
      (e) => e.category === correctEntry?.category && !used.has(e.expr.toLowerCase()),
    );
    for (const e of shuffleInPlace([...categoryPool])) {
      if (picked.length >= count) break;
      if (isFormSimilarPhrase(correctExpr, e.expr)) continue;
      if (picked.some((p) => isFormSimilarPhrase(p, e.expr))) continue;
      picked.push(e.expr);
      used.add(e.expr.toLowerCase());
    }
  }

  return picked;
}

function pickTabBankDistractor(correctExpr, levelId, exclude) {
  const levelKeys = new Set(getExpressionsForLevel(levelId).map((e) => e.expr.toLowerCase()));
  const neighbors = getSemanticNeighbors(correctExpr)
    .filter((k) => levelKeys.has(k))
    .map((k) => resolveBankExpr(k))
    .filter((d) => d && !exclude.has(d.toLowerCase()) && isCompatibleDistractor(correctExpr, d));
  if (neighbors.length > 0) {
    return neighbors[Math.floor(Math.random() * neighbors.length)];
  }
  const tabPool = getExpressionsForLevel(levelId).filter(
    (e) => !exclude.has(e.expr.toLowerCase()) && isCompatibleDistractor(correctExpr, e.expr),
  );
  return pickRandomFrom(tabPool, 1)[0]?.expr ?? null;
}

/**
 * Build 3 shuffled choices. Wrong options match confusables (meaning-based), not random bank words.
 */
export function buildPhraseChoices(correctExpr, levelId, { apiDistractors = [], confusables = [], isCrossLevel = false } = {}) {
  const correct = correctExpr.trim();
  const correctKey = correct.toLowerCase();
  const levelKeys = new Set(getExpressionsForLevel(levelId).map((e) => e.expr.toLowerCase()));
  const used = new Set([correctKey]);
  const explainedKeys = new Set(
    confusables.filter((c) => c?.phrase && c?.why).map((c) => c.phrase.toLowerCase()),
  );

  const explainedDistractors = [];
  for (const raw of [...confusables.map((c) => c.phrase), ...apiDistractors]) {
    const d = normalizeChoicePhrase(raw, correct);
    if (!d || used.has(d.toLowerCase())) continue;
    if (!explainedKeys.has(d.toLowerCase())) continue;
    if (!isCompatibleDistractor(correct, d)) continue;
    explainedDistractors.push(d);
    used.add(d.toLowerCase());
    if (explainedDistractors.length >= 2) break;
  }

  if (explainedDistractors.length >= 2) {
    let final = explainedDistractors.slice(0, 2);
    if (isCrossLevel && !final.some((d) => levelKeys.has(d.toLowerCase()))) {
      const tabPick = pickTabBankDistractor(correct, levelId, used);
      if (tabPick) {
        final = [tabPick, ...final.filter((d) => d.toLowerCase() !== tabPick.toLowerCase())].slice(0, 2);
      }
    }
    return shuffleInPlace([correct, ...final]);
  }

  const candidatePhrases = [
    ...confusables.map((c) => c.phrase),
    ...apiDistractors,
  ];

  let distractors = [];
  for (const raw of candidatePhrases) {
    const d = normalizeChoicePhrase(raw, correct);
    if (!d || used.has(d.toLowerCase())) continue;
    if (!isCompatibleDistractor(correct, d)) continue;
    distractors.push(d);
    used.add(d.toLowerCase());
    if (distractors.length >= 2) break;
  }

  distractors = [...new Map(distractors.map((d) => [d.toLowerCase(), d])).values()];

  if (distractors.length < 2) {
    const fallback = pickSemanticDistractors(correct, 2 - distractors.length, used);
    distractors = [...distractors, ...fallback];
    fallback.forEach((d) => used.add(d.toLowerCase()));
  }

  if (isCrossLevel && !distractors.some((d) => levelKeys.has(d.toLowerCase()))) {
    const tabPick = pickTabBankDistractor(correct, levelId, used);
    if (tabPick) {
      distractors = [tabPick, ...distractors.filter((d) => d.toLowerCase() !== tabPick.toLowerCase())];
      distractors = distractors.slice(0, 2);
    }
  }

  distractors = distractors.slice(0, 2);
  if (distractors.length < 2) {
    const extra = pickSemanticDistractors(correct, 2 - distractors.length, used);
    distractors = [...distractors, ...extra].slice(0, 2);
  }

  return shuffleInPlace([correct, ...distractors]);
}

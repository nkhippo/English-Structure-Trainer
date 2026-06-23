import { STEP7_THREADS } from './step7.js';

/** @typedef {'core'|'peripheral'} ErrorTier */

/**
 * Error taxonomy — core = structural (drives follow-up); peripheral = surface (excluded from follow-up).
 * @type {{ code: string, tier: ErrorTier, label: string, hint: string, steps: number[] }[]}
 */
export const ERROR_TAXONOMY = [
  { code: 'skeleton', tier: 'core', label: '骨格', hint: 'S+V(+O/C) の選択・語順', steps: [3] },
  { code: 'verbInfo', tier: 'core', label: '動詞情報', hint: '時制×相×態×法/助動詞', steps: [3] },
  { code: 'role', tier: 'core', label: '役割', hint: 'X/Y/Z のどれか・どの形で実現するか', steps: [4] },
  { code: 'attachment', tier: 'core', label: '係り受け', hint: '前置/後置・かかる先', steps: [4, 5] },
  { code: 'nesting', tier: 'core', label: 'ネスト', hint: '等位/従属・節の入れ子', steps: [6] },
  { code: 'advanced', tier: 'core', label: '発展操作', hint: '比較・仮定法・倒置/強調・否定・話法・省略', steps: [7] },
  { code: 'functionWord', tier: 'peripheral', label: '機能語', hint: '冠詞・前置詞の語選択', steps: [3, 4, 5, 6, 7] },
  { code: 'lexical', tier: 'peripheral', label: '語彙・表層', hint: 'スペル・語彙・表現選択', steps: [3, 4, 5, 6, 7] },
];

export const ERROR_TAG_CODES = ERROR_TAXONOMY.map((t) => t.code);
export const CORE_ERROR_CODES = ERROR_TAXONOMY.filter((t) => t.tier === 'core').map((t) => t.code);

/** Reusable principles per STEP — referenced at end of nuance. */
export const STEP_ESSENCE = {
  3: '疑問=2操作（糸2:空所を文頭へ / 糸1:助動詞を前に）。否定=同じ助動詞に not。**疑問と否定は対称**。',
  4: '**形が同じでも、位置と働きで役割(X/Y/Z)が決まる**（役割≠形）。to do は X/Y/Z すべて、-ing は X(動名詞) か Y/Z(分詞)、前置詞句は Y か Z。',
  5: '後置修飾＝核を先に・説明を後ろに（head-initial）。**関係詞節＝空所(gap)あり／同格節＝完成形(gapなし)**。what は先行詞内蔵。',
  6: '節も小さな文（内部に X+V）→再帰。等位(対等) vs 従属(主従)。従属節の役割は X(名詞節)/Y(関係詞節)/Z(副詞節) でMECE。',
  7: `糸1=${STEP7_THREADS.thread1.title.split('：')[0]}（助動詞前置）／糸2=${STEP7_THREADS.thread2.title.split('：')[0]}（空所＋移動）。**糸は疑問・倒置・強調・仮定法倒置を束ねるが、比較・省略・話法はどちらにも乗らない**＝糸は部分的統一原理であって網羅ではない。`,
};

/** Default interrogative question targets for new sets (Steps 3–7). */
export const DEFAULT_QUESTION_TARGETS = {
  3: 3,
  4: 2,
  5: 1,
  6: 2,
  7: 1,
};

/**
 * Per-STEP policy for interrogative sentence practice (production).
 * @type {Record<number, {
 *   allowedTypes: string[],
 *   preferred: string,
 *   whatToQuestion: string,
 *   maxNatural: number | string,
 *   notes?: string,
 * }>}
 */
export const STEP_QUESTION_POLICY = {
  3: {
    allowedTypes: ['yesno', 'wh'],
    preferred: 'mix',
    whatToQuestion: '動詞情報そのもの（時制・相・態・助動詞）。否定疑問可',
    maxNatural: 7,
    notes: '主語wh疑問（"Who broke it?"）は助動詞前置も移動も起きず平叙文に見える——時々混ぜ、学習者が糸1/糸2の実感を持てるようにする',
  },
  4: {
    allowedTypes: ['yesno', 'wh'],
    preferred: 'wh',
    whatToQuestion: 'wh が準動詞/前置詞句スロットを尋ねる（例：What do you want to do?）',
    maxNatural: 5,
  },
  5: {
    allowedTypes: ['yesno'],
    preferred: 'yesno',
    whatToQuestion: '関係詞節(Y)を内包したまま主骨格を疑問化（例：その車を直した男はまだここにいますか）',
    maxNatural: 3,
  },
  6: {
    allowedTypes: ['yesno', 'wh', 'indirect'],
    preferred: 'indirect',
    whatToQuestion: 'wh/if 節を名詞節Xとして埋め込む。直接疑問との対比も可',
    maxNatural: 5,
    notes: '主語wh疑問（"Who broke it?"）は助動詞前置も移動も起きず平叙文に見える——時々混ぜ、間接疑問との対比で糸1/糸2の実感を持てるようにする',
  },
  7: {
    allowedTypes: ['operationTag'],
    preferred: '—',
    whatToQuestion: '糸の二重適用を回避（倒置=糸1のときは wh=糸2、強調cleft=糸2のときは Yes/No=糸1）。operationTag「疑問」の問はこの方針に従う',
    maxNatural: 2,
  },
};

const QUESTION_TYPE_LABELS = {
  yesno: 'Yes/No疑問（糸1：助動詞前置）',
  wh: 'wh疑問（糸2：空所を文頭へ）',
  indirect: '間接疑問（wh/if 節を名詞節Xとして埋め込む）',
  operationTag: 'operationTag「疑問」に従う（Step 7）',
};

export function getDefaultQuestionTarget(step) {
  return DEFAULT_QUESTION_TARGETS[step] ?? 0;
}

export function getEffectiveQuestionTarget(step, questionTarget) {
  if (!questionTarget || questionTarget <= 0) return 0;
  const policy = STEP_QUESTION_POLICY[step];
  const maxNatural = policy && typeof policy.maxNatural === 'number' ? policy.maxNatural : 7;
  return Math.min(questionTarget, maxNatural);
}

export function getQuestionPolicyForStep(step) {
  return STEP_QUESTION_POLICY[step] ?? null;
}

export function formatQuestionPolicyForPrompt(step) {
  const policy = STEP_QUESTION_POLICY[step];
  if (!policy) return '';

  const allowed = policy.allowedTypes
    .map((t) => QUESTION_TYPE_LABELS[t] ?? t)
    .join(' / ');
  const preferred = policy.preferred === 'mix'
    ? 'yesno と wh をバランスよく混ぜる'
    : policy.preferred === '—'
      ? '（Step 7：operationTag と糸の相性で自動選択）'
      : `${QUESTION_TYPE_LABELS[policy.preferred] ?? policy.preferred} を優先`;
  const maxNatural = typeof policy.maxNatural === 'number'
    ? `${policy.maxNatural}問`
    : String(policy.maxNatural);

  return `- 許可タイプ（allowedTypes）: ${allowed} — **allowed 外のタイプは生成しない**
- 優先（preferred）: ${preferred}
- 何を疑問にするか: ${policy.whatToQuestion}
- 自然な上限（maxNatural）: ${maxNatural}${policy.notes ? `\n- 備考: ${policy.notes}` : ''}`;
}

/** MECE coverage rules per STEP — appended to generate extras. */
export const STEP_COVERAGE = {
  3: `- 既存「疑問/否定を最低2問」に加え、**うち1問は wh疑問**（糸2の予告編）
- 時制×相は「現在/過去 × 単純/進行/完了」をサンプリング網羅`,
  4: `- **同じ形を異なる役割で最低2問**（例：to do を X と Y/Z）
- 「役割≠形」の minimal pair を1組`,
  5: `- 関係代名詞・関係副詞・what名詞節・同格that を**別カテゴリとして**カバー
- 関係詞節 vs 同格節の対比を1問`,
  6: `- **キーセンテンス型（Y+Z共起：People who… work hard when…）を最低1問**＝課題③本丸
- 副詞節(Z)・名詞節(X)・等位接続を網羅。ネスト深さを段階化`,
  7: `- 既存の operationTag サンプリング（直前セットと同じタグ構成を避ける）を維持`,
};

export function getEssenceForStep(step) {
  return STEP_ESSENCE[step] ?? '';
}

export function getCoverageForStep(step) {
  return STEP_COVERAGE[step] ?? '';
}

export function isCoreErrorTag(code) {
  const entry = ERROR_TAXONOMY.find((t) => t.code === code);
  return entry?.tier === 'core';
}

export function formatErrorTaxonomyForPrompt() {
  return ERROR_TAXONOMY.map((t) => `- ${t.code} (${t.tier}): ${t.label} — ${t.hint}`).join('\n');
}

/**
 * @param {string[]} tags
 * @returns {string[]}
 */
export function filterCoreErrorTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.filter((code) => isCoreErrorTag(code));
}

/**
 * @param {Record<number, { errorTags?: string[] }>} evaluations
 * @returns {Record<string, number>}
 */
export function aggregateCoreErrorTags(evaluations) {
  const counts = {};
  for (const ev of Object.values(evaluations || {})) {
    for (const code of filterCoreErrorTags(ev?.errorTags)) {
      counts[code] = (counts[code] || 0) + 1;
    }
  }
  return counts;
}

/**
 * @param {Record<string, number>} counts
 * @returns {string}
 */
export function formatCoreTagSummary(counts) {
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  if (!entries.length) return '';
  return entries.map(([code, n]) => `${code}(${n})`).join(', ');
}

/**
 * Aggregate core error tags from per-question **誤りタグ:** lines in exported markdown.
 * @param {string} markdown
 * @returns {Record<string, number>}
 */
export function aggregateCoreTagsFromMarkdownBody(markdown) {
  const counts = {};
  const re = /\*\*誤りタグ:\*\*\s*([^\n]+)/g;
  let match;
  while ((match = re.exec(markdown)) !== null) {
    for (const part of match[1].split(',')) {
      const code = part.trim();
      if (isCoreErrorTag(code)) counts[code] = (counts[code] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Parse core tag summary from markdown header line.
 * @param {string} markdown
 * @returns {Record<string, number>}
 */
export function parseCoreTagSummaryFromMarkdown(markdown) {
  const match = markdown.match(/\*\*弱点タグ（core集計）:\*\*\s*(.+)/);
  if (!match) return {};
  const counts = {};
  for (const part of match[1].split(',')) {
    const m = part.trim().match(/^(\w+)\((\d+)\)$/);
    if (m && isCoreErrorTag(m[1])) counts[m[1]] = Number(m[2]);
  }
  return counts;
}

/**
 * @param {string} markdown
 * @returns {boolean}
 */
export function markdownHasErrorTags(markdown) {
  return /\*\*誤りタグ:\*\*/.test(markdown) || /\*\*弱点タグ（core集計）:\*\*/.test(markdown);
}

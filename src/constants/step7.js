/** STEP 7 operation tags, textbook chapter links, and learn-panel content. */

export const STEP7_OPERATIONS = [
  { tag: '比較', label: '比べる', chapter: 24, chapterAnchor: 'ch-24' },
  { tag: '仮定法', label: '現実をずらす', chapter: 25, chapterAnchor: 'ch-25' },
  { tag: '疑問', label: '文の種類を変える', chapter: 26, chapterAnchor: 'ch-26' },
  { tag: '倒置/強調', label: '強調・語順を動かす', chapter: 27, chapterAnchor: 'ch-27' },
  { tag: '否定', label: '否定する', chapter: 28, chapterAnchor: 'ch-28' },
  { tag: '話法', label: '発話を埋め込む', chapter: 29, chapterAnchor: 'ch-29' },
  { tag: '省略', label: '省く・受ける', chapter: 30, chapterAnchor: 'ch-30' },
];

export const STEP7_OPERATION_TAGS = STEP7_OPERATIONS.map((o) => o.tag);

/** Negative adverb phrases that trigger inversion (from framing bank, ★倒置). */
export const STEP7_INVERSION_NEGATIVE_ADV = [
  'no longer', 'no more', 'never again', 'hardly ever', 'not only',
  'by no means', 'in no way', 'under no circumstances', 'on no account',
  'seldom', 'rarely', 'little',
];

export const STEP7_THREADS = {
  thread1: {
    title: '糸1：助動詞を主語の前に出す',
    body: '疑問・否定語倒置・so/neither の倒置・仮定法倒置・do の強調——第9章の助動詞操作の再利用です。',
  },
  thread2: {
    title: '糸2：空所を作って目立つ位置へ移動',
    body: '疑問詞・関係詞・強調構文（cleft）——第19章の「空所＋移動」発想の再利用です。',
  },
};

export function getStep7ChapterAnchor(operationTag) {
  return STEP7_OPERATIONS.find((o) => o.tag === operationTag)?.chapterAnchor ?? 'ch-23';
}

export function getStep7ChapterLabel(operationTag) {
  const op = STEP7_OPERATIONS.find((o) => o.tag === operationTag);
  return op ? `第${op.chapter}章` : '第23章';
}

const TAG_STORAGE_KEY = 'est_step7_last_tags';

/** Remember last set's operation-tag mix to avoid repeating in the next generation. */
export function getLastStep7TagSet() {
  try {
    const raw = sessionStorage.getItem(TAG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLastStep7TagSet(tags) {
  try {
    sessionStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(tags));
  } catch {
    /* ignore quota errors */
  }
}

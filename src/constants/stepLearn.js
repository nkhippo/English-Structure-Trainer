import { STEP7_OPERATIONS, STEP7_THREADS } from './step7.js';

/**
 * Per-step "この Step で学ぶこと" body content (Steps 3–7).
 * @typedef {{ intro?: string, bullets?: { text: string, chapter?: number }[], sections?: { title: string, body: string }[] }} StepLearnContent
 */

/** @type {Record<number, StepLearnContent>} */
export const STEP_LEARN = {
  3: {
    intro: '日本語の「いつ・どんな様子で・する/される・できるか」を、動詞の形に正確にマッピングします。疑問・否定の基本操作もここで扱います。',
    bullets: [
      { text: '時制（現在・過去・未来）', chapter: 9 },
      { text: '相（進行・完了）', chapter: 9 },
      { text: '態（能動・受動）', chapter: 9 },
      { text: '助動詞（can / must / will 等）', chapter: 9 },
      { text: 'Yes/No疑問・wh疑問・否定（not・短縮形）', chapter: 9 },
    ],
  },
  4: {
    intro: '同じ形（不定詞・-ing・前置詞句）が X / Y / Z のどれになるかを、位置と働きで判定して翻訳します。',
    bullets: [
      { text: '動名詞（-ing）→ 主に X（主語・目的語）', chapter: 11 },
      { text: '不定詞（to do）→ X / Y / Z すべて', chapter: 11 },
      { text: '分詞（doing / done）→ Y（後置修飾）・Z（分詞構文）', chapter: 11 },
      { text: '前置詞句 → 名詞の後は Y、動詞の周辺は Z', chapter: 17 },
    ],
    sections: [
      {
        title: '修飾の方向',
        body: '単語の形容詞は前置、句・節は後置（第12章）。形ではなく位置と働きで役割が決まります（第14章）。',
      },
    ],
  },
  5: {
    intro: '日本語の連体修飾（名詞の前）を、英語の後置修飾（関係詞節・名詞節）に変換します。',
    bullets: [
      { text: '関係代名詞節（who / which / that）→ Y', chapter: 19 },
      { text: '関係副詞節（where / when）→ Y', chapter: 19 },
      { text: 'what 節・疑問詞+不定詞 → X（名詞節）', chapter: 19 },
      { text: '同格節 that（gap なし）→ Y', chapter: 11 },
    ],
    sections: [
      {
        title: '見分け方',
        body: '関係詞節は空所（gap）あり、同格節は節が完成形。jp は連体修飾（「〜した本」）で書く。',
      },
    ],
  },
  6: {
    intro: '骨格にぶら下がる節の種類と、節どうしの接続・ネストを扱います。',
    bullets: [
      { text: '副詞節（when / because / if / although 等）→ Z', chapter: 12 },
      { text: '名詞節（that / whether / wh）→ X', chapter: 10 },
      { text: '等位接続（and / but / so）で動詞を並列', chapter: 18 },
      { text: 'Y（関係詞節）＋ Z（副詞節）のネスト', chapter: 15 },
    ],
    sections: [
      {
        title: '間接疑問文',
        body: 'whether節・wh節は名詞節（X）として埋め込む。語順は平叙文に戻り、助動詞を前に出さない（第10章）。',
      },
    ],
  },
  7: {
    intro: '骨格への7つの操作（操作レベルで MECE／1文に複数操作が併用されうる）',
    operations: true,
  },
};

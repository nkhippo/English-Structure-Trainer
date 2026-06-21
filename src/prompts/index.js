import {
  STEP7_OPERATION_TAGS,
  STEP7_INVERSION_NEGATIVE_ADV,
  getLastStep7TagSet,
} from '../constants/step7.js';
import {
  getEssenceForStep,
  getCoverageForStep,
  formatErrorTaxonomyForPrompt,
  CORE_ERROR_CODES,
} from '../constants/essences.js';
import { formatCompressedParts } from '../utils/parts.js';

// Prompt templates for Claude API calls.
// Both prompts instruct Claude to return JSON-only responses
// to enable reliable parsing.

/**
 * Prompt for generating new translation exercises.
 * Claude returns a JSON array of Exercise objects.
 *
 * Exercise shape:
 *   { jp: string, en: string, parts: Part[], nuance?: string, enNative?: string, nuanceNative?: string, vocabHints?: { jp: string, en: string }[] }
 *
 * Part shape (recursive):
 *   { t: string, r: "X"|"V"|"Y"|"Z", n: string, inner?: Part[] }
 *
 * Rules for parts:
 *   - Top-level parts[].t values concatenated with spaces must reconstruct en exactly
 *   - inner[].t values concatenated with spaces must equal parent t (when inner is present)
 *   - r must be one of: X (noun role), V (verb), Y (adjective role), Z (adverb role)
 *   - n is a brief Japanese note: grammatical role, plus why this form/placement is chosen when relevant
 *   - inner shows nested X/Y/Z inside Y/Z/X chunks (relative clauses, adverb clauses, noun clauses)
 *   - nuance explains why en is the 100-point model answer (word order, phrasing, etc.)
 */
const THEME_POOL = [
  '仕事・職場',
  '旅行・観光',
  '料理・食べ物',
  '自然・天気',
  '買い物・お金',
  '学校・勉強',
  '健康・スポーツ',
  '趣味・娯楽',
  '家族・友人',
  'テクノロジー',
  '文化・芸術',
  '交通・移動',
  '住まい・家具',
  '動物・ペット',
  '季節・イベント',
  '地域・都市',
  '医療・体調',
  '環境・社会',
];

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomItems(items, count) {
  return shuffleArray(items).slice(0, Math.min(count, items.length));
}

function formatSeedExamples(exercises) {
  return pickRandomItems(exercises || [], 2)
    .map((ex, i) => `[例${i + 1}]\n  日本語: ${ex.jp}\n  英語: ${ex.en}`)
    .join('\n\n');
}

function formatThemeAssignment(n) {
  return pickRandomItems(THEME_POOL, n)
    .map((theme, i) => `  問${i + 1}: ${theme}`)
    .join('\n');
}

function buildStep3GenerateExtra(n) {
  return `
Step 3 固有の出題制約（必須）:
- ${n}問のうち **少なくとも2問** は疑問文または否定文を含める
- 疑問文：Yes/No疑問（助動詞前置）と wh疑問（空所を文頭へ）の両方をセット内でカバーする
- 否定文：助動詞 + not（短縮形 don't / doesn't / didn't / hasn't 等）を含める
- 日本語 jp には「〜ですか」「〜ません」「〜ない」など疑問・否定の手がかりを自然に含める
- 時制・相・態・助動詞の問題も引き続きバランスよく含める

Step 3 MECE網羅規則:
${getCoverageForStep(3)}`;
}

function buildStep4GenerateExtra() {
  return `
Step 4 固有の出題制約（必須）:
${getCoverageForStep(4)}`;
}

function buildStep5GenerateExtra() {
  return `
Step 5 固有の出題制約（必須）:
${getCoverageForStep(5)}`;
}

function buildStep6GenerateExtra() {
  return `
Step 6 固有の出題制約（必須）:
${getCoverageForStep(6)}`;
}

function buildStep7GenerateExtra(n, lastTagSet) {
  const inversionList = STEP7_INVERSION_NEGATIVE_ADV.join(' / ');
  const lastTagsNote = lastTagSet?.length
    ? `直前セットの操作タグ構成: ${lastTagSet.join('、')} — **同じタグの組み合わせを繰り返さない**`
    : '（直前セットなし — 2〜3種類の操作タグをバランスよく混在させる）';

  return `
Step 7 固有の出題制約（必須）:
- 各問に operationTag を1つ付与（${STEP7_OPERATION_TAGS.join(' / ')} のいずれか）
- 1セット（${n}問）で **2〜3種類の operationTag を混在** させる。同じタグが3問以上連続しないよう並べを工夫する
- ${lastTagsNote}
- **最低1問** は operationTag「倒置/強調」かつ、否定副詞句（${inversionList} 等）による倒置を含める
- 全問に cefr ラベル（"A2"|"B1"|"B2"|"C1"）を付与。比較・仮定法の基本型は B1〜B2 中心、倒置・話法・省略は B2〜C1 中心
- 各問に thread を付与（"糸1" または "糸2"）。nuance の末尾に、このSTEPのエッセンス（糸1または糸2）のどれを使っているかを1行で必ず示す
- 仮定法・話法など文が長くなりやすい操作は、日本語 jp を短く設計して文長上限を守る
- 否定副詞句リストはフレーズバンク（CEFR別）と対応。倒置問題では文頭配置＋助動詞前置を模範解答に反映する

返却形式への追加フィールド（Step 7 のみ必須）:
  "operationTag": "比較|仮定法|疑問|倒置/強調|否定|話法|省略",
  "cefr": "A2|B1|B2|C1",
  "thread": "糸1|糸2"`;
}

function buildStep3CheckExtra() {
  return `
Step 3 採点の補足:
- 疑問文・否定文の解答でも、助動詞の形・語順が正しければ意味が通れば高得点とする`;
}

function buildStep7CheckExtra() {
  return `
Step 7 採点の補足（必須）:
- **構文の種類は問わず、正しい変形であれば正解とする**（例：it-cleft と what-cleft の両方、仮定法の別表現など）
- 操作タグ（比較・仮定法・疑問・倒置/強調・否定・話法・省略）に関わらず、意味と文法が正しければ満点に近い評価とする
- feedback で模範解答の妥当性を説明するとき、可能なら「糸1（助動詞前置）」または「糸2（空所＋移動）」のどちらの再利用かに1行触れる`;
}

function buildFollowUpReviewSection(reviewMarkdown, n, step, { coreTagSummary } = {}) {
  const coreCodes = CORE_ERROR_CODES.join(' / ');
  const tagBlock = coreTagSummary
    ? `
前回の core 誤りタグ集計（弱点シグナル）: ${coreTagSummary}
- 上記 core タグを**優先**して弱点克服問題を設計すること
- peripheral（lexical / functionWord）は出題に寄与させない`
    : `
- 前回結果に errorTags が無い場合は、Markdown 本文から低得点・要修正の問を分析すること`;

  return `

前回の答え合わせ結果（Markdown）:
---
${reviewMarkdown}
---

弱点克服出題の指示（必須）:
- 弱点は **ERROR_TAXONOMY の core 層**（${coreCodes}）で特定する。該当タグを過不足なく列挙して設計に反映する
- **peripheral（lexical / functionWord）は弱点シグナルから除外** — スペル・語彙・機能語の語選択は次の出題に寄与させない
- 8〜9点でスペル・語彙だけが問題だった問は、弱点分析から除外（正解扱い）${tagBlock}
- 今回の ${n} 問は、特定した **core 構造の弱点** を集中的に克服できる問題を中心に設計する
- 現在の Step ${step} にとどまらず、core タグが示す弱点があれば **Step を跨いで** 出題してよい
- 前回と同じ日本語文・同じ模範解答は出題しない
- 前回正解（8点以上、または peripheral のみの軽微な減点）だった文法パターンは復習として1問程度にとどめ、core の苦手パターンを厚く出題する
- テーマ・場面・主語は前回と重ならないよう新しい題材を使う`;
}

function buildStepGenerateExtra(step, n) {
  if (step === 3) return buildStep3GenerateExtra(n);
  if (step === 4) return buildStep4GenerateExtra();
  if (step === 5) return buildStep5GenerateExtra();
  if (step === 6) return buildStep6GenerateExtra();
  if (step === 7) return buildStep7GenerateExtra(n, getLastStep7TagSet());
  return '';
}

export function buildGeneratePrompt(stepInfo, n, { step, reviewMarkdown, coreTagSummary } = {}) {
  const seedExamples = formatSeedExamples(stepInfo.exercises);
  const themeAssignment = formatThemeAssignment(n);
  const stepExtra = buildStepGenerateExtra(step, n);
  const essence = getEssenceForStep(step);
  const followUpSection = reviewMarkdown
    ? buildFollowUpReviewSection(reviewMarkdown, n, step, { coreTagSummary })
    : '';

  return {
    system: `あなたは英語教育の専門家です。
日本語→英語の翻訳練習問題を生成してください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。

JSONの厳守ルール:
- 文字列値はダブルクォートのみ使用（シングルクォート不可）
- 文字列内のダブルクォートは \\" でエスケープする
- parts[].n や nuance 内で英文を引用するときは『』を使い、ダブルクォートは使わない
- 改行は \\n でエスケープし、生の改行を文字列内に入れない
- 末尾カンマ（trailing comma）は禁止`,

    user: `以下の文法ポイントに合った翻訳練習問題を${n}問生成してください。

文法ポイント: ${stepInfo.sub}（${stepInfo.focus}）

このSTEPの再利用原理（エッセンス）— nuance 末尾でどれを使ったか1行で示すこと:
${essence}

参考例（日本語の自然さ・文体の基準。テーマや内容は参考例に引きずられず、下記のテーマ割り当てに従うこと）:
${seedExamples || '  （参考例なし）'}

テーマの多様性（必須）:
- 各問に異なるテーマを1つずつ割り当て、jp の内容がそのテーマになるようにする
- 同じセット内でテーマ・場面・主語・文型の重複を避ける（例: 「毎日走ることで〜」のような同型文を複数問に使わない）
- 今回のテーマ割り当て（この順で生成し、最後に並びをランダムに入れ替える）:
${themeAssignment}

生成手順（必ずこの順番で）:
1. まず日本語文 jp を、母語話者が違和感なく言える自然な文として書く
2. jp の意味を正確に英訳して en（文法・構造の模範）と parts を作る
3. 英文の構文要件（後置修飾など）を満たすために、jp を英語語順に無理やり合わせない

返却形式（JSONのみ）:
[
  {
    "jp": "自然な日本語文",
    "en": "採点基準となる模範英訳（Step の文法・構造を明確に示す表現・語順）",
    "parts": [
      {
        "t": "英文のチャンク",
        "r": "X|V|Y|Z",
        "n": "役割メモ · 語順・表現の理由（該当する場合）",
        "inner": [
          { "t": "内部チャンク", "r": "X|V|Y|Z", "n": "内部の役割メモ（句・節を含む場合のみ）" }
        ]
      }
    ],
    "nuance": "en（文法・構造の模範）が採点基準となる理由（語順・文法パターンの選択根拠を1〜2文で）。**末尾に1行**でこのSTEPのエッセンスのどれを使っているかを示す",
    "vocabHints": [
      { "jp": "日本語の語（辞書形・基本形）", "en": "英語の原型（動詞原形・名詞単数形など）" }
    ]
  }
]

役割の定義:
- X: 名詞役（主語・目的語・補語になるもの）
- V: 動詞（時制・相・態・助動詞を含む動詞部分全体）
- Y: 形容詞役（名詞を修飾するもの：形容詞・前置詞句・分詞・関係詞節）
- Z: 副詞役（動詞・文全体を修飾するもの：副詞・前置詞句・副詞節・分詞構文）

日本語（jp）の品質要件:
- 和文として自然で、英語の直訳調（カクル調）にしない
- 意味が通り、語彙と述語の組み合わせが論理的であること（例: ×「去年出版された著者」→ 著者は出版されない。本が出版される）
- 英語の後置修飾に合わせてカンマで区切るなど、英語語順をそのまま写さない
- 関係詞・後置修飾の Step では jp は連体修飾（名詞の前に修飾句）を使う
  例: ○「去年出版された本はとても興味深い。」 ×「この本は、去年出版された著者による、とても興味深いです。」
- 2つ以上の節・文をつなぐとき、論理関係（並列・因果・対比など）を日本語で明示する
  - 並列（A かつ B）: 両者が独立した事実であることが読み取れる表現にする
    例: ○「彼女は音楽を聴くのが好きで、ほぼ毎日ヘッドフォンで聴いている。」
  - 因果（A 故に B）: 「〜ので」「〜から」「そのため」など原因・結果がはっきりする接続を使う
    例: ○「彼女は音楽を聴くのが好きなので、ほぼ毎日 Spotify で聞いている。」
  - × 曖昧な例: 「音楽を聴くのが好きで、毎日のように行っている。」
    → 「好きだから行く」のか「好きなことと別に行く」のか不明。「行く」先・対象も不明
  - 「〜で、〜」だけでは並列か因果か判断できない場合は、上記のように接続を言い換える
- 後節の述語は、文脈なしで「何を・どこへ・誰に」が分かるように書く（「行っている」「やっている」だけにしない）
- 生成後、jp だけを読んで不自然さ・意味の矛盾・論理の曖昧さがないか自己確認する

vocabHints（単語ヒント）のルール:
- jp の中で英訳に必要な語彙のうち、TOEIC 250点程度の学習者でも訳語が思い浮かびにくい語を**漏れなく**選ぶ（出しすぎより出し少ない方が不利 — 迷ったらヒントに含める）
- 動詞だけでなく**名詞・形容詞・副詞**も積極的にヒント化する（例: 予算→budget、大規模な→large-scale、環境保全→environmental conservation）
- 除外するのは超基本語のみ: be動詞・代名詞・数詞・曜日・go/come/see/eat など初級で必ず習う語（book, read, study, tired など）
- TOEIC 300〜400点帯の語（budget, project, secure, implement, maintain, issue など）も**必ず**ヒントに含める
- 1文あたり **3〜6語** を目安に含める（内容語が多い文は上限まで出す）
- あくまで単語の対訳のみ。文法・構文の解説はしない（Although, who, that, whether などの接続詞・関係詞は含めない）
- 動詞は原形（publish）、名詞は単数形（author）、形容詞は原形（large-scale）で en を書く
- 活用形や時制は jp 側に書かず、jp は辞書形・基本形（出版する、大規模な）にする
- 該当語がなければ vocabHints は空配列 [] にする

模範解答（en）の品質要件 — 採点基準（100点）:
- en は「意味が通る訳」ではなく、**Step の文法ポイント（${stepInfo.focus}）を最も明確に示す**模範訳とする
- 訳し方が複数ある場合、学習中の文法・構造パターンが読み取れる語順・表現を優先する（採点は常に en を基準とする）
- 例: 「毎日走ることで体を健康に保つ」→ ○ "By running every day, I keep my body fit."
  （手段を By + 動名詞で明示し、文頭に置いて主節へ自然につなぐ）
  × "Running every day, I keep fit my body."（語順が不自然）

parts[].inner（ネスト構造・再帰的）:
- X/Y/Z のルールは句・節の内部にも再帰的に適用する
- 関係詞節（Y）・副詞節（Z）・名詞節（X）など、内部に骨格（X+V など）を持つチャンクには inner を必ず付ける
- inner 内の t をスペースで繋いだ文字列は、親チャンクの t と一致すること
- inner の中にさらに句・節があれば、inner を再帰的にネストしてよい（最大2段まで）
- 単純な主語・動詞・単語の副詞など、内部に分解する意味がないチャンクは inner を省略
- parts[].n は1行・80文字以内を目安に簡潔に（JSON肥大化を防ぐ）

inner の例（関係詞節）:
  "t": "who like taking walks in the park", "r": "Y", "n": "関係詞節（主語を後置修飾）",
  "inner": [
    { "t": "who", "r": "X", "n": "関係代名詞（主語）" },
    { "t": "like", "r": "V", "n": "動詞（現在形）" },
    { "t": "taking walks in the park", "r": "X", "n": "目的語（動名詞句）",
      "inner": [
        { "t": "taking walks", "r": "X", "n": "動名詞句" },
        { "t": "in the park", "r": "Z", "n": "場所の前置詞句" }
      ]
    }
  ]

inner の例（副詞節）:
  "t": "when an issue arises", "r": "Z", "n": "副詞節",
  "inner": [
    { "t": "when", "r": "Z", "n": "接続副詞" },
    { "t": "an issue", "r": "X", "n": "主語" },
    { "t": "arises", "r": "V", "n": "動詞（現在形）" }
  ]

inner の例（副詞句＋名詞の後置修飾）:
  "t": "At the art exhibition held last year", "r": "Z", "n": "副詞役 · 場所・時を表す前置詞句",
  "inner": [
    { "t": "At the art exhibition", "r": "Z", "n": "場所の前置詞句" },
    { "t": "held last year", "r": "Y", "n": "過去分詞による後置修飾（exhibition を修飾）" }
  ]
  ※ inner に後置修飾（Y）だけを書いて前置詞句の頭（At the art exhibition）を省略しないこと

parts[].n の書き方:
- 前半: 文法上の役割（例: 「分詞構文（副詞役・前置）」「目的語と補語」）
- 後半（語順・前置・後置・表現の選択が学習ポイントのとき必須）: 「 · 」で区切り、なぜその位置・形が望ましいかを1文で
  例: 「分詞構文（副詞役・前置） · 同時の状況を文頭で示し、主節の行動と自然につなげる」
  例: 「手段・方法を表す前置詞句 · 日本語の「〜ことで」を By + 動名詞で明示し、文頭に置くと手段→結果の流れが明確になる」
- 語順・位置に特別な理由がないチャンク（主語・単純な目的語など）は役割メモのみでよい

nuance（必須）:
- en 全体が採点基準（100点）となる理由を1〜2文で書く
- 別の訳でも意味は通るが、なぜ en の語順・文法パターンが学習・採点の基準として望ましいかを説明する
- 学習者が「なぜこの語順・表現なのか」を理解できる内容にする
- **末尾に1行**で、このSTEPのエッセンス（上記「再利用原理」）のどれを使っているかを明示する

制約:
- parts[].t をスペースで繋いだ文字列が en と一致すること
- 難易度は日常的な文を使い、学習者が理解できるレベルに保つこと
- 日本語の訳し方が1通りでない場合、模範解答のニュアンスが日本語に一致するよう jp を調整する。ただし不自然な日本語になる場合は en の方を jp に合わせて書き換える
- ${n}問で扱う文法パターン（${stepInfo.focus}）もできるだけバラけさせ、似た構文の連続を避ける
- JSON配列の並び順は問ごとにランダムにする（テーマ割り当ての順番と一致させない）${stepExtra}${followUpSection}`,
  };
}

/** Fisher–Yates shuffle for exercise ordering after API response. */
export { shuffleArray };

/**
 * Prompt for evaluating user translation attempts.
 * Claude returns a JSON array of Evaluation objects.
 *
 * Evaluation shape:
 *   { score: number, correct: boolean, feedback: string, correction: string | null }
 */
export function buildCheckPrompt(pairs, { step } = {}) {
  const stepExtra = step === 3
    ? buildStep3CheckExtra()
    : step === 7
      ? buildStep7CheckExtra()
      : '';
  const items = pairs
    .map(
      (p, i) =>
        `[${i + 1}]\n日本語: ${p.jp}\n模範解答（100点・文法・構造）: ${p.en}${p.nuance ? `\n模範解答のポイント: ${p.nuance}` : ''}${p.operationTag ? `\n操作タグ: ${p.operationTag}` : ''}${p.thread ? `\n糸: ${p.thread}` : ''}\n構造（圧縮 parts）: ${formatCompressedParts(p.parts)}\n解答: ${p.attempt || '（未入力）'}`
    )
    .join('\n\n');

  return {
    system: `あなたは英語教育の専門家です。
英語翻訳の採点をしてください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。

JSONの厳守ルール:
- 文字列値はダブルクォートのみ使用（シングルクォート不可）
- feedback 内で英文・英単語を引用するときは必ず『』を使い、ダブルクォート (") は一切使わない
- 文字列内のダブルクォートが必要な場合のみ \\" でエスケープする
- feedback 内の改行は \\n で表す（生の改行は使わない）
- 末尾カンマ（trailing comma）は禁止`,

    user: `以下の翻訳を採点し、JSONで返してください。

${items}

返却形式（JSONのみ、${pairs.length}要素の配列）:
[
  {
    "score": 0〜10 の整数（各問10点満点）,
    "correct": true または false,
    "feedback": "下記の feedback ルールに従った日本語の解説",
    "correction": "常に null（模範解答は別途表示するため不要）",
    "errorTags": ["skeleton", "verbInfo", ...]  // ERROR_TAXONOMY の code の配列。誤りなしは []
  }
]

errorTags（必須・feedback とは別に機械可読で付与）:
${formatErrorTaxonomyForPrompt()}

errorTags 判定指針:
- 構造の誤り（骨格・動詞情報・役割・係り受け・ネスト・発展操作）→ 対応する core コードを**過不足なく列挙**（1つに丸めない）
- スペル・語彙・表現選択の誤り → lexical。冠詞・前置詞の語選択 → functionWord
- core と peripheral は**直交する別軸**。両方該当すれば両方記録する
- 点数（score）への影響は現行どおり。errorTags は弱点分析用の分類
- 正解（構造的に誤りなし）の場合は errorTags: []

score（10点満点）の目安:
- 10点: 意味・文法ともに正解、または表現の差異のみで意味は完全一致
- 7〜9点: 意味は正確だが、軽微な文法・語彙・スペルの誤りがある
- 4〜6点: 意味はおおむね伝わるが、時制・語法・語順など重要な誤りがある
- 1〜3点: 意味が部分的にしか伝わらない、または重大な誤りが多い（意味がほぼ伝わらない場合も 1点）
- 0点: **未入力の場合のみ**（解答がある場合は最低 1点）

採点基準（重要 — 変更禁止）:
- **採点は en（文法・構造の模範解答）のみを100点基準とする**。enNative は参考表示であり、採点には使わない
- 解答が enNative に近くても en の文法・構造と異なれば減点対象になりうる。逆に en に近いが enNative とは異なる表現でも、en と意味・文法が一致すれば満点に近い評価とする
- score に応じて correct を設定する（8点以上なら correct: true、7点以下なら false）
- 意味が正しく伝わっていればマイナーな表現の差異は 8〜10点
- 文法的な誤り・時制のミス・語順の問題・意味の変化は 7点以下
- 解答がある場合、score は 1〜10 のいずれかとする（0点は未入力専用）

feedback ルール（全体の分量は簡潔版の約1.5倍を目安。特に模範解答の妥当性の説明を厚く書く）:
- score が 10点の場合: 「正解！」のみ（他の解説は不要）
- score が 8〜9点の場合:
  1. 軽微な誤りを1〜2文で指摘
  2. 改行（\\n\\n）のあと、模範解答の語順・表現がなぜより望ましいかを **3〜4文** で補足する
     - 模範解答のポイント・語順・ニュアンスのいずれか少なくとも2点を触れる
     - 解答の表現と模範解答を直接比較し、「なぜ模範の方が自然・正確か」を具体的に
- 未入力（解答が空または「（未入力）」）の場合: score は **0 のみ**（他の点数帯と混同しない）、具体的な誤りの指摘のみ（翻訳による意味の比較は不要）
- score が 7点以下かつ解答ありの場合: 次の4ブロックを \\n\\n で区切る
  1. 主な誤り：— 誤りごとに (1)(2)... と列挙。各項目は **1〜2文**（何が誤りか＋正しい形・理由の簡潔な補足）
  2. スペルミス等があれば補正したうえで、解答を日本語に訳し直した意味を **2文程度** で示す
  3. その訳が元の日本語文の意図とどうずれるかを **2〜3文** で対比する（該当する場合）
  4. **模範解答（100点）の妥当性** — このブロックが feedback 全体の **約40%** になるよう、**4〜6文** で深く説明する
     - 模範解答のポイント・語順の選択・表現のニュアンス・ネイティブの自然さを多角的に
     - 解答者が取りがちな別表現（関係詞節 vs 分詞修飾、語彙の強弱など）と模範解答を比較し、模範が優れる理由を段階的に
     - 日本語のどの部分に模範解答のどの表現が対応するかも触れる
     例: 『Passengers sitting near the window』は、関係詞節 who sit より分詞 sitting の後置修飾の方が簡潔で、視覚的な場面描写に向きます。さらに are enjoying は are watching より『楽しんでいる』という日本語のニュアンスを生き生きと伝え、今まさに起きている光景を描きます。
     ※ feedback 内の英文引用は必ず『』で囲む（ダブルクォートは JSON エラーの原因になるため禁止）

feedback 書式（可読性最優先）:
- 1つの論点・誤り項目・文ごとに \\n で改行し、詰め込まない
- 誤りが複数あるときは見出し「主な誤り：」の直後から (1)(2)... を各行に1項目ずつ
- 大きな区切り（誤り指摘 / 補正後の意味 / 意図との対比 / 模範の理由）のあとは空行（\\n\\n）を入れる
- 行が長くなっても構わない。途中で不自然な位置で改行しない
- feedback は学習者が「何を直すか」と「なぜ模範解答が100点なのか」の両方がわかるよう具体的に
- 模範解答と異なる別解を correction として提示しない（模範解答は常に入力の「模範解答（100点）」を使う）${stepExtra}`,
  };
}

/**
 * Lightweight on-demand enNative generation (UI expand).
 */
export function buildEnNativePrompt(jp, en) {
  return {
    system: `あなたは英語教育の専門家です。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。`,

    user: `以下の日本語と模範英訳（文法・構造）を入力に、ネイティブらしい参考表現を1組生成してください。

日本語: ${jp}
模範解答（文法・構造）: ${en}

返却形式（JSONのみ、1要素のオブジェクト）:
{
  "enNative": "ネイティブがより自然に言う英訳（意味は jp と同じ。チャンク・コロケーション重視）",
  "nuanceNative": "enNative が en より自然に聞こえる理由（2〜3文）"
}

要件:
- en と意味は同じ。en より口語的・自然なチャンク・語順を優先してよい
- 採点基準ではない参考情報として書く`,
  };
}

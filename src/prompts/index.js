import { formatPartsForCheck } from '../utils/parts.js';

// Prompt templates for Claude API calls.
// Both prompts instruct Claude to return JSON-only responses
// to enable reliable parsing.

/**
 * Prompt for generating new translation exercises.
 * Claude returns a JSON array of Exercise objects.
 *
 * Exercise shape:
 *   { jp: string, en: string, parts: Part[], nuance?: string, vocabHints?: { jp: string, en: string }[] }
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

export function buildGeneratePrompt(stepInfo, n) {
  const seedExamples = formatSeedExamples(stepInfo.exercises);
  const themeAssignment = formatThemeAssignment(n);

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

参考例（日本語の自然さ・文体の基準。テーマや内容は参考例に引きずられず、下記のテーマ割り当てに従うこと）:
${seedExamples || '  （参考例なし）'}

テーマの多様性（必須）:
- 各問に異なるテーマを1つずつ割り当て、jp の内容がそのテーマになるようにする
- 同じセット内でテーマ・場面・主語・文型の重複を避ける（例: 「毎日走ることで〜」のような同型文を複数問に使わない）
- 今回のテーマ割り当て（この順で生成し、最後に並びをランダムに入れ替える）:
${themeAssignment}

生成手順（必ずこの順番で）:
1. まず日本語文 jp を、母語話者が違和感なく言える自然な文として書く
2. jp の意味を正確に英訳して en と parts を作る
3. 英文の構文要件（後置修飾など）を満たすために、jp を英語語順に無理やり合わせない

返却形式（JSONのみ）:
[
  {
    "jp": "自然な日本語文",
    "en": "100点満点の模範英訳（最も自然で学習価値の高い表現・語順）",
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
    "nuance": "模範解答が100点となる理由（語順・表現の選択根拠を1〜2文で）",
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
- jp の中で英訳に必要な語彙のうち、TOEIC 350点程度の学習者でも知らない・訳語が思い浮かびにくい語を選ぶ（前より厳しすぎないこと）
- TOEIC 300点程度で日常的によく使う基本語（book, read, go, tired, study など）のみ含めない。350点程度で使える語彙（attitude, maintain, issue など）は積極的にヒント化する
- 1文あたり、該当語があればおおよそ2〜4語を目安に含める（少なすぎないこと）
- あくまで単語の対訳のみ。文法・構文の解説はしない（Although, who, that, whether などの接続詞・関係詞は含めない）
- 動詞は原形（publish）、名詞は単数形（author）、形容詞は原形（fluent）で en を書く
- 活用形や時制は jp 側に書かず、jp は辞書形・基本形（出版する、著者）にする
- 該当語がなければ vocabHints は空配列 [] にする

模範解答（en）の品質要件:
- en は「意味が通る訳」ではなく、100点満点の最良訳とする
- 訳し方が複数ある場合、Step の文法ポイント（${stepInfo.focus}）を最も活かせる語順・表現を選ぶ
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

parts[].n の書き方:
- 前半: 文法上の役割（例: 「分詞構文（副詞役・前置）」「目的語と補語」）
- 後半（語順・前置・後置・表現の選択が学習ポイントのとき必須）: 「 · 」で区切り、なぜその位置・形が望ましいかを1文で
  例: 「分詞構文（副詞役・前置） · 同時の状況を文頭で示し、主節の行動と自然につなげる」
  例: 「手段・方法を表す前置詞句 · 日本語の「〜ことで」を By + 動名詞で明示し、文頭に置くと手段→結果の流れが明確になる」
- 語順・位置に特別な理由がないチャンク（主語・単純な目的語など）は役割メモのみでよい

nuance（必須）:
- 模範解答全体が100点となる理由を1〜2文で書く
- 別の訳でも意味は通るが、なぜ en の語順・表現がより望ましいかを説明する
- 学習者が「なぜこの語順・表現なのか」を理解できる内容にする

制約:
- parts[].t をスペースで繋いだ文字列が en と一致すること
- 難易度は日常的な文を使い、学習者が理解できるレベルに保つこと
- 日本語の訳し方が1通りでない場合、模範解答のニュアンスが日本語に一致するよう jp を調整する。ただし不自然な日本語になる場合は en の方を jp に合わせて書き換える
- ${n}問で扱う文法パターン（${stepInfo.focus}）もできるだけバラけさせ、似た構文の連続を避ける
- JSON配列の並び順は問ごとにランダムにする（テーマ割り当ての順番と一致させない）`,
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
export function buildCheckPrompt(pairs) {
  const items = pairs
    .map(
      (p, i) =>
        `[${i + 1}]\n日本語: ${p.jp}\n模範解答（100点）: ${p.en}${p.nuance ? `\n模範解答のポイント: ${p.nuance}` : ''}${formatPartsForCheck(p.parts)}\n解答: ${p.attempt || '（未入力）'}`
    )
    .join('\n\n');

  return {
    system: `あなたは英語教育の専門家です。
英語翻訳の採点をしてください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。

JSONの厳守ルール:
- feedback 内の改行は \\n で表す（生の改行は使わない）`,

    user: `以下の翻訳を採点し、JSONで返してください。

${items}

返却形式（JSONのみ、${pairs.length}要素の配列）:
[
  {
    "score": 0〜10 の整数（各問10点満点）,
    "correct": true または false,
    "feedback": "下記の feedback ルールに従った日本語の解説",
    "correction": "常に null（模範解答は別途表示するため不要）"
  }
]

score（10点満点）の目安:
- 10点: 意味・文法ともに正解、または表現の差異のみで意味は完全一致
- 7〜9点: 意味は正確だが、軽微な文法・語彙・スペルの誤りがある
- 4〜6点: 意味はおおむね伝わるが、時制・語法・語順など重要な誤りがある
- 1〜3点: 意味が部分的にしか伝わらない、または重大な誤りが多い
- 0点: 未入力、または意味がほぼ伝わらない

採点基準:
- score に応じて correct を設定する（8点以上なら correct: true、7点以下なら false）
- 意味が正しく伝わっていればマイナーな表現の差異は 8〜10点
- 文法的な誤り・時制のミス・語順の問題・意味の変化は 7点以下

feedback ルール:
- score が 10点の場合: 「正解！」のみ（他の解説は不要）
- score が 8〜9点の場合: 1行目に軽微な誤りを指摘、改行（\\n）のあと模範解答の語順・表現がなぜより望ましいかを補足（構造分解・模範解答のポイントを参照）
- 未入力（解答が空または「（未入力）」）の場合: score は 0、具体的な誤りの指摘のみ（翻訳による意味の比較は不要）
- score が 7点以下かつ解答ありの場合: 次の4ブロックを \\n\\n で区切る
  1. 主な誤り：— 誤りごとに (1)(2)... と1行ずつ列挙（文法・時制・語彙・語順など、何を直すべきか）
  2. スペルミス等があれば補正したうえで、解答を日本語に訳し直した意味を示す
  3. その訳が元の日本語文の意図とどうずれるかを対比する（該当する場合）
  4. 模範解答（100点）の語順・表現がなぜ望ましいかを説明する（構造分解の n や模範解答のポイントを活用）
     例: 「手段を表す『By running every day』を文頭に置くと、日本語の「〜ことで」に対応し、手段→結果の流れが明確になります。」

feedback 書式（可読性最優先）:
- 1つの論点・誤り項目・文ごとに \\n で改行し、詰め込まない
- 誤りが複数あるときは見出し「主な誤り：」の直後から (1)(2)... を各行に1項目ずつ
- 大きな区切り（誤り指摘 / 補正後の意味 / 意図との対比 / 模範の理由）のあとは空行（\\n\\n）を入れる
- 行が長くなっても構わない。途中で不自然な位置で改行しない
- feedback は学習者が「何を直すか」と「なぜ模範解答が100点なのか」の両方がわかるよう具体的に
- 模範解答と異なる別解を correction として提示しない（模範解答は常に入力の「模範解答（100点）」を使う）`,
  };
}

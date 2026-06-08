// Prompt templates for Claude API calls.
// Both prompts instruct Claude to return JSON-only responses
// to enable reliable parsing.

/**
 * Prompt for generating new translation exercises.
 * Claude returns a JSON array of Exercise objects.
 *
 * Exercise shape:
 *   { jp: string, en: string, parts: { t: string, r: "X"|"V"|"Y"|"Z", n: string }[], nuance?: string, vocabHints?: { jp: string, en: string }[] }
 *
 * Rules for parts:
 *   - parts[].t values concatenated with spaces must reconstruct en exactly
 *   - r must be one of: X (noun role), V (verb), Y (adjective role), Z (adverb role)
 *   - n is a brief Japanese note about the role
 */
function formatSeedExamples(exercises) {
  return (exercises || [])
    .slice(0, 2)
    .map((ex, i) => `[例${i + 1}]\n  日本語: ${ex.jp}\n  英語: ${ex.en}`)
    .join('\n\n');
}

export function buildGeneratePrompt(stepInfo, n) {
  const seedExamples = formatSeedExamples(stepInfo.exercises);

  return {
    system: `あなたは英語教育の専門家です。
日本語→英語の翻訳練習問題を生成してください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。`,

    user: `以下の文法ポイントに合った翻訳練習問題を${n}問生成してください。

文法ポイント: ${stepInfo.sub}（${stepInfo.focus}）

参考例（日本語の自然さ・文体の基準）:
${seedExamples || '  （参考例なし）'}

生成手順（必ずこの順番で）:
1. まず日本語文 jp を、母語話者が違和感なく言える自然な文として書く
2. jp の意味を正確に英訳して en と parts を作る
3. 英文の構文要件（後置修飾など）を満たすために、jp を英語語順に無理やり合わせない

返却形式（JSONのみ）:
[
  {
    "jp": "自然な日本語文",
    "en": "正確な英語訳",
    "parts": [
      { "t": "英文のチャンク", "r": "X|V|Y|Z", "n": "日本語の役割メモ" }
    ],
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
- jp の中で英訳に必要な語彙のうち、TOEIC 400点程度の学習者でも知らない・訳語が思い浮かびにくい語を選ぶ（前より厳しすぎないこと）
- TOEIC 300点程度で日常的によく使う基本語（book, read, go, tired, study など）のみ含めない。400点程度で使える語彙（attitude, maintain, issue など）は積極的にヒント化する
- 1文あたり、該当語があればおおよそ2〜4語を目安に含める（少なすぎないこと）
- あくまで単語の対訳のみ。文法・構文の解説はしない（Although, who, that, whether などの接続詞・関係詞は含めない）
- 動詞は原形（publish）、名詞は単数形（author）、形容詞は原形（fluent）で en を書く
- 活用形や時制は jp 側に書かず、jp は辞書形・基本形（出版する、著者）にする
- 該当語がなければ vocabHints は空配列 [] にする

制約:
- parts[].t をスペースで繋いだ文字列が en と一致すること
- 各 n は「主語」「現在進行形」「前置詞句（book を後置修飾）」のように簡潔な日本語で
- 難易度は日常的な文を使い、学習者が理解できるレベルに保つこと
- 日本語の訳し方が1通りでない場合、模範解答のニュアンスが日本語に一致するよう jp を調整する。ただし不自然な日本語になる場合は en の方を jp に合わせて書き換える`,
  };
}

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
        `[${i + 1}]\n日本語: ${p.jp}\n正解: ${p.en}\n解答: ${p.attempt || '（未入力）'}`
    )
    .join('\n\n');

  return {
    system: `あなたは英語教育の専門家です。
英語翻訳の採点をしてください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。`,

    user: `以下の翻訳を採点し、JSONで返してください。

${items}

返却形式（JSONのみ、${pairs.length}要素の配列）:
[
  {
    "score": 0〜10 の整数（各問10点満点）,
    "correct": true または false,
    "feedback": "下記の feedback ルールに従った日本語の解説",
    "correction": "誤りの場合のみ正しい英文、正解の場合は null"
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
- score が 8〜9点の場合: 軽微な誤りがあれば1文で指摘し、意味は正しく伝わっていることを伝える
- 未入力（解答が空または「（未入力）」）の場合: score は 0、具体的な誤りの指摘のみ（翻訳による意味の比較は不要）
- score が 7点以下かつ解答ありの場合: 2〜3文で構成する
  1. 具体的な誤りの指摘（文法・時制・語彙など、何を直すべきか）
  2. スペルミス等があれば補正したうえで、解答を日本語に訳し直した意味を示す
  3. その訳が元の日本語文の意図とどうずれるかを対比する
     例: 「あなたの解答を翻訳すると「理解できなかった」ではなく「理解しなかった」という意味になってしまいます。」
- feedback は学習者が何を直すべきかわかるよう具体的に`,
  };
}

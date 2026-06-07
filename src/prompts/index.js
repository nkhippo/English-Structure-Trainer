// Prompt templates for Claude API calls.
// Both prompts instruct Claude to return JSON-only responses
// to enable reliable parsing.

/**
 * Prompt for generating new translation exercises.
 * Claude returns a JSON array of Exercise objects.
 *
 * Exercise shape:
 *   { jp: string, en: string, parts: { t: string, r: "X"|"V"|"Y"|"Z", n: string }[], nuance?: string }
 *
 * Rules for parts:
 *   - parts[].t values concatenated with spaces must reconstruct en exactly
 *   - r must be one of: X (noun role), V (verb), Y (adjective role), Z (adverb role)
 *   - n is a brief Japanese note about the role
 */
export function buildGeneratePrompt(stepInfo, n) {
  return {
    system: `あなたは英語教育の専門家です。
日本語→英語の翻訳練習問題を生成してください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。`,

    user: `以下の文法ポイントに合った翻訳練習問題を${n}問生成してください。

文法ポイント: ${stepInfo.sub}（${stepInfo.focus}）

返却形式（JSONのみ）:
[
  {
    "jp": "自然な日本語文",
    "en": "正確な英語訳",
    "parts": [
      { "t": "英文のチャンク", "r": "X|V|Y|Z", "n": "日本語の役割メモ" }
    ]
  }
]

役割の定義:
- X: 名詞役（主語・目的語・補語になるもの）
- V: 動詞（時制・相・態・助動詞を含む動詞部分全体）
- Y: 形容詞役（名詞を修飾するもの：形容詞・前置詞句・分詞・関係詞節）
- Z: 副詞役（動詞・文全体を修飾するもの：副詞・前置詞句・副詞節・分詞構文）

制約:
- parts[].t をスペースで繋いだ文字列が en と一致すること
- 各 n は「主語」「現在進行形」「前置詞句（book を後置修飾）」のように簡潔な日本語で
- 難易度は日常的な文を使い、学習者が理解できるレベルに保つこと
- 日本語の訳し方が1通りでない場合、模範解答のニュアンスが日本語に一致するよう jp 側の日本語を模範解答に寄せて調整すること`,
  };
}

/**
 * Prompt for evaluating user translation attempts.
 * Claude returns a JSON array of Evaluation objects.
 *
 * Evaluation shape:
 *   { correct: boolean, feedback: string, correction: string | null }
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
    "correct": true または false,
    "feedback": "正解の場合は「正解！」、誤りの場合は具体的な誤りの指摘（日本語・1〜2文）",
    "correction": "誤りの場合のみ正しい英文、正解の場合は null"
  }
]

採点基準:
- 意味が正しく伝わっていればマイナーな表現の差異は correct: true でよい
- 文法的な誤り・時制のミス・語順の問題・意味の変化は correct: false
- feedback は学習者が何を直すべきかわかるよう具体的に`,
  };
}

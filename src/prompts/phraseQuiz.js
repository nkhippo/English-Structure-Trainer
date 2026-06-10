import { categoryLabel } from '../constants/framingExpressions.js';

function formatTargetList(targets) {
  return targets
    .map(
      (e, i) =>
        `${i + 1}. expr="${e.expr}" / 日本語の意味: ${e.jpHint} / 種類: ${categoryLabel(e.category)} / メモ: ${e.note}`,
    )
    .join('\n');
}

/**
 * Build prompt for phrase fill-in-blank quiz generation.
 * One API call produces questions with model answers and beginner-friendly feedback.
 */
export function buildPhraseGeneratePrompt(targets, levelLabel) {
  const n = targets.length;

  return {
    system: `あなたは英語教育の専門家です。
指定された英語フレーズについて、穴埋め練習問題を作成してください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。`,

    user: `CEFR ${levelLabel} 向けのフレーズ3択クイズ用の穴埋め問題を ${n} 問作成してください。
以下の ${n} 個のフレーズを、それぞれちょうど1問ずつ使ってください（重複・省略・追加禁止）。
一部はタブ外のレベルのフレーズが含まれる場合がありますが、expr はリストのとおりに使ってください。

${formatTargetList(targets)}

返却形式（JSONのみ、${n}要素の配列）:
[
  {
    "expr": "指定されたフレーズ（そのまま）",
    "jp": "自然な日本語文（このフレーズを使う場面を表す）",
    "en": "英語文。フレーズ部分だけ ___ に置き換える（___ は1箇所のみ）",
    "meaning": "初学者向けの意味説明（2〜3文。X/Y/Z などの専門用語は使わない）",
    "confusables": [
      { "phrase": "間違えやすい表現1", "why": "なぜこの文では合わないか（1文）" },
      { "phrase": "間違えやすい表現2", "why": "なぜこの文では合わないか（1文）" }
    ]
  }
]

ルール:
- expr は上記リストと完全一致させること
- en には ___ をちょうど1つだけ含めること。接続副詞の場合は文と文のあいだ（ピリオドの後）に ___ を置くこと
- 接続副詞は接続詞ではない。カンマだけで前の節とつながないこと（en ではピリオドで区切る）
- 否定副詞句は文中の正しい位置に ___ を置くこと
- jp と en の意味が対応すること
- meaning は英語初学者にもわかる平易な日本語で書くこと
- confusables は必ず2つ。似た表現や混同しやすい表現を選ぶこと
- テーマは仕事・日常・学校などバラけさせること
- JSON配列の順序は問ごとにランダムにすること`,
  };
}

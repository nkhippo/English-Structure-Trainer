import { categoryLabel, getExpressionsForLevel } from '../constants/framingExpressions.js';

function formatTargetList(targets) {
  return targets
    .map(
      (e, i) =>
        `${i + 1}. expr="${e.expr}" / 日本語の意味: ${e.jpHint} / 種類: ${categoryLabel(e.category)} / メモ: ${e.note}${e.isCrossLevel ? ' / ※タブ外正解' : ''}`,
    )
    .join('\n');
}

/**
 * Build prompt for phrase fill-in-blank quiz generation.
 * One API call produces questions with model answers and beginner-friendly feedback.
 */
export function buildPhraseGeneratePrompt(targets, levelLabel, levelId) {
  const n = targets.length;
  const tabBankList = getExpressionsForLevel(levelId).map((e) => e.expr).join(', ');

  return {
    system: `あなたは英語教育の専門家です。
指定された英語フレーズについて、3択穴埋めクイズの問題を作成してください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。`,

    user: `CEFR ${levelLabel} 向けのフレーズ3択クイズ用の穴埋め問題を ${n} 問作成してください。
以下の ${n} 個のフレーズを、それぞれちょうど1問ずつ使ってください（重複・省略・追加禁止）。
一部はタブ外のレベルのフレーズ（※タブ外正解）が含まれますが、expr はリストのとおりに使ってください。

タブ内フレーズバンク（${levelLabel}）: ${tabBankList}

${formatTargetList(targets)}

返却形式（JSONのみ、${n}要素の配列）:
[
  {
    "expr": "指定されたフレーズ（そのまま）",
    "jp": "自然な日本語文。このフレーズを使う場面を表す",
    "en": "英語文。フレーズ部分だけ ___ に置き換える（___ は1箇所のみ）",
    "distractors": ["誤答候補1", "誤答候補2"],
    "meaning": "初学者向けの意味説明（2〜3文。X/Y/Z などの専門用語は使わない）",
    "confusables": [
      { "phrase": "distractors[0]と同じ表現", "why": "なぜこの文では合わないか（3〜5文の詳細解説）" },
      { "phrase": "distractors[1]と同じ表現", "why": "なぜこの文では合わないか（3〜5文の詳細解説）" }
    ]
  }
]

distractors（3択の誤答2つ）のルール — 最重要:
- expr 自身は不可
- **confusables の phrase と distractors は必ず同じ2つ**（フィードバックで説明する語 = 選択肢に出す語）
- **意味・論理関係を履き違えやすい**ペアを選ぶ。例: as for の誤答に about（話題の切り出しと混同）や instead of（代わりに）— 文法カテゴリが違う no longer や because of のような無関係語は禁止
- バンク内フレーズに加え、学習者が混同しやすい **一般表現**（about, regarding, despite, since, but など）も distractors に使ってよい
- **スペルや発音が似ているだけ**のペアは禁止。例: as a result / as a result of、in addition / in addition to
- distractors の2つはどちらもこの文脈で一見ありそうに感じること
- ※タブ外正解の問は、distractors の少なくとも1つをタブ内フレーズバンクから選ぶこと

問題文（jp / en）のルール:
- jp は、正解だけでなく distractors も「ありえそう」に感じる文脈にすること（日本語だけ読んでどれが正解か迷う余地を残す）
- ただし en と jp の対応は正解 expr で成立すること
- en には ___ をちょうど1つだけ含めること。接続副詞は文と文のあいだ（ピリオドの後）に ___ を置くこと
- 接続副詞は接続詞ではない。カンマだけで前の節とつながないこと
- 否定副詞句は文中の正しい位置に ___ を置くこと
- meaning は英語初学者にもわかる平易な日本語で書くこと
- confusables の phrase は distractors と一致させること
- confusables.why（誤答の解説）— 最重要:
  - 各 why は **3〜5文**で、この英文・日本語文の文脈に即して **徹底的に論破**すること
  - 「意味が合いません」「文脈では不適切」だけの1文は **禁止**
  - 必ず含める: (1) その語の一般的な意味・役割 (2) この en の構造上の問題（文頭/文中・品詞・接続の観点）(3) jp のどの部分と噛み合わないか (4) 正解 expr との決定的な違い (5) 入れた場合の不自然さや誤解
  - 初学者向けの平易な日本語。専門用語（接続副詞・品詞名など）は使わず、言葉で説明すること
  - 誤答が一見正しそうに見える理由にも触れ、そのうえでなぜダメかを論理的に崩すこと
- テーマは仕事・日常・学校などバラけさせること
- JSON配列の順序は問ごとにランダムにすること`,
  };
}

/**
 * Second-pass prompt: thorough debunking for each wrong choice (when initial why is weak or missing).
 */
export function buildPhraseConfusableEnrichPrompt(items) {
  const blocks = items
    .map(
      (item, i) => `--- 問${i + 1} ---
正解 expr: ${item.expr}
日本語 jp: ${item.jp}
英文 en: ${item.en}
正解の意味説明: ${item.meaning}
誤答（2つ）: ${item.wrongPhrases.join(' / ')}`,
    )
    .join('\n\n');

  return {
    system: `あなたは英語教育の専門家です。
穴埋めクイズの誤答選択肢について、初学者向けに「なぜこの文では正解にならないか」を徹底的に論破する日本語解説を書いてください。
必ず有効なJSONのみを返してください。`,

    user: `以下 ${items.length} 問について、各誤答2つがなぜ不適切かを説明してください。

${blocks}

各 why のルール:
- **3〜5文**で詳しく書く。「意味が合いません」だけの1文は禁止
- 必ず含める: (1) その語の一般的な意味・役割 (2) この en の構造上の問題 (3) jp のどの部分と噛み合わないか (4) 正解 expr との決定的な違い (5) 入れた場合の不自然さや誤解
- 誤答が一見正しそうに見える理由にも触れ、そのうえで論理的に崩すこと
- 専門用語は避け、平易な日本語で

返却形式（JSON配列のみ、入力と同じ順序・${items.length}要素）:
[
  {
    "confusables": [
      { "phrase": "誤答1（入力と同じ表記）", "why": "3〜5文の詳細解説" },
      { "phrase": "誤答2（入力と同じ表記）", "why": "3〜5文の詳細解説" }
    ]
  }
]`,
  };
}

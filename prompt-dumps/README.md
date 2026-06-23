# プロンプト展開済みダンプ

`npm run dump-prompts` で `src/prompts/index.js` から再生成できます。

## 問題生成（`generate/`）

| ファイル | 内容 |
|---------|------|
| `generate/step{N}-default.md` | 各 STEP の既定疑問文数（`DEFAULT_QUESTION_TARGETS`） |
| `generate/step{N}-max.md` | スライダー最大（7）。`effectiveTarget` は `maxNatural` で上限 |

仕様: 優先順位ラダー + overlap 設計 + 疑問文ちょうど effectiveTarget（改修3）+ ちょうど7要素

## 答え合わせ（`check/`）

| ファイル | 内容 |
|---------|------|
| `check/step{N}.md` | `buildCheckPrompt()` の System/User（1問バッチのサンプル） |

採点は模範解答 `en` のみを100点基準とする。Step 3/4–6/7 で採点追記（`buildStepNCheckExtra`）が異なる。

## 実装の正

- 生成: `src/prompts/index.js` — `buildGeneratePrompt()`
- 採点: `src/prompts/index.js` — `buildCheckPrompt()`
- ポリシー: `src/constants/essences.js` — `STEP_QUESTION_POLICY`

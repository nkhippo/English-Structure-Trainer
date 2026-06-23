# 問題生成プロンプト（展開済み）

`npm run dump-prompts` で `src/prompts/index.js` の `buildGeneratePrompt()` から再生成できます。

| ファイル | 内容 |
|---------|------|
| `step{N}-default.md` | 各 STEP の既定疑問文数（`DEFAULT_QUESTION_TARGETS`） |
| `step{N}-max.md` | スライダー最大（7問）。`effectiveTarget` は `maxNatural` で上限 |

実装の正: `src/prompts/index.js`, `src/constants/essences.js`（`STEP_QUESTION_POLICY`）

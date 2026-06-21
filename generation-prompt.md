# 問題生成プロンプト仕様

実装の正: `src/prompts/index.js`（`buildGeneratePrompt`）

## API 設定

| 項目 | 値 |
|------|-----|
| モデル | `claude-haiku-4-5-20251001` |
| max_tokens | 8192 |
| 新規セット | 7問 |
| 弱点克服 | 前回問数 − 2（7→5→3→1） |

## 主要な変更点（エッセンス化）

1. User プロンプト先頭付近に **STEP_ESSENCE**（再利用原理）を注入
2. 各 STEP に **STEP_COVERAGE**（MECE網羅規則）を追加
3. `nuance` 末尾にエッセンス参照を1行必須
4. **enNative / nuanceNative は生成時に含めない**（UI オンデマンド生成）

## 返却 JSON（1問）

```json
{
  "jp": "...",
  "en": "...",
  "parts": [...],
  "nuance": "...（末尾にエッセンス参照1行）",
  "vocabHints": []
}
```

Step 7 のみ: `operationTag`, `cefr`, `thread`

## 弱点克服時の追加入力

- 前回答え合わせ Markdown
- **core 誤りタグ集計**（`errorTags` の core 層のみ。peripheral は除外）

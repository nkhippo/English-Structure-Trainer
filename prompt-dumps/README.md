# プロンプトダンプ — モード分離（改修5）

作業依頼: `work-request-mode-split.md`（mixed 廃止 → 平叙/疑問モード分離）

## 設計の要点

| 軸 | 内容 |
|----|------|
| モード | `declarative`（平叙7問・網羅 ON）/ `interrogative`（疑問5問・網羅 OFF）— **排他的** |
| Step 3–5 | UI トグルでモード選択 |
| Step 6–7 | 平叙のみ（7問） |
| Step 7 | operationTag から「疑問」を撤去（6操作） |

## 変更ファイル（実装の正）

| ファイル | 役割 |
|---------|------|
| `src/prompts/index.js` | `generationMode` で分岐 |
| `src/prompts/questionPractice/declarative.js` | 平叙セット（STEP_COVERAGE 注入） |
| `src/prompts/questionPractice/interrogativeOnly.js` | 疑問ドリル（全問疑問） |
| `src/constants/essences.js` | `STEP_MODES`, `getSetSizeForMode()` |
| `src/api/claude.js` | モード別バリデーション・修復 |
| `src/App.jsx` | 平叙/疑問トグル |

## プロンプトダンプ一覧

再生成: `npm run dump-prompts`

### 問題生成 — `generate/`

| ファイル | 意味 |
|---------|------|
| `generate/step{N}-declarative.md` | 平叙モード（7問） |
| `generate/step{3,4,5}-interrogative.md` | 疑問ドリル（5問） |

### 答え合わせ — `check/`

| ファイル | 意味 |
|---------|------|
| `check/step{N}.md` | `buildCheckPrompt()` の System/User |

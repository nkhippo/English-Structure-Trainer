---
id: pj-2026-06-21-f28b
aliases:
- pj-2026-06-21-f28b
title: 問題生成プロンプト仕様
created: '2026-06-21'
---
# 問題生成プロンプト仕様

実装の正: `src/prompts/index.js`（`buildGeneratePrompt`）

---

## API 設定

| 項目 | 値 |
|------|-----|
| モデル | `claude-haiku-4-5-20251001` |
| max_tokens | 8192 |
| 新規セット（平叙） | 7問（`DECLARATIVE_SET_SIZE`） |
| 新規セット（疑問ドリル） | 5問（`INTERROGATIVE_DRILL_SIZE`、Step 3–5 のみ） |
| 弱点克服 | 前回問数 − 2（7→5→3→1） |
| 返却形式 | JSON 配列のみ（assistant prefill `[`） |
| テーマ | 18テーマプールから各問1つ（セット内で重複回避） |
| 参考例 | `steps.js` のシード問題からランダム2問を注入 |

---

## 呼び出しパターン

| パターン | 問数 | 追加入力 |
|---------|------|---------|
| 新規作成（Step 3〜5） | 平叙7問 / 疑問5問 | `generationMode` + `buildDeclarativeSection` / `buildInterrogativeOnlySection` |
| 新規作成（Step 6〜7） | 平叙7問のみ | `generationMode: declarative` 固定 |
| 弱点克服（再出題） | 前回 −2 | 前回答え合わせ Markdown + core 誤りタグ集計 |

> **mixed モード（1セット内に平叙＋疑問混在）は廃止**（改修5）。Step 3–5 は UI トグルで平叙/疑問を排他的に選択する。

---

## 返却 JSON（1問）

```json
{
  "jp": "自然な日本語文",
  "en": "採点基準となる模範英訳（文法・構造）",
  "parts": [{ "t": "...", "r": "X|V|Y|Z", "n": "...", "inner": [] }],
  "nuance": "...（末尾に STEP エッセンス参照1行）",
  "vocabHints": [{ "jp": "辞書形", "en": "原形・単数形" }]
}
```

- **enNative / nuanceNative は生成時に含めない**（UI オンデマンドで `buildEnNativePrompt`）
- **Step 7 のみ追加:** `operationTag`, `cefr`, `thread`

---

## 共通品質要件（全 Step）

1. 生成手順: 自然な `jp` → `en` + `parts` → `nuance`（英文語順に jp を無理やり合わせない）
2. `parts[].t` をスペース連結 → `en` と完全一致
3. 句・節チャンクには `inner` 必須（最大2段ネスト）
4. `vocabHints`: 1問あたり 3〜6語。文法語（接続詞・関係詞等）は除外
5. `nuance` 末尾に STEP エッセンス（再利用原理）を1行必須
6. 模範 `en` は「意味が通る訳」ではなく **当該 Step の文法ポイントを最も明確に示す訳**

---

## Step 別の追加制約（生成）

### Step 3 — 動詞の変化（平叙セット）

**`buildStep3GenerateExtra` + `STEP_COVERAGE[3]`（declarative モード）**

- 全問 mood=declarative。否定文を1問以上含めてもよい
- MECE: 時制×相をサンプリング網羅

**疑問ドリル（interrogative モード・5問）:** yesno と wh の両方を含む全問疑問。構造網羅は要求しない。

### Step 4〜6

- **平叙モード:** Step 固有の `STEP_COVERAGE` をセット全体で網羅
- Step 4: 同じ形・異なる役割を最低2問、minimal pair 1組
- Step 5: 関係代名詞・関係副詞・what名詞節・同格that を別カテゴリでカバー、gap対比1問
- Step 6: キーセンテンス型（Y+Z共起）最低1問、副詞節・名詞節・等位接続を網羅
- **疑問ドリル（Step 4–5 のみ）:** 全問疑問・構造網羅は対象外

### Step 7 — 発展構文（平叙のみ）

- 各問に `operationTag`（比較 / 仮定法 / 倒置・強調 / 否定 / 話法 / 省略）— **「疑問」タグは廃止**
- 1セットで **2〜3種類の operationTag を混在**（直前セットと同じ構成を避ける）
- **最低1問** は「倒置/強調」＋否定副詞句による倒置
- 全問に `cefr` / `thread`（糸1=助動詞前置 / 糸2=空所+移動）

---

## 弱点克服時の追加入力（`buildFollowUpReviewSection`）

- 前回答え合わせ Markdown 全文
- **core 誤りタグ集計**（`errorTags` の core 層のみ。peripheral は弱点シグナルから除外）
- 出題は **現在の Step の範囲内** に限定（他 Step を混ぜない）
- 疑問文数の指定は **なし**（弱点パターン優先）

---

## 関連ファイル

| ファイル | 内容 |
|---------|------|
| `src/prompts/questionPractice/` | declarative / interrogativeOnly モード別プロンプト |
| `src/constants/essences.js` | STEP_ESSENCE / STEP_COVERAGE / ERROR_TAXONOMY |
| `src/constants/steps.js` | Step 定義・シード問題 |
| `src/constants/step7.js` | operationTag・糸1/糸2・倒置リスト |
| `essences.md` | エッセンス・タクソノミーの人間向け要約 |
| `prompt-review-brief.md` | Claude 相談用の統合資料 |

*最終更新: 2026-06-23（改修5: mixed廃止・モード分離）*

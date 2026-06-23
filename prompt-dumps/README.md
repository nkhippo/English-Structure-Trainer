# 疑問文練習（production）— 実装サマリーとプロンプトダンプ

作業依頼: `work-request-question-practice.md`（P0 + 改修2 + 改修3）

## 設計の要点

| 軸 | 内容 |
|----|------|
| 構造ターゲット軸 ⊥ 法(mood)軸 | 疑問は STEP の構造を差し替えず、同じ構造に疑問変形をかぶせる |
| overlap | 疑問と網羅を別スロットに積まず、1枠で両立（Step5: 疑問に関係代名詞/副詞、what・同格は平叙側） |
| 疑問数 | **ちょうど `effectiveTarget` 問**（下限のみ不可・上振れも不可。不足時のみ `_questionNote`） |
| 件数不変 | 返却 JSON は **ちょうど 7 要素** |

## 変更ファイル（実装の正）

| ファイル | 役割 |
|---------|------|
| `src/prompts/index.js` | 優先順位ラダー、overlap、Step5 カテゴリ制約、自然さ/スコープ条件、`buildInterrogativeRegeneratePrompt` |
| `src/constants/essences.js` | `STEP_QUESTION_POLICY`、`getEffectiveQuestionTarget()`、`getMaxNaturalForStep()` |
| `src/api/claude.js` | 疑問数が `effectiveTarget` と不一致（不足/超過）のときコンパクト再生成 |
| `src/App.jsx` | 疑問文目標数ステッパー（0〜`maxNatural`）、生成後の疑問文カウント表示 |
| `prompt-dumps/` | 本 README + 展開済みプロンプト（レビュー・確認用。**実装の正ではない**） |

## STEP 別パラメータ

| STEP | maxNatural | 許可タイプ | preferred | 備考 |
|------|-----------|-----------|-----------|------|
| 3 | 7 | yesno, wh | mix | 動詞情報を問う |
| 4 | 5 | yesno, wh | wh | 準動詞/前置詞句スロット |
| 5 | **3** | **yesno のみ** | yesno | what・同格that は平叙でカバー。gap 対比必達 |
| 6 | 5 | yesno, wh, indirect | indirect | 名詞節 X として埋め込み |
| 7 | 2 | operationTag | — | operationTag「疑問」= 疑問文 |

- `effectiveTarget = min(ステッパー値, maxNatural)`
- 既定値（`DEFAULT_QUESTION_TARGETS`）: 各 STEP **2**（ステッパー初期値）

## プロンプトダンプ一覧

再生成: `npm run dump-prompts`

### 問題生成 — `generate/`

| ファイル | 意味 |
|---------|------|
| `generate/step{N}-default.md` | 既定疑問数（`DEFAULT_QUESTION_TARGETS`） |
| `generate/step{N}-max.md` | 各 STEP の **maxNatural 上限** で生成したプロンプト |

生成元: `buildGeneratePrompt()` in `src/prompts/index.js`

### 答え合わせ — `check/`

| ファイル | 意味 |
|---------|------|
| `check/step{N}.md` | `buildCheckPrompt()` の System/User（1問バッチ・シード例 + 意図的不正解解答） |

採点は模範 `en` のみ 100 点基準。Step 3 / 4–6 / 7 で採点追記が異なる。

## 確認チェックリスト

- [ ] Step5 `generate/step5-max.md`: `effectiveTarget=3`、ラダー③が「ちょうど 3 問・超過不可」
- [ ] 7 問固定・平叙側で what/同格that・gap 対比の記述がある
- [ ] `check/step5.md` に採点プロンプト全文がある
- [ ] UI ステッパーが `maxNatural` を超えられない（Step5 は最大 3）
- [ ] 生成後「疑問文: N問 / 目標 M問」が表示される

## 受け入れ（改修3 抜粋）

- 疑問文数が **ちょうど effectiveTarget**（Step5 でステッパー 3 → 疑問 3・平叙 4）
- 4 カテゴリ（関係代名詞・関係副詞・what・同格that）がセット全体で各 1 問以上
- 関係代名詞への過剰集中・同型 Yes/No 連発が抑止されている
- 抽象等式疑問（「理由は…ことですか」型）が出ない

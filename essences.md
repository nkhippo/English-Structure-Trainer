---
id: pj-2026-06-21-8ca1
aliases:
- pj-2026-06-21-8ca1
title: エッセンス・誤りタクソノミー仕様
created: '2026-06-21'
---
# エッセンス・誤りタクソノミー仕様

人間向けドキュメント。実装の正: `src/constants/essences.js`  
教科書全体地図との整合: `src/assets/textbook.md` 付録A

---

## 誤りタクソノミー（2層）

**core 層＝構造の誤り＝次の出題に寄与／peripheral 層＝表層の誤り＝出題に寄与させない**

| code | 層 | 意味 | 主STEP |
|------|-----|------|--------|
| skeleton | core | 骨格（S+V+O/C の選択・語順） | 3 |
| verbInfo | core | 動詞情報（時制×相×態×法/助動詞） | 3 |
| role | core | 役割（X/Y/Z のどれか・どの形で実現するか） | 4 |
| attachment | core | 係り受け（前置/後置・かかる先） | 4,5 |
| nesting | core | 接続・ネスト（等位/従属・節の入れ子） | 6 |
| advanced | core | 発展操作（比較・仮定法・倒置/強調・否定・話法・省略） | 7 |
| functionWord | peripheral | 冠詞 a/the・前置詞 in/on/at の語選択 | 全 |
| lexical | peripheral | スペル・語彙・表現選択の誤り | 全 |

### MECE の扱い

- **core 6種**は機能レベルで MECE（文レベルでの共起は許容）。例: 関係詞節の位置誤りは `role` と `attachment` が同時に立ちうる → **タグは1つに丸めず、該当するものを過不足なく列挙**
- **core と peripheral** は直交する別軸。前置詞句の「作れるか・どこに置くか」は core、`どの前置詞を選ぶか` は peripheral
- peripheral は**採点の点数**から除外しない。除外するのは**弱点克服の再出題シグナル**のみ

---

## STEP エッセンス（生成 nuance 末尾で参照）

| Step | 原理 |
|------|------|
| 3 | 疑問=2操作（糸2:空所を文頭へ / 糸1:助動詞を前に）。否定=同じ助動詞に not。**疑問と否定は対称** |
| 4 | **形が同じでも、位置と働きで役割(X/Y/Z)が決まる**（役割≠形） |
| 5 | 後置修飾=head-initial。**関係詞節=gapあり／同格節=gapなし**。what は先行詞内蔵 |
| 6 | 節も小さな文（内部に X+V）→再帰。等位 vs 従属。従属節の役割は X/Y/Z で MECE |
| 7 | 糸1=助動詞前置／糸2=空所+移動。**糸は部分的統一原理**（比較・省略・話法は糸に乗らない） |

Step 7 の糸定義の実装: `src/constants/step7.js`（`STEP7_THREADS`）

---

## STEP_MODES（改修5）

| Step | 選べるモード | 問数 |
|------|------------|:---:|
| 3,4,5 | declarative / interrogative | 7 / 5 |
| 6,7 | declarative のみ | 7 |

`STEP_QUESTION_POLICY.maxNatural` は interrogative モードの**可用性根拠**（実行時 cap には使わない）。

---

各セット（7問）内で守る MECE 出題規則。詳細は `src/constants/essences.js` の `STEP_COVERAGE`。

| Step | 規則（要約） |
|------|-------------|
| 3 | 疑問/否定 最低2問（うち1問 wh疑問）。時制×相をサンプリング網羅 |
| 4 | 同じ形を異なる役割で最低2問。役割≠形の minimal pair を1組 |
| 5 | 関係代名詞・関係副詞・what名詞節・同格that を別カテゴリでカバー |
| 6 | キーセンテンス型（Y+Z共起）を最低1問。副詞節・名詞節・等位接続を網羅 |
| 7 | operationTag サンプリング（直前セットと同じタグ構成を避ける） |

---

## 弱点克服フロー

1. 採点時に `errorTags`（core + peripheral 両方）を JSON で付与
2. Markdown エクスポートに **誤りタグ** と **弱点タグ（core集計）** を記録
3. 弱点克服生成時は **core タグのみ** を弱点シグナルとして集計（peripheral 除外）
4. `errorTags` が無い旧 Markdown は本文解析にフォールバック

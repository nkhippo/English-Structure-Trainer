# エッセンス・誤りタクソノミー仕様

人間向けドキュメント。実装の正: `src/constants/essences.js`

## 誤りタクソノミー（2層）

| code | 層 | 意味 | 主STEP |
|------|-----|------|--------|
| skeleton | core | 骨格（S+V+O/C） | 3 |
| verbInfo | core | 動詞情報（時制×相×態×法） | 3 |
| role | core | X/Y/Z 役割・形 | 4 |
| attachment | core | 係り受け（前置/後置） | 4,5 |
| nesting | core | 接続・ネスト | 6 |
| advanced | core | 発展操作 | 7 |
| functionWord | peripheral | 冠詞・前置詞の語選択 | 全 |
| lexical | peripheral | スペル・語彙・表現 | 全 |

- **core** → 弱点克服の再出題に寄与
- **peripheral** → 採点には影響するが、再出題の弱点シグナルからは除外

## STEP エッセンス（nuance 末尾で参照）

| Step | 原理 |
|------|------|
| 3 | 疑問=2操作（糸2/糸1）。否定=助動詞+not。疑問と否定は対称 |
| 4 | 形が同じでも位置と働きで X/Y/Z が決まる（役割≠形） |
| 5 | 後置修飾=head-initial。関係詞節=gapあり／同格=g gapなし |
| 6 | 節は小さな文（再帰）。等位 vs 従属。従属節は X/Y/Z でMECE |
| 7 | 糸1=助動詞前置／糸2=空所+移動（部分的統一原理） |

## STEP 網羅規則（STEP_COVERAGE）

各セット内で守る MECE 出題規則。詳細は `src/constants/essences.js` の `STEP_COVERAGE` を参照。

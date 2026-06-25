import { getCoverageForStep } from '../../constants/essences.js';

export const STEP_CENTER_STRUCTURE = {
  3: '動詞情報（時制・相・態・助動詞）',
  4: '役割(X/Y/Z)と準動詞/前置詞句',
  5: '関係詞節（後置修飾）',
  6: '節のネスト（等位/従属・名詞節/関係詞節/副詞節）',
  7: '発展操作（operationTag）',
};

export const STEP_COVERAGE_LADDER = {
  3: '時制×相のサンプリング網羅',
  4: '役割≠形の minimal pair・同形異役割',
  5: '関係代名詞・関係副詞・what名詞節・同格that',
  6: 'Y+Zキーセンテンス型・副詞節(Z)・名詞節(X)・等位接続',
  7: 'operationTag 2〜3種混在・倒置必須',
};

export const STEP_SCOPE_EXCLUSIONS = {
  3: '関係詞節・節ネスト・発展操作',
  4: '関係詞節・節ネスト・発展操作',
  5: '分詞・副詞節・準動詞（to do/-ing）が主目的の文',
  6: '関係詞単体練習・発展操作が主目的の文',
  7: 'Step 3〜6 の基礎構造が主目的の文',
};

const STEP_SCOPE_ANTIPATTERNS = {
  3: '- × Step3で動名詞句が主役の問を増やしすぎない（Step4寄り）',
  4: '- × Step4で準動詞/前置詞句が主練習点にならない骨格のみの問を出さない',
  5: '- × Step5に副詞節(when/because…が主役)・分裂文(it is…that)を主練習点にしない',
  6: '- × Step6で「〜のですが。」「知りたい…ですか」のハイブリッド・未完文を作らない',
  7: '- × Step7で裸の不定詞主役・基本wh疑問(What did he…)のみで終わらせない',
};

export function buildNaturalnessAbsoluteSection(step, n) {
  const exclusion = STEP_SCOPE_EXCLUSIONS[step] ?? '他STEPの構造';
  const center = STEP_CENTER_STRUCTURE[step] ?? '当STEPの中心構造';
  const antiPattern = STEP_SCOPE_ANTIPATTERNS[step] ?? '';

  return `
自然さの絶対条件（網羅・テーマより上位。違反する文は破棄して書き直す）:
- 母語話者が日常で実際に言う文か？を最終チェック。少しでも翻訳調・曖昧なら書き直す。
- jp は必ず**完結した1文**にする。「〜のですが。」「〜けれども。」だけで終えない。
- 間接疑問フレーム（〜かどうか／知りたい）と直接疑問（〜ですか）を混ぜない。
  ×「〜知りたいと思っていますか」→ ○「〜かどうか知りたい」または「〜知りたいですか」
- whether 型は「〜かどうか、（誰かに）確認したい／知りたい」で完結させる。
- ×「住んでいない状態が続いていますか」のような**過剰技巧** → 平易な言い回しにする。
- there-be 直訳調を避ける（×「多くの議論があるでしょう」→ 具体的な動詞で）。
- 補語・主語に抽象名詞を置くときは曖昧さを残さない（×「問題は、部門間で誤解が生じることです」→ 何の誤解かを具体化）。
- **抽象名詞（理由・問題・目的など）を別の抽象節（〜こと）と等式にする曖昧文を避ける。**
  ×『その企画が成功する理由は、彼が正確に理解していることですか？』→『何が／何を』が具体的に分かる文にする。
- 助詞の不自然な使用を避ける（×「降雪があった日には数が減少した」→「雪が降った日は…」等の自然な接続）。
- 時制を不必要に過去へ偏らせない（関係詞・句の練習に過去は必須ではない。現在・現在完了も混ぜる）。

スコープの絶対条件:
- 全${n}問が「${center}」を主たる練習点にすること。
- 他STEPの構造（${exclusion}）が文の主目的になっている文を混ぜない。
${antiPattern}`;
}

export function buildDeclarativePriorityLadder(step, n) {
  const center = STEP_CENTER_STRUCTURE[step] ?? '当STEPの中心構造';
  const coverage = STEP_COVERAGE_LADDER[step] ?? getCoverageForStep(step);
  const gapContrastLine = step === 5
    ? `\n必達（Step5）: ${n}問のうち**最低1問**は「関係詞節(gap有) vs 同格節(gap無)」を対比し、Step5エッセンス（gapの有無）を体現する`
    : '';

  return `
優先順位（平叙セット — 上が絶対。下位が上位と衝突したら上位を優先）:
1. ちょうど${n}問を返す（多くても少なくてもならない）
2. 各文が母語話者に自然な日本語であり、かつ当STEPの中心構造（Step${step}=${center}）が主たる練習点であること
3. **全問 mood=declarative（平叙文）**。疑問文は1問も含めない
4. ${coverage} をセット全体で網羅${gapContrastLine}
5. テーマ多様性`;
}

export function buildInterrogativePriorityLadder(step, n) {
  const center = STEP_CENTER_STRUCTURE[step] ?? '当STEPの中心構造';

  return `
優先順位（疑問ドリル — 上が絶対。下位が上位と衝突したら上位を優先）:
1. ちょうど${n}問を返す（多くても少なくてもならない）
2. **全問 mood=interrogative（疑問文）**。平叙文は1問も含めない
3. 各文が自然な日本語かつ当STEPの中心構造（Step${step}=${center}）を内包した疑問文であること
4. questionType の多様性（同型連発禁止）
5. テーマ多様性
※ 本セッションは疑問 production 特化。構造網羅（4カテゴリ・Y+Z 等）は要求しない`;
}

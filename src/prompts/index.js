import {
  STEP7_OPERATION_TAGS,
  STEP7_INVERSION_NEGATIVE_ADV,
  getLastStep7TagSet,
} from '../constants/step7.js';
import {
  getEssenceForStep,
  getCoverageForStep,
  formatErrorTaxonomyForPrompt,
  formatQuestionPolicyForPrompt,
  getDefaultQuestionTarget,
  getEffectiveQuestionTarget,
  CORE_ERROR_CODES,
} from '../constants/essences.js';
import { formatCompressedParts } from '../utils/parts.js';

// Prompt templates for Claude API calls.
// Both prompts instruct Claude to return JSON-only responses
// to enable reliable parsing.

/**
 * Prompt for generating new translation exercises.
 * Claude returns a JSON array of Exercise objects.
 *
 * Exercise shape:
 *   { jp: string, en: string, parts: Part[], nuance?: string, enNative?: string, nuanceNative?: string, vocabHints?: { jp: string, en: string }[] }
 *
 * Part shape (recursive):
 *   { t: string, r: "X"|"V"|"Y"|"Z", n: string, inner?: Part[] }
 *
 * Rules for parts:
 *   - Top-level parts[].t values concatenated with spaces must reconstruct en exactly
 *   - inner[].t values concatenated with spaces must equal parent t (when inner is present)
 *   - r must be one of: X (noun role), V (verb), Y (adjective role), Z (adverb role)
 *   - n is a brief Japanese note: grammatical role, plus why this form/placement is chosen when relevant
 *   - inner shows nested X/Y/Z inside Y/Z/X chunks (relative clauses, adverb clauses, noun clauses)
 *   - nuance explains why en is the 100-point model answer (word order, phrasing, etc.)
 */
const THEME_POOL = [
  '仕事・職場',
  '旅行・観光',
  '料理・食べ物',
  '自然・天気',
  '買い物・お金',
  '学校・勉強',
  '健康・スポーツ',
  '趣味・娯楽',
  '家族・友人',
  'テクノロジー',
  '文化・芸術',
  '交通・移動',
  '住まい・家具',
  '動物・ペット',
  '季節・イベント',
  '地域・都市',
  '医療・体調',
  '環境・社会',
];

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomItems(items, count) {
  return shuffleArray(items).slice(0, Math.min(count, items.length));
}

function formatSeedExamples(exercises) {
  return pickRandomItems(exercises || [], 2)
    .map((ex, i) => `[例${i + 1}]\n  日本語: ${ex.jp}\n  英語: ${ex.en}`)
    .join('\n\n');
}

function formatThemeAssignment(n) {
  return pickRandomItems(THEME_POOL, n)
    .map((theme, i) => `  問${i + 1}: ${theme}`)
    .join('\n');
}

const STEP_CENTER_STRUCTURE = {
  3: '動詞情報（時制・相・態・助動詞）',
  4: '役割(X/Y/Z)と準動詞/前置詞句',
  5: '関係詞節（後置修飾）',
  6: '節のネスト（等位/従属・名詞節/関係詞節/副詞節）',
  7: '発展操作（operationTag）',
};

const STEP_COVERAGE_LADDER = {
  3: '時制×相のサンプリング網羅',
  4: '役割≠形の minimal pair・同形異役割',
  5: '関係代名詞・関係副詞・what名詞節・同格that',
  6: 'Y+Zキーセンテンス型・副詞節(Z)・名詞節(X)・等位接続',
  7: 'operationTag 2〜3種混在・倒置必須',
};

const STEP_QUESTION_OVERLAP_HINT = {
  3: '各疑問文でも動詞情報（時制・相・態・助動詞）が学習ポイントになるよう設計',
  4: '疑問文の骨格内に to do / -ing / 前置詞句を載せる',
  5: '各疑問文の Y に関係代名詞節または関係副詞節を載せる（what名詞節・同格that は平叙側でカバー）',
  6: '間接疑問の wh/if 名詞節(X) や Y+Z キーセンテンス型を疑問文に載せる',
  7: 'operationTag「疑問」の問に発展操作の糸を載せる',
};

const STEP_SCOPE_EXCLUSIONS = {
  3: '関係詞節・節ネスト・発展操作',
  4: '関係詞節・節ネスト・発展操作',
  5: '分詞・副詞節・準動詞（to do/-ing）が主目的の文',
  6: '関係詞単体練習・発展操作が主目的の文',
  7: 'Step 3〜6 の基礎構造が主目的の文',
};

function buildPriorityLadderSection(step, n, effectiveTarget) {
  const center = STEP_CENTER_STRUCTURE[step] ?? '当STEPの中心構造';
  const coverage = STEP_COVERAGE_LADDER[step] ?? getCoverageForStep(step);
  const declarativeCount = n - effectiveTarget;
  const gapContrastLine = step === 5
    ? `\n必達（Step5）: ${n}問のうち**最低1問**は「関係詞節(gap有) vs 同格節(gap無)」を対比し、Step5エッセンス（gapの有無）を体現する（平叙文で可）`
    : '';

  return `
優先順位（上が絶対。下位が上位と衝突したら上位を優先）:
1. ちょうど${n}問を返す（多くても少なくてもならない）
2. 各文が母語話者に自然な日本語であり、かつ当STEPの中心構造（Step${step}=${center}）が主たる練習点であること
3. 当STEP範囲の疑問文を**ちょうど ${effectiveTarget} 問**にする（**超過も不足もしない**。不足時のみ減らして _questionNote）。残り ${declarativeCount} 問は平叙文（mood=declarative）
4. ${coverage} をセット全体で網羅（疑問・平叙のどちらが担ってもよい）${gapContrastLine}
5. テーマ多様性
※ 4 が自然に満たせない場合のみ削り、3 が自然に満たせない場合のみ _questionNote に記録する（疑問文の**上振れは不可**）`;
}

function buildCoverageResponsibilitySection(step, n, effectiveTarget) {
  const declarativeCount = n - effectiveTarget;
  if (step === 5) {
    return `
- 関係詞4カテゴリの網羅と「関係詞節 vs 同格節」の対比(1問)は、**残りの平叙文（${declarativeCount}問）で必ず満たす**。疑問文は網羅に寄与してよいが、**網羅の達成責任は平叙側に置く**（疑問はYes/Noコピュラに偏り同格that・gap対比を締め出すため）
- **effectiveTarget（${effectiveTarget}問）を超える疑問文を作らない。** 超過しそうなら超過分は平叙文に戻す。残りスロットは必ず mood=declarative`;
  }
  return `
- **effectiveTarget（${effectiveTarget}問）を超える疑問文を作らない。** 超過しそうなら超過分は平叙文に戻す。残り ${declarativeCount} 問は必ず平叙文（mood=declarative）`;
}

const STEP_SCOPE_ANTIPATTERNS = {
  3: '- × Step3で動名詞句が主役の問を増やしすぎない（Step4寄り）',
  4: '- × Step4で準動詞/前置詞句が主練習点にならない骨格のみの問を出さない',
  5: '- × Step5に副詞節(when/because…が主役)・分裂文(it is…that)を主練習点にしない',
  6: '- × Step6で「〜のですが。」「知りたい…ですか」のハイブリッド・未完文を作らない',
  7: '- × Step7で裸の不定詞主役・基本wh疑問(What did he…)のみで終わらせない',
};

function buildNaturalnessAbsoluteSection(step, n, effectiveTarget = 0) {
  const exclusion = STEP_SCOPE_EXCLUSIONS[step] ?? '他STEPの構造';
  const center = STEP_CENTER_STRUCTURE[step] ?? '当STEPの中心構造';
  const moodGuard = effectiveTarget > 0
    ? `\n- **法(mood)軸は構造軸を侵食しないこと**。同型の疑問文（例: Step5『[名詞＋関係詞節]は〜ですか』）を effectiveTarget（${effectiveTarget}問）を超えて並べない。構造（関係詞サブタイプ等）のばらつきを優先する`
    : '';
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
- 他STEPの構造（${exclusion}）が文の主目的になっている文を混ぜない。${moodGuard}
${antiPattern}`;
}

function buildStep3GenerateExtra(n, questionTarget = 0) {
  const useQuestionPractice = getEffectiveQuestionTarget(3, questionTarget) > 0;
  const interrogativeBlock = useQuestionPractice
    ? `- 疑問文の件数・種類は上記「疑問文練習」セクションに従う（本節の旧「少なくとも2問は疑問/否定」ルールは適用しない）
- 否定文のみの問は mood=declarative とする（否定疑問は mood=interrogative 可）`
    : `- ${n}問のうち **少なくとも2問** は疑問文または否定文を含める
- 疑問文：Yes/No疑問（助動詞前置）と wh疑問（空所を文頭へ）の両方をセット内でカバーする
- 否定文：助動詞 + not（短縮形 don't / doesn't / didn't / hasn't 等）を含める
- 日本語 jp には「〜ですか」「〜ません」「〜ない」など疑問・否定の手がかりを自然に含める`;
  const coverageBlock = useQuestionPractice
    ? `- 時制×相は「現在/過去 × 単純/進行/完了」をサンプリング網羅`
    : getCoverageForStep(3);

  return `
Step 3 固有の出題制約（必須）:
${interrogativeBlock}
- 時制・相・態・助動詞の問題も引き続きバランスよく含める

Step 3 MECE網羅規則:
${coverageBlock}`;
}

function buildStep4GenerateExtra() {
  return `
Step 4 固有の出題制約（必須）:
${getCoverageForStep(4)}`;
}

function buildStep5GenerateExtra(n, questionTarget = 0) {
  const useQuestionPractice = getEffectiveQuestionTarget(5, questionTarget) > 0;
  const categoryBlock = useQuestionPractice
    ? `
- **what名詞節・同格that は自然な Yes/No 疑問にしにくい。これらは平叙文スロットで確実にカバーする。**
- 疑問文(Yes/No)が担うのは主に**関係代名詞・関係副詞**。**疑問文同士で同じ関係詞カテゴリに偏らせない**（関係代名詞ばかりにしない）。
- 4カテゴリ（関係代名詞・関係副詞・what名詞節・同格that）は、疑問・平叙合わせて**セット全体で各1問以上**。**関係詞節 vs 同格節の対比問題（平叙）を1問必ず含める**。`
    : '';

  return `
Step 5 固有の出題制約（必須）:
${getCoverageForStep(5)}${categoryBlock}`;
}

function buildStep6GenerateExtra() {
  return `
Step 6 固有の出題制約（必須）:
${getCoverageForStep(6)}`;
}

function buildStep7GenerateExtra(n, lastTagSet) {
  const inversionList = STEP7_INVERSION_NEGATIVE_ADV.join(' / ');
  const lastTagsNote = lastTagSet?.length
    ? `直前セットの操作タグ構成: ${lastTagSet.join('、')} — **同じタグの組み合わせを繰り返さない**`
    : '（直前セットなし — 2〜3種類の操作タグをバランスよく混在させる）';

  return `
Step 7 固有の出題制約（必須）:
- 各問に operationTag を1つ付与（${STEP7_OPERATION_TAGS.join(' / ')} のいずれか）
- 1セット（${n}問）で **2〜3種類の operationTag を混在** させる。同じタグが3問以上連続しないよう並べを工夫する
- ${lastTagsNote}
- **最低1問** は operationTag「倒置/強調」かつ、否定副詞句（${inversionList} 等）による倒置を含める
- 全問に cefr ラベル（"A2"|"B1"|"B2"|"C1"）を付与。比較・仮定法の基本型は B1〜B2 中心、倒置・話法・省略は B2〜C1 中心
- 各問に thread を付与（"糸1" または "糸2"）。nuance の末尾に、このSTEPのエッセンス（糸1または糸2）のどれを使っているかを1行で必ず示す
- 仮定法・話法など文が長くなりやすい操作は、日本語 jp を短く設計して文長上限を守る
- 否定副詞句リストはフレーズバンク（CEFR別）と対応。倒置問題では文頭配置＋助動詞前置を模範解答に反映する

返却形式への追加フィールド（Step 7 のみ必須）:
  "operationTag": "比較|仮定法|疑問|倒置/強調|否定|話法|省略",
  "cefr": "A2|B1|B2|C1",
  "thread": "糸1|糸2"`;
}

function buildInterrogativeCheckExtra() {
  return `
疑問文採点の補足:
- 疑問文の解答では、糸1（助動詞前置）または糸2（空所＋wh移動）のどちらの操作が求められているかに触れてよい
- 助動詞前置・語順の誤り（糸1）→ errorTags に skeleton（助動詞の形自体の誤りは verbInfo）
- 空所・wh移動の誤り（糸2）→ errorTags に skeleton（役割取り違えを伴えば role）`;
}

function buildStep3CheckExtra() {
  return `
Step 3 採点の補足:
- 疑問文・否定文の解答でも、助動詞の形・語順が正しければ意味が通れば高得点とする${buildInterrogativeCheckExtra()}`;
}

function buildStep7CheckExtra() {
  return `
Step 7 採点の補足（必須）:
- **構文の種類は問わず、正しい変形であれば正解とする**（例：it-cleft と what-cleft の両方、仮定法の別表現など）
- 操作タグ（比較・仮定法・疑問・倒置/強調・否定・話法・省略）に関わらず、意味と文法が正しければ満点に近い評価とする
- feedback で模範解答の妥当性を説明するとき、可能なら「糸1（助動詞前置）」または「糸2（空所＋移動）」のどちらの再利用かに1行触れる${buildInterrogativeCheckExtra()}`;
}

function buildStep3QuestionExtra(effectiveTarget) {
  return `
Step 3 疑問文の設計（必須）:
- **否定文のみは mood=interrogative にカウントしない**（否定疑問 "Don't you...?" / "Didn't he...?" は可）
- ${effectiveTarget}問のうち **yesno と wh の両方**を含める（preferred: mix）
- jp は「〜ですか」「〜でしょうか」等で疑問の手がかりを自然に含める
- 例（yesno・時制）: jp「彼女は毎日走っていますか」→ en "Does she run every day?" / mood=interrogative / questionType=yesno / thread=糸1
- 例（wh・過去）: jp「彼は何を食べましたか」→ en "What did he eat?" / mood=interrogative / questionType=wh / thread=糸2
- 例（否定疑問）: jp「彼はまだ来ていないのですか」→ en "Hasn't he arrived yet?" / mood=interrogative / questionType=yesno / thread=糸1
- 時制×相の MECE 網羅と**両立**させる（各疑問文でも動詞情報が学習ポイントになるよう設計）`;
}

function buildStep4QuestionExtra(effectiveTarget) {
  return `
Step 4 疑問文の設計（必須）:
- **wh 疑問で準動詞/前置詞句スロットを問う**（preferred: wh）。Yes/No も可
- jp は「何を〜したいですか」「どこへ〜しますか」等、スロットが特定できる疑問文にする
- 例（wh・to不定詞）: jp「あなたは何をしたいですか」→ en "What do you want to do?" / mood=interrogative / questionType=wh / thread=糸2
- 例（yesno・動名詞）: jp「彼は公園で走るのが好きですか」→ en "Does he like running in the park?" / mood=interrogative / questionType=yesno / thread=糸1
- ${effectiveTarget}問のうち **過半数は wh** にする
- 役割≠形の minimal pair 網羅と**両立**（疑問文の骨格内に to do / -ing / 前置詞句を載せる）`;
}

function buildStep5QuestionExtra(effectiveTarget) {
  return `
Step 5 疑問文の設計（Yes/No のみ — 上限 ${effectiveTarget} 問）:
- **wh疑問は禁止**（関係詞=糸2 と gap 二重化を避ける）。Yes/No（糸1）のみ
- 関係詞節(Y)を内包したまま主骨格を疑問化する。担うのは主に**関係代名詞・関係副詞**
- **what名詞節・同格that は平叙文スロットでカバー**（疑問に載せない）
- jp は「〜ですか」で終え、英文は ? で終わる直接疑問
- 例: jp「その車を直した男はまだここにいますか」→ en "Is the man who fixed the car still here?" / mood=interrogative / questionType=yesno / thread=糸1
- 例: jp「昨日会った女性は医者ですか」→ en "Is the woman who we met yesterday a doctor?" / mood=interrogative / questionType=yesno / thread=糸1
- **同型の『[名詞＋関係詞節]は〜ですか』を effectiveTarget（${effectiveTarget}問）を超えて並べない**`;
}

function buildStep6QuestionExtra(effectiveTarget) {
  return `
Step 6 疑問文の設計（必須 — 間接疑問も疑問文練習にカウント）:
- **間接疑問は英文が平叙文・句点終わりでも mood=interrogative 必須**。questionType=indirect を付与
- jp には疑問の手がかりを必ず含める（〜かどうか、何を〜か、どこで〜か、知りたい、確認したい 等）
- 例（間接・wh名詞節X）: jp「彼が何を言ったのか知りたい」→ en "I want to know what he said." / mood=interrogative / questionType=indirect / thread=糸2
- 例（間接・whether）: jp「会議が延期されたかどうか確認したい」→ en "I want to check whether the meeting was postponed." / mood=interrogative / questionType=indirect / thread=糸1
- 例（直接・対比）: jp「会議は延期されましたか」→ en "Was the meeting postponed?" / mood=interrogative / questionType=yesno / thread=糸1
- ${effectiveTarget}問のうち **過半数は indirect**（wh/if 節を名詞節Xとして埋め込む）。残りは直接 yesno/wh
- Y+Z キーセンテンス型・副詞節(Z)・名詞節(X)の MECE 網羅と**両立させる**（例: when節 + wh名詞節X を1問に同居可）
- **5問すべてを「知りたい／確認したい」テンプレにしない**。セット全体で最低1問は Y+Z キーセンテンス型（People who… when…）を担う
- 直接 yesno を使う場合も、en の主構造に名詞節(X)・副詞節(Z)・Y+Z のいずれかが骨格として見えること`;
}

function buildStep7QuestionExtra(effectiveTarget) {
  return `
Step 7 疑問文の設計（必須 — operationTag「疑問」）:
- effectiveTarget=${effectiveTarget} 件は **operationTag「疑問」かつ mood=interrogative** の問として確保する
- 他 operationTag（比較・仮定法・倒置/強調・否定・話法・省略）の問は mood=declarative（平叙）として扱い、疑問文カウントに含めない
- 倒置/強調（糸1）の問では wh疑問（糸2）を避ける / 強調cleft（糸2）の問では Yes/No（糸1）を避ける
- 例（yesno）: jp「彼女は幸せですか」→ en "Is she happy?" / operationTag=疑問 / mood=interrogative / questionType=yesno / thread=糸1
- 例（wh）: jp「彼は何を買ったのですか」→ en "What did he buy?" / operationTag=疑問 / mood=interrogative / questionType=wh / thread=糸2
- 2〜3種 operationTag 混在・倒置必須1問など、Step 7 MECE 網羅と**両立**させる
- operationTag「疑問」の問は、基本wh(What did…)のみで終わらせず、**糸の見せ場（倒置・強調cleft・否定前置等）を最低1問**含める`;
}


function buildStepQuestionExtra(step, effectiveTarget) {
  if (step === 3) return buildStep3QuestionExtra(effectiveTarget);
  if (step === 4) return buildStep4QuestionExtra(effectiveTarget);
  if (step === 5) return buildStep5QuestionExtra(effectiveTarget);
  if (step === 6) return buildStep6QuestionExtra(effectiveTarget);
  if (step === 7) return buildStep7QuestionExtra(effectiveTarget);
  return '';
}

function buildQuestionPracticeSection(step, n, questionTarget) {
  if (step < 3 || step > 7) return '';

  const requested = questionTarget ?? getDefaultQuestionTarget(step);
  if (requested <= 0) return '';

  const effectiveTarget = getEffectiveQuestionTarget(step, requested);
  const policyBlock = formatQuestionPolicyForPrompt(step);
  const stepQuestionExtra = buildStepQuestionExtra(step, effectiveTarget);
  const cappedNote = requested > effectiveTarget
    ? `（スライダー ${requested}問 → maxNatural により目標 ${effectiveTarget}問）`
    : '';
  const overlapHint = STEP_QUESTION_OVERLAP_HINT[step] ?? '当STEPの中心構造を内包する';
  const coverageResponsibility = buildCoverageResponsibilitySection(step, n, effectiveTarget);

  return `${buildPriorityLadderSection(step, n, effectiveTarget)}

疑問文練習（production）:
- 設計思想: 疑問文は STEP の構造的中身を差し替えるのではなく、**同じ構造的中身に疑問変形（法=mood）をかぶせる**（構造ターゲット軸 ⊥ 法軸は直交）
- 糸1 = 助動詞を前に出す（Yes/No疑問）／糸2 = 空所を作り疑問詞を文頭へ（wh疑問）
- スライダー目標: ${requested}問${cappedNote}
- STEP疑問ポリシー（タイプはポリシーで自動選択。allowed 外は生成禁止）:
${policyBlock}

疑問文と網羅は別々に積まず、重ねる:
- **ちょうど ${effectiveTarget} 問**を「当STEPの中心構造を内包した疑問文」にする。${overlapHint}。
- 網羅カテゴリは「${n}問全体で満たすセットの性質」であり、疑問・平叙のどちらが担ってもよい。
- 「網羅のための平叙」と「疑問」を二重に用意しない（スロットの奪い合いを起こさない）。${coverageResponsibility}
- 各疑問文に: \`"mood": "interrogative"\`、\`"questionType"\`、可能なら \`"thread"\`
- 間接疑問（indirect）も疑問文にカウント（英文が ? で終わらなくても mood=interrogative）
- 平叙の問は mood=declarative または省略
- 自然さガード: **自然さ＞目標数**だが **effectiveTarget を超えて疑問文を作らない**（上振れは構造の多様性を損なう）。自然に作れず effectiveTarget を**下回る**場合のみ _questionNote に理由を記録${stepQuestionExtra}`;
}

function buildFollowUpReviewSection(reviewMarkdown, n, step, { coreTagSummary } = {}) {
  const coreCodes = CORE_ERROR_CODES.join(' / ');
  const tagBlock = coreTagSummary
    ? `
前回の core 誤りタグ集計（弱点シグナル）: ${coreTagSummary}
- 上記 core タグを**優先**して弱点克服問題を設計すること
- peripheral（lexical / functionWord）は出題に寄与させない`
    : `
- 前回結果に errorTags が無い場合は、Markdown 本文から低得点・要修正の問を分析すること`;

  return `

前回の答え合わせ結果（Markdown）:
---
${reviewMarkdown}
---

弱点克服出題の指示（必須）:
- 弱点は **ERROR_TAXONOMY の core 層**（${coreCodes}）で特定する。該当タグを過不足なく列挙して設計に反映する
- **peripheral（lexical / functionWord）は弱点シグナルから除外** — スペル・語彙・機能語の語選択は次の出題に寄与させない
- 8〜9点でスペル・語彙だけが問題だった問は、弱点分析から除外（正解扱い）${tagBlock}
- 今回の ${n} 問は、特定した **core 構造の弱点** を集中的に克服できる問題を中心に設計する
- 出題は **現在の Step ${step} の範囲内** に限定する（他 Step の過去実績を混ぜない）
- 前回と同じ日本語文・同じ模範解答は出題しない
- 前回正解（8点以上、または peripheral のみの軽微な減点）だった文法パターンは復習として1問程度にとどめ、core の苦手パターンを厚く出題する
- テーマ・場面・主語は前回と重ならないよう新しい題材を使う`;
}

function buildStepGenerateExtra(step, n, questionTarget = 0) {
  if (step === 3) return buildStep3GenerateExtra(n, questionTarget);
  if (step === 4) return buildStep4GenerateExtra();
  if (step === 5) return buildStep5GenerateExtra(n, questionTarget);
  if (step === 6) return buildStep6GenerateExtra();
  if (step === 7) return buildStep7GenerateExtra(n, getLastStep7TagSet());
  return '';
}

export function buildGeneratePrompt(stepInfo, n, { step, reviewMarkdown, coreTagSummary, questionTarget } = {}) {
  const seedExamples = formatSeedExamples(stepInfo.exercises);
  const themeAssignment = formatThemeAssignment(n);
  const stepExtra = buildStepGenerateExtra(step, n, questionTarget ?? 0);
  const questionPracticeSection = !reviewMarkdown && step >= 3 && step <= 7
    ? buildQuestionPracticeSection(step, n, questionTarget)
    : '';
  const effectiveTarget = !reviewMarkdown && step >= 3 && step <= 7
    ? getEffectiveQuestionTarget(step, questionTarget ?? 0)
    : 0;
  const naturalnessSection = step >= 3 && step <= 7
    ? buildNaturalnessAbsoluteSection(step, n, effectiveTarget)
    : '';
  const interrogativeCountStep = effectiveTarget > 0
    ? `\n5. 返却直前に mood=interrogative の件数を数え、**effectiveTarget=${effectiveTarget} と一致**するか確認する（多すぎる場合は超過分を平叙に戻してから返す。不足時のみ _questionNote）`
    : '';
  const essence = getEssenceForStep(step);
  const followUpSection = reviewMarkdown
    ? buildFollowUpReviewSection(reviewMarkdown, n, step, { coreTagSummary })
    : '';

  return {
    system: `あなたは英語教育の専門家です。
日本語→英語の翻訳練習問題を生成してください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。
返却はちょうど${n}要素のJSON配列のみ（多くても少なくてもならない）。

JSONの厳守ルール:
- 文字列値はダブルクォートのみ使用（シングルクォート不可）
- 文字列内のダブルクォートは \\" でエスケープする
- parts[].n や nuance 内で英文を引用するときは『』を使い、ダブルクォートは使わない
- 改行は \\n でエスケープし、生の改行を文字列内に入れない
- 末尾カンマ（trailing comma）は禁止`,

    user: `以下の文法ポイントに合った翻訳練習問題を${n}問生成してください。

文法ポイント: ${stepInfo.sub}（${stepInfo.focus}）

このSTEPの再利用原理（エッセンス）— nuance 末尾でどれを使ったか1行で示すこと:
${essence}

参考例（日本語の自然さ・文体の基準。テーマや内容は参考例に引きずられず、下記のテーマ割り当てに従うこと）:
${seedExamples || '  （参考例なし）'}

テーマの多様性（必須）:
- 各問に異なるテーマを1つずつ割り当て、jp の内容がそのテーマになるようにする
- 同じセット内でテーマ・場面・主語・文型の重複を避ける（例: 「毎日走ることで〜」のような同型文を複数問に使わない）
- 今回のテーマ割り当て（この順で生成し、最後に並びをランダムに入れ替える）:
${themeAssignment}${questionPracticeSection}

生成手順（必ずこの順番で）:
1. まず日本語文 jp を、母語話者が違和感なく言える自然な文として書く
2. jp の意味を正確に英訳して en（文法・構造の模範）と parts を作る
3. 英文の構文要件（後置修飾など）を満たすために、jp を英語語順に無理やり合わせない
4. 返却直前に配列要素数を数え、${n}でなければ${n}に調整してから返す（参考例・シードは数に含めない）${interrogativeCountStep}

返却形式（JSONのみ、ちょうど${n}要素の配列）:
[
  {
    "jp": "自然な日本語文",
    "en": "採点基準となる模範英訳（Step の文法・構造を明確に示す表現・語順）",
    "parts": [
      {
        "t": "英文のチャンク",
        "r": "X|V|Y|Z",
        "n": "役割メモ · 語順・表現の理由（該当する場合）",
        "inner": [
          { "t": "内部チャンク", "r": "X|V|Y|Z", "n": "内部の役割メモ（句・節を含む場合のみ）" }
        ]
      }
    ],
    "nuance": "en（文法・構造の模範）が採点基準となる理由（語順・文法パターンの選択根拠を1〜2文で）。**末尾に1行**でこのSTEPのエッセンスのどれを使っているかを示す",
    "vocabHints": [
      { "jp": "日本語の語（辞書形・基本形）", "en": "英語の原型（動詞原形・名詞単数形など）" }
    ],
    "mood": "interrogative（疑問文のみ必須）| declarative（平叙文）",
    "questionType": "yesno|wh|indirect（mood=interrogative の問のみ必須）",
    "thread": "糸1|糸2（疑問文で可能なら必須。Step7は全問必須の既存ルールに従う）",
    "enReply": "疑問文 en に対する模範的な回答文（mood=interrogative の問のみ必須。平叙文では含めない）",
    "_questionNote": "目標疑問数に届かなかった場合のみ、配列先頭要素に理由を1文で（任意）"
  }
]

役割の定義:
- X: 名詞役（主語・目的語・補語になるもの）
- V: 動詞（時制・相・態・助動詞を含む動詞部分全体）
- Y: 形容詞役（名詞を修飾するもの：形容詞・前置詞句・分詞・関係詞節）
- Z: 副詞役（動詞・文全体を修飾するもの：副詞・前置詞句・副詞節・分詞構文）

日本語（jp）の品質要件:
- 和文として自然で、英語の直訳調（カクル調）にしない
${naturalnessSection}
- 意味が通り、語彙と述語の組み合わせが論理的であること（例: ×「去年出版された著者」→ 著者は出版されない。本が出版される）
- 英語の後置修飾に合わせてカンマで区切るなど、英語語順をそのまま写さない
- 関係詞・後置修飾の Step では jp は連体修飾（名詞の前に修飾句）を使う
  例: ○「去年出版された本はとても興味深い。」 ×「この本は、去年出版された著者による、とても興味深いです。」
- 2つ以上の節・文をつなぐとき、論理関係（並列・因果・対比など）を日本語で明示する
  - 並列（A かつ B）: 両者が独立した事実であることが読み取れる表現にする
    例: ○「彼女は音楽を聴くのが好きで、ほぼ毎日ヘッドフォンで聴いている。」
  - 因果（A 故に B）: 「〜ので」「〜から」「そのため」など原因・結果がはっきりする接続を使う
    例: ○「彼女は音楽を聴くのが好きなので、ほぼ毎日 Spotify で聞いている。」
  - × 曖昧な例: 「音楽を聴くのが好きで、毎日のように行っている。」
    → 「好きだから行く」のか「好きなことと別に行く」のか不明。「行く」先・対象も不明
  - 「〜で、〜」だけでは並列か因果か判断できない場合は、上記のように接続を言い換える
- 後節の述語は、文脈なしで「何を・どこへ・誰に」が分かるように書く（「行っている」「やっている」だけにしない）
- 生成後、jp だけを読んで不自然さ・意味の矛盾・論理の曖昧さがないか自己確認する

vocabHints（単語ヒント）のルール:
- jp の中で英訳に必要な語彙のうち、TOEIC 250点程度の学習者でも訳語が思い浮かびにくい語を**漏れなく**選ぶ（出しすぎより出し少ない方が不利 — 迷ったらヒントに含める）
- 動詞だけでなく**名詞・形容詞・副詞**も積極的にヒント化する（例: 予算→budget、大規模な→large-scale、環境保全→environmental conservation）
- 除外するのは超基本語のみ: be動詞・代名詞・数詞・曜日・go/come/see/eat など初級で必ず習う語（book, read, study, tired など）
- TOEIC 300〜400点帯の語（budget, project, secure, implement, maintain, issue など）も**必ず**ヒントに含める
- 1文あたり **3〜6語** を目安に含める（内容語が多い文は上限まで出す）
- あくまで単語の対訳のみ。文法・構文の解説はしない（Although, who, that, whether などの接続詞・関係詞は含めない）
- 動詞は原形（publish）、名詞は単数形（author）、形容詞は原形（large-scale）で en を書く
- 活用形や時制は jp 側に書かず、jp は辞書形・基本形（出版する、大規模な）にする
- 該当語がなければ vocabHints は空配列 [] にする

疑問文の模範回答（enReply）— mood=interrogative の問のみ必須:
- enReply は en（疑問文）に対する**自然で模範的な回答文**（平叙文または短い応答）
- Yes/No 疑問には Yes/No で答えるか、理由・補足を1文添える
- wh 疑問・間接疑問には、jp の文脈に沿った具体的な回答を1文で書く（en の構造練習とは独立した内容でよい）
- enReply は採点対象外の参考表示。学習者が「この疑問にはこう答える」とイメージできる程度の自然さでよい

模範解答（en）の品質要件 — 採点基準（100点）:
- en は「意味が通る訳」ではなく、**Step の文法ポイント（${stepInfo.focus}）を最も明確に示す**模範訳とする
- 訳し方が複数ある場合、学習中の文法・構造パターンが読み取れる語順・表現を優先する（採点は常に en を基準とする）
- 例: 「毎日走ることで体を健康に保つ」→ ○ "By running every day, I keep my body fit."
  （手段を By + 動名詞で明示し、文頭に置いて主節へ自然につなぐ）
  × "Running every day, I keep fit my body."（語順が不自然）

parts[].inner（ネスト構造・再帰的）:
- X/Y/Z のルールは句・節の内部にも再帰的に適用する
- 関係詞節（Y）・副詞節（Z）・名詞節（X）など、内部に骨格（X+V など）を持つチャンクには inner を必ず付ける
- inner 内の t をスペースで繋いだ文字列は、親チャンクの t と一致すること
- inner の中にさらに句・節があれば、inner を再帰的にネストしてよい（最大2段まで）
- 単純な主語・動詞・単語の副詞など、内部に分解する意味がないチャンクは inner を省略
- parts[].n は1行・80文字以内を目安に簡潔に（JSON肥大化を防ぐ）

inner の例（関係詞節）:
  "t": "who like taking walks in the park", "r": "Y", "n": "関係詞節（主語を後置修飾）",
  "inner": [
    { "t": "who", "r": "X", "n": "関係代名詞（主語）" },
    { "t": "like", "r": "V", "n": "動詞（現在形）" },
    { "t": "taking walks in the park", "r": "X", "n": "目的語（動名詞句）",
      "inner": [
        { "t": "taking walks", "r": "X", "n": "動名詞句" },
        { "t": "in the park", "r": "Z", "n": "場所の前置詞句" }
      ]
    }
  ]

inner の例（副詞節）:
  "t": "when an issue arises", "r": "Z", "n": "副詞節",
  "inner": [
    { "t": "when", "r": "Z", "n": "接続副詞" },
    { "t": "an issue", "r": "X", "n": "主語" },
    { "t": "arises", "r": "V", "n": "動詞（現在形）" }
  ]

inner の例（副詞句＋名詞の後置修飾）:
  "t": "At the art exhibition held last year", "r": "Z", "n": "副詞役 · 場所・時を表す前置詞句",
  "inner": [
    { "t": "At the art exhibition", "r": "Z", "n": "場所の前置詞句" },
    { "t": "held last year", "r": "Y", "n": "過去分詞による後置修飾（exhibition を修飾）" }
  ]
  ※ inner に後置修飾（Y）だけを書いて前置詞句の頭（At the art exhibition）を省略しないこと

parts[].n の書き方:
- 前半: 文法上の役割（例: 「分詞構文（副詞役・前置）」「目的語と補語」）
- 後半（語順・前置・後置・表現の選択が学習ポイントのとき必須）: 「 · 」で区切り、なぜその位置・形が望ましいかを1文で
  例: 「分詞構文（副詞役・前置） · 同時の状況を文頭で示し、主節の行動と自然につなげる」
  例: 「手段・方法を表す前置詞句 · 日本語の「〜ことで」を By + 動名詞で明示し、文頭に置くと手段→結果の流れが明確になる」
- 語順・位置に特別な理由がないチャンク（主語・単純な目的語など）は役割メモのみでよい

nuance（必須）:
- en 全体が採点基準（100点）となる理由を1〜2文で書く
- 別の訳でも意味は通るが、なぜ en の語順・文法パターンが学習・採点の基準として望ましいかを説明する
- 学習者が「なぜこの語順・表現なのか」を理解できる内容にする
- **末尾に1行**で、このSTEPのエッセンス（上記「再利用原理」）のどれを使っているかを明示する

制約:
- parts[].t をスペースで繋いだ文字列が en と一致すること
- 難易度は日常的な文を使い、学習者が理解できるレベルに保つこと
- 日本語の訳し方が1通りでない場合、模範解答のニュアンスが日本語に一致するよう jp を調整する。ただし不自然な日本語になる場合は en の方を jp に合わせて書き換える
- ${n}問で扱う文法パターン（${stepInfo.focus}）もできるだけバラけさせ、似た構文の連続を避ける
- JSON配列の並び順は問ごとにランダムにする（テーマ割り当ての順番と一致させない）${stepExtra}${followUpSection}`,
  };
}

/** Fisher–Yates shuffle for exercise ordering after API response. */
export { shuffleArray };

const SINGLE_REGEN_ISSUE_NOTES = {
  scope: '主構造が当STEPの中心構造から外れている。当STEPの必須構造マーカーを必ず含めて書き直す。',
  wrong_type: '疑問タイプがSTEPポリシーに違反している。allowedTypes 内のタイプに修正する（Step5はyesnoのみ）。',
  unnatural: '日本語が未完・ハイブリッド・過剰技巧。完結した自然な1文に書き直す。',
  missing_yz_key: 'Y+Zキーセンテンス型（People who… work hard when…）を主練習点にした1問を生成する。',
};

/**
 * Regenerate a single exercise (validation repair).
 */
export function buildSingleExerciseRegeneratePrompt(stepInfo, step, n, {
  issue, index, siblingJps = [], mood = 'declarative', effectiveTarget = 0,
} = {}) {
  const policyBlock = formatQuestionPolicyForPrompt(step);
  const stepQuestionExtra = buildStepQuestionExtra(step, effectiveTarget);
  const center = STEP_CENTER_STRUCTURE[step] ?? '当STEPの中心構造';
  const issueNote = SINGLE_REGEN_ISSUE_NOTES[issue] ?? '品質要件に違反している。書き直す。';
  const moodLine = mood === 'interrogative'
    ? `mood=interrogative, questionType（ポリシー準拠）, thread, enReply を必須付与`
    : 'mood=declarative（平叙文）';

  return {
    system: `あなたは英語教育の専門家です。
必ず有効なJSONオブジェクト1つのみを返してください。マークダウンや説明文は一切含めないでください。

JSONの厳守ルール:
- 文字列値はダブルクォートのみ
- parts[].n や nuance 内の英文引用は『』
- 末尾カンマ禁止`,

    user: `Step ${step}「${stepInfo.sub}」（${stepInfo.focus}）の翻訳練習を**1問だけ**生成してください（セット内 ${index + 1}/${n} 問目の差し替え）。

修正理由: ${issueNote}

中心構造: ${center}
${policyBlock}
${stepQuestionExtra}

${buildNaturalnessAbsoluteSection(step, n, effectiveTarget)}

他の問の日本語（内容・文型を重複させない）:
${siblingJps.length ? siblingJps.map((jp, i) => `- ${jp}`).join('\n') : '（なし）'}

この1問は ${moodLine}。

返却形式（JSONオブジェクト1つのみ）:
{
  "jp": "自然な日本語文",
  "en": "採点基準となる模範英訳",
  "parts": [{ "t": "...", "r": "X|V|Y|Z", "n": "...", "inner": [] }],
  "nuance": "...（末尾にSTEPエッセンス1行）",
  "vocabHints": [{ "jp": "辞書形", "en": "原形" }],
  "mood": "interrogative|declarative",
  "questionType": "yesno|wh|indirect（疑問文のみ）",
  "thread": "糸1|糸2（疑問文で可能なら）",
  "enReply": "疑問文のみ必須"
}`,
  };
}

/**
 * Compact regenerate prompt when the first response lacks enough interrogative items.
 * Avoids duplicating the full user prompt (prevents oversized requests / mobile "Load failed").
 */
export function buildInterrogativeRegeneratePrompt(stepInfo, step, n, effectiveTarget, questionTarget = effectiveTarget, { issue = 'too_few' } = {}) {
  const policyBlock = formatQuestionPolicyForPrompt(step);
  const stepQuestionExtra = buildStepQuestionExtra(step, effectiveTarget);
  const overlapHint = STEP_QUESTION_OVERLAP_HINT[step] ?? '当STEPの中心構造を内包する';
  const coverageResponsibility = buildCoverageResponsibilitySection(step, n, effectiveTarget);
  const cappedNote = questionTarget > effectiveTarget
    ? `\nスライダー ${questionTarget}問 → maxNatural により実効 ${effectiveTarget}問`
    : '';
  const step7Fields = step === 7
    ? `\nStep 7 追加フィールド（全問必須）: operationTag, cefr, thread。疑問文 ${effectiveTarget} 件は operationTag「疑問」+ mood=interrogative。`
    : '';
  const issueNote = issue === 'too_many'
    ? `前回は mood=interrogative が ${effectiveTarget} 件を**超過**しました。ちょうど ${effectiveTarget} 件にし、超過分は平叙文（mood=declarative）に戻してください。`
    : issue === 'wrong_type'
      ? `前回は questionType が STEP ポリシー（allowedTypes）に違反する疑問文がありました。型を修正し、ちょうど ${effectiveTarget} 件の疑問文にしてください。`
      : issue === 'unnatural' || issue === 'scope'
        ? `前回は日本語の自然さまたは当STEPスコープに違反する問がありました。違反問を書き直し、疑問文はちょうど ${effectiveTarget} 件にしてください。`
        : `前回は mood=interrogative が ${effectiveTarget} 件に**不足**していました。ちょうど ${effectiveTarget} 件にしてください（不足時のみ _questionNote）。`;

  return {
    system: `あなたは英語教育の専門家です。
日本語→英語の翻訳練習問題を生成してください。
必ず有効なJSON配列のみを返してください。マークダウンや説明文は一切含めないでください。
返却はちょうど${n}要素の配列のみ。mood=interrogative は**ちょうど ${effectiveTarget} 件**（超過・不足とも不可。不足時のみ _questionNote）。

JSONの厳守ルール:
- 文字列値はダブルクォートのみ
- parts[].n や nuance 内の英文引用は『』
- 末尾カンマ禁止`,

    user: `${buildPriorityLadderSection(step, n, effectiveTarget)}

Step ${step}「${stepInfo.sub}」（${stepInfo.focus}）の翻訳練習を${n}問、JSON配列のみで生成してください。

${issueNote}${cappedNote}

疑問文と網羅は重ねる（別スロットに積まない）:
- **ちょうど ${effectiveTarget} 問**を当STEPの中心構造を内包した疑問文にする。${overlapHint}。
- 残り ${n - effectiveTarget} 問は必ず平叙文。${coverageResponsibility}

${policyBlock}
${stepQuestionExtra}${step7Fields}

各問に jp, en, parts, nuance, vocabHints を含める。疑問文には mood, questionType, thread, enReply を必須付与。
返却直前に配列要素数が ${n}、mood=interrogative が ${effectiveTarget} であることを確認する。
vocabHints は [{ "jp": "辞書形", "en": "原形" }, ...] のオブジェクト配列のみ（文字列配列・空オブジェクト不可）。

parts（必須・空配列不可）:
- 各要素に "t"（英文チャンク）と "r"（"X"|"V"|"Y"|"Z"）を必ず付与。句・節を含むチャンクは "inner" で再帰分解
- parts[].t をスペースで繋いだ文字列が en と完全一致すること
- 例: "parts": [{ "t": "Is", "r": "V" }, { "t": "what he said", "r": "X", "n": "名詞節（主語）" }]`,
  };
}

/**
 * Prompt for evaluating user translation attempts.
 * Claude returns a JSON array of Evaluation objects.
 *
 * Evaluation shape:
 *   { score: number, correct: boolean, feedback: string, correction: string | null }
 */
export function buildCheckPrompt(pairs, { step } = {}) {
  const stepExtra = step === 3
    ? buildStep3CheckExtra()
    : step === 7
      ? buildStep7CheckExtra()
      : step >= 4 && step <= 6
        ? buildInterrogativeCheckExtra()
        : '';
  const items = pairs
    .map(
      (p, i) =>
        `[${i + 1}]\n日本語: ${p.jp}\n模範解答（100点・文法・構造）: ${p.en}${p.nuance ? `\n模範解答のポイント: ${p.nuance}` : ''}${p.operationTag ? `\n操作タグ: ${p.operationTag}` : ''}${p.thread ? `\n糸: ${p.thread}` : ''}\n構造（圧縮 parts）: ${formatCompressedParts(p.parts)}\n解答: ${p.attempt || '（未入力）'}`
    )
    .join('\n\n');

  return {
    system: `あなたは英語教育の専門家です。
英語翻訳の採点をしてください。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。

JSONの厳守ルール:
- 文字列値はダブルクォートのみ使用（シングルクォート不可）
- feedback 内で英文・英単語を引用するときは必ず『』を使い、ダブルクォート (") は一切使わない
- 文字列内のダブルクォートが必要な場合のみ \\" でエスケープする
- feedback 内の改行は \\n で表す（生の改行は使わない）
- 末尾カンマ（trailing comma）は禁止`,

    user: `以下の翻訳を採点し、JSONで返してください。

${items}

返却形式（JSONのみ、${pairs.length}要素の配列）:
[
  {
    "score": 0〜10 の整数（各問10点満点）,
    "correct": true または false,
    "feedback": "下記の feedback ルールに従った日本語の解説",
    "correction": "常に null（模範解答は別途表示するため不要）",
    "errorTags": ["skeleton", "verbInfo", ...]  // ERROR_TAXONOMY の code の配列。誤りなしは []
  }
]

errorTags（必須・feedback とは別に機械可読で付与）:
${formatErrorTaxonomyForPrompt()}

errorTags 判定指針:
- 構造の誤り（骨格・動詞情報・役割・係り受け・ネスト・発展操作）→ 対応する core コードを**過不足なく列挙**（1つに丸めない）
- スペル・語彙・表現選択の誤り → lexical。冠詞・前置詞の語選択 → functionWord
- core と peripheral は**直交する別軸**。両方該当すれば両方記録する
- 点数（score）への影響は現行どおり。errorTags は弱点分析用の分類
- 正解（構造的に誤りなし）の場合は errorTags: []

score（10点満点）の目安:
- 10点: 意味・文法ともに正解、または表現の差異のみで意味は完全一致
- 7〜9点: 意味は正確だが、軽微な文法・語彙・スペルの誤りがある
- 4〜6点: 意味はおおむね伝わるが、時制・語法・語順など重要な誤りがある
- 1〜3点: 意味が部分的にしか伝わらない、または重大な誤りが多い（意味がほぼ伝わらない場合も 1点）
- 0点: **未入力の場合のみ**（解答がある場合は最低 1点）

採点基準（重要 — 変更禁止）:
- **採点は en（文法・構造の模範解答）のみを100点基準とする**。enNative は参考表示であり、採点には使わない
- 解答が enNative に近くても en の文法・構造と異なれば減点対象になりうる。逆に en に近いが enNative とは異なる表現でも、en と意味・文法が一致すれば満点に近い評価とする
- score に応じて correct を設定する（8点以上なら correct: true、7点以下なら false）
- 意味が正しく伝わっていればマイナーな表現の差異は 8〜10点
- 文法的な誤り・時制のミス・語順の問題・意味の変化は 7点以下
- 解答がある場合、score は 1〜10 のいずれかとする（0点は未入力専用）

feedback ルール（全体の分量は簡潔版の約1.5倍を目安。特に模範解答の妥当性の説明を厚く書く）:
- score が 10点の場合: 「正解！」のみ（他の解説は不要）
- score が 8〜9点の場合:
  1. 軽微な誤りを1〜2文で指摘
  2. 改行（\\n\\n）のあと、模範解答の語順・表現がなぜより望ましいかを **3〜4文** で補足する
     - 模範解答のポイント・語順・ニュアンスのいずれか少なくとも2点を触れる
     - 解答の表現と模範解答を直接比較し、「なぜ模範の方が自然・正確か」を具体的に
- 未入力（解答が空または「（未入力）」）の場合: score は **0 のみ**（他の点数帯と混同しない）、具体的な誤りの指摘のみ（翻訳による意味の比較は不要）
- score が 7点以下かつ解答ありの場合: 次の4ブロックを \\n\\n で区切る
  1. 主な誤り：— 誤りごとに (1)(2)... と列挙。各項目は **1〜2文**（何が誤りか＋正しい形・理由の簡潔な補足）
  2. スペルミス等があれば補正したうえで、解答を日本語に訳し直した意味を **2文程度** で示す
  3. その訳が元の日本語文の意図とどうずれるかを **2〜3文** で対比する（該当する場合）
  4. **模範解答（100点）の妥当性** — このブロックが feedback 全体の **約40%** になるよう、**4〜6文** で深く説明する
     - 模範解答のポイント・語順の選択・表現のニュアンス・ネイティブの自然さを多角的に
     - 解答者が取りがちな別表現（関係詞節 vs 分詞修飾、語彙の強弱など）と模範解答を比較し、模範が優れる理由を段階的に
     - 日本語のどの部分に模範解答のどの表現が対応するかも触れる
     例: 『Passengers sitting near the window』は、関係詞節 who sit より分詞 sitting の後置修飾の方が簡潔で、視覚的な場面描写に向きます。さらに are enjoying は are watching より『楽しんでいる』という日本語のニュアンスを生き生きと伝え、今まさに起きている光景を描きます。
     ※ feedback 内の英文引用は必ず『』で囲む（ダブルクォートは JSON エラーの原因になるため禁止）

feedback 書式（可読性最優先）:
- 1つの論点・誤り項目・文ごとに \\n で改行し、詰め込まない
- 誤りが複数あるときは見出し「主な誤り：」の直後から (1)(2)... を各行に1項目ずつ
- 大きな区切り（誤り指摘 / 補正後の意味 / 意図との対比 / 模範の理由）のあとは空行（\\n\\n）を入れる
- 行が長くなっても構わない。途中で不自然な位置で改行しない
- feedback は学習者が「何を直すか」と「なぜ模範解答が100点なのか」の両方がわかるよう具体的に
- 模範解答と異なる別解を correction として提示しない（模範解答は常に入力の「模範解答（100点）」を使う）${stepExtra}`,
  };
}

/**
 * Lightweight on-demand enNative generation (UI expand).
 * @param {string} jp
 * @param {string} en
 * @param {{ enReply?: string }} [opts]
 */
export function buildEnNativePrompt(jp, en, { enReply } = {}) {
  const isInterrogative = Boolean(enReply?.trim());

  if (isInterrogative) {
    return {
      system: `あなたは英語教育の専門家です。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。`,

      user: `以下の日本語・模範疑問文・模範回答文を入力に、ネイティブらしい参考表現を1組生成してください。

日本語: ${jp}
模範疑問文（文法・構造）: ${en}
模範回答文: ${enReply}

返却形式（JSONのみ、1要素のオブジェクト）:
{
  "enNative": "ネイティブがより自然に言う疑問文（意味は jp / en と同じ。チャンク・コロケーション重視）",
  "enNativeReply": "模範回答文をネイティブらしく言い換えた文（意味は模範回答文と同じ。別の事実・別の答えにしない）",
  "nuanceNative": "enNative / enNativeReply が en / 模範回答文より自然に聞こえる理由（2〜3文）"
}

要件:
- enNative は en と意味が同じ。en より口語的・自然なチャンク・語順を優先してよい
- enNativeReply は模範回答文と意味が同じ。事実・Yes/No の結論を変えない
- 採点基準ではない参考情報として書く`,
    };
  }

  return {
    system: `あなたは英語教育の専門家です。
必ず有効なJSONのみを返してください。マークダウンや説明文は一切含めないでください。`,

    user: `以下の日本語と模範英訳（文法・構造）を入力に、ネイティブらしい参考表現を1組生成してください。

日本語: ${jp}
模範解答（文法・構造）: ${en}

返却形式（JSONのみ、1要素のオブジェクト）:
{
  "enNative": "ネイティブがより自然に言う英訳（意味は jp と同じ。チャンク・コロケーション重視）",
  "nuanceNative": "enNative が en より自然に聞こえる理由（2〜3文）"
}

要件:
- en と意味は同じ。en より口語的・自然なチャンク・語順を優先してよい
- 採点基準ではない参考情報として書く`,
  };
}

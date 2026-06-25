import { formatQuestionPolicyForPrompt } from '../../constants/essences.js';
import { buildInterrogativePriorityLadder, buildNaturalnessAbsoluteSection, STEP_CENTER_STRUCTURE } from './shared.js';

function buildStep3QuestionExtra(n) {
  return `
Step 3 疑問文の設計（必須）:
- ${n}問すべて mood=interrogative。**yesno と wh の両方**を含める
- jp は「〜ですか」「〜でしょうか」等で疑問の手がかりを自然に含める
- 各疑問文でも動詞情報（時制・相・態・助動詞）が学習ポイントになるよう設計
- 例（yesno）: jp「彼女は毎日走っていますか」→ en "Does she run every day?" / questionType=yesno / thread=糸1
- 例（wh）: jp「彼は何を食べましたか」→ en "What did he eat?" / questionType=wh / thread=糸2`;
}

function buildStep4QuestionExtra(n) {
  return `
Step 4 疑問文の設計（必須）:
- **wh 疑問で準動詞/前置詞句スロットを問う**（preferred: wh）。Yes/No も可
- jp は「何を〜したいですか」「どこへ〜しますか」等、スロットが特定できる疑問文にする
- ${n}問のうち **過半数は wh** にする
- 疑問文の骨格内に to do / -ing / 前置詞句を載せる`;
}

function buildStep5QuestionExtra(n) {
  return `
Step 5 疑問文の設計（Yes/No のみ — 全${n}問）:
- **wh疑問は禁止**（関係詞=糸2 と gap 二重化を避ける）。Yes/No（糸1）のみ
- 関係詞節(Y)を内包したまま主骨格を疑問化する
- jp は「〜ですか」で終え、英文は ? で終わる直接疑問
- **関係詞の型を${n}問で分散させる**（同型が3問以上にならない）:
  - 主格関係代名詞（who/which/that が主語）
  - 目的格関係代名詞
  - 関係副詞 where/when 等
  - what名詞節（先行詞内蔵）
  - 同格 that
- 例: jp「その車を直した男はまだここにいますか」→ en "Is the man who fixed the car still here?" / questionType=yesno / thread=糸1`;
}

function buildStepQuestionExtra(step, n) {
  if (step === 3) return buildStep3QuestionExtra(n);
  if (step === 4) return buildStep4QuestionExtra(n);
  if (step === 5) return buildStep5QuestionExtra(n);
  return '';
}

export function buildInterrogativeOnlySection(step, n) {
  if (step < 3 || step > 5) return '';

  const policyBlock = formatQuestionPolicyForPrompt(step);
  const stepQuestionExtra = buildStepQuestionExtra(step, n);
  const center = STEP_CENTER_STRUCTURE[step] ?? '当STEPの中心構造';
  const moodGuard = step === 5
    ? `\n- **法(mood)軸は構造軸を侵食しないこと**。同型の疑問文（例: 『[名詞＋関係詞節]は〜ですか』）を3問以上並べない。関係詞サブタイプのばらつきを優先する`
    : '';

  return `
${buildInterrogativePriorityLadder(step, n)}

疑問ドリル（production）:
- 設計思想: 当STEPの中心構造（${center}）を内包したまま疑問変形（法=mood）をかぶせる
- 糸1 = 助動詞を前に出す（Yes/No疑問）／糸2 = 空所を作り疑問詞を文頭へ（wh疑問）
- 全${n}問に \`"mood": "interrogative"\`、\`"questionType"\`、\`"thread"\`、\`"enReply"\` を必須付与
- 構造網羅（STEP_COVERAGE・4カテゴリ完全網羅・Y+Z 必達）は**要求しない**

STEP疑問ポリシー:
${policyBlock}
${stepQuestionExtra}

${buildNaturalnessAbsoluteSection(step, n)}${moodGuard}`;
}

/**
 * Compact regenerate when mood consistency fails (all-interrogative set).
 */
export function buildInterrogativeRegeneratePrompt(stepInfo, step, n, { issue = 'wrong_mood' } = {}) {
  const policyBlock = formatQuestionPolicyForPrompt(step);
  const stepQuestionExtra = buildStepQuestionExtra(step, n);
  const issueNote = issue === 'wrong_type'
    ? `前回は questionType が STEP ポリシーに違反していました。全${n}問を疑問文に修正してください。`
    : issue === 'step5_diversity'
      ? `前回は Step5 の関係詞型が単調でした。主格/目的格/関係副詞/what名詞節/同格that を分散させて全${n}問を疑問文にしてください。`
      : issue === 'unnatural' || issue === 'scope'
        ? `前回は日本語の自然さまたは当STEPスコープに違反する問がありました。全${n}問を疑問文に書き直してください。`
        : `前回は mood=interrogative が全${n}問になっていませんでした。平叙文を疑問文に直し、全${n}問を mood=interrogative にしてください。`;

  return {
    system: `あなたは英語教育の専門家です。
日本語→英語の翻訳練習問題を生成してください。
必ず有効なJSON配列のみを返してください。マークダウンや説明文は一切含めないでください。
返却はちょうど${n}要素の配列のみ。**全問 mood=interrogative**（平叙文は不可）。

JSONの厳守ルール:
- 文字列値はダブルクォートのみ
- parts[].n や nuance 内の英文引用は『』
- 末尾カンマ禁止`,

    user: `${buildInterrogativePriorityLadder(step, n)}

Step ${step}「${stepInfo.sub}」（${stepInfo.focus}）の疑問ドリルを${n}問、JSON配列のみで生成してください。

${issueNote}

${policyBlock}
${stepQuestionExtra}

各問に jp, en, parts, nuance, vocabHints を含める。全問に mood=interrogative, questionType, thread, enReply を必須付与。
返却直前に配列要素数が ${n}、全問 mood=interrogative であることを確認する。

parts（必須・空配列不可）:
- 各要素に "t"（英文チャンク）と "r"（"X"|"V"|"Y"|"Z"）を必ず付与
- parts[].t をスペースで繋いだ文字列が en と完全一致すること`,
  };
}

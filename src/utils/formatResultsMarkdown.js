import { POINTS_PER_QUESTION } from '../api/claude.js';
import { aggregateCoreErrorTags, formatCoreTagSummary } from '../constants/essences.js';

/**
 * @param {{
 *   step: number,
 *   stepLabel: string,
 *   stepSub: string,
 *   exercises: { jp: string, en: string, enNative?: string, nuance?: string, nuanceNative?: string }[],
 *   attempts: Record<number, string>,
 *   evaluations: Record<number, { score: number, correct: boolean, feedback: string, errorTags?: string[] }>,
 * }} params
 */
export function formatResultsMarkdown({
  step,
  stepLabel,
  stepSub,
  exercises,
  attempts,
  evaluations,
}) {
  const totalScore = exercises.reduce((sum, _, i) => sum + (evaluations[i]?.score ?? 0), 0);
  const maxScore = exercises.length * POINTS_PER_QUESTION;
  const date = new Date().toLocaleString('ja-JP', { hour12: false });
  const coreSummary = formatCoreTagSummary(aggregateCoreErrorTags(evaluations));

  const lines = [
    '# 英文構造トレーナー — 答え合わせ結果',
    '',
    `- **日時:** ${date}`,
    `- **Step:** Step ${step} ${stepSub}`,
    `- **文法ポイント:** ${stepLabel}`,
    `- **合計スコア:** ${totalScore} / ${maxScore}点`,
  ];

  if (coreSummary) {
    lines.push(`- **弱点タグ（core集計）:** ${coreSummary}`);
  }

  lines.push('', '---', '');

  exercises.forEach((ex, i) => {
    const ev = evaluations[i];
    const attempt = (attempts[i] || '').trim();
    const status = ev?.correct ? '正解' : '要修正';

    lines.push(`## Q${i + 1}`, '');
    lines.push(`**日本語:** ${ex.jp}`, '');

    if (attempt) {
      lines.push(`**あなたの解答:** ${attempt}`, '');
    } else {
      lines.push('**あなたの解答:** （未入力）', '');
    }

    lines.push(`**模範解答（文法・構造）:** ${ex.en}`, '');

    if (ex.enNative) {
      lines.push(`**ネイティブらしい表現:** ${ex.enNative}`, '');
      if (ex.nuanceNative) {
        lines.push(ex.nuanceNative, '');
      }
    }

    if (ev) {
      lines.push(`**採点:** ${ev.score} / ${POINTS_PER_QUESTION}点（${status}）`, '');
      if (ev.errorTags?.length) {
        lines.push(`**誤りタグ:** ${ev.errorTags.join(', ')}`, '');
      }
      lines.push('### フィードバック', '', ev.feedback, '');
    }

    if (ex.nuance) {
      lines.push('### 模範解答のポイント（文法・構造）', '', ex.nuance, '');
    }

    lines.push('---', '');
  });

  return lines.join('\n').trimEnd() + '\n';
}

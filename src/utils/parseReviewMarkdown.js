import { parseCoreTagSummaryFromMarkdown, markdownHasErrorTags } from '../constants/essences.js';

/**
 * Parse an uploaded or pasted answer-check Markdown export.
 * @param {string} text
 * @returns {{ markdown: string, questionCount: number, totalScore: number | null, maxScore: number | null, step: number | null, coreTagSummary: string }}
 */
export function parseReviewMarkdown(text) {
  const markdown = String(text || '').trim();
  if (!markdown) {
    throw new Error('ファイルが空です');
  }

  const hasHeader = markdown.includes('英文構造トレーナー') && markdown.includes('答え合わせ');
  const qHeaders = markdown.match(/^## Q\d+/gm);
  let questionCount = qHeaders?.length ?? 0;

  const scoreMatch = markdown.match(/\*\*合計スコア:\*\*\s*(\d+)\s*\/\s*(\d+)点/);
  const totalScore = scoreMatch ? Number(scoreMatch[1]) : null;
  const maxScore = scoreMatch ? Number(scoreMatch[2]) : null;

  if (questionCount === 0 && maxScore != null && maxScore > 0) {
    questionCount = Math.round(maxScore / 10);
  }

  if (questionCount === 0) {
    throw new Error('答え合わせ結果（## Q1 など）を読み取れませんでした');
  }

  if (!hasHeader && questionCount === 0) {
    throw new Error('英文構造トレーナーの答え合わせ結果ファイルではない可能性があります');
  }

  const stepMatch = markdown.match(/\*\*Step:\*\*\s*Step\s*(\d+)/);
  const step = stepMatch ? Number(stepMatch[1]) : null;
  const coreCounts = parseCoreTagSummaryFromMarkdown(markdown);
  const coreTagSummary = Object.keys(coreCounts).length
    ? Object.entries(coreCounts).map(([k, n]) => `${k}(${n})`).join(', ')
    : '';

  return { markdown, questionCount, totalScore, maxScore, step, coreTagSummary, hasErrorTags: markdownHasErrorTags(markdown) };
}

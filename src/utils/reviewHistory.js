const REVIEW_HISTORY_PREFIX = 'est_review_';

/** Next follow-up set size: current count minus 2 (7→5→3→1→0). */
export function getFollowUpCount(questionCount) {
  return Math.max(0, questionCount - 2);
}

/**
 * @typedef {{ markdown: string, questionCount: number, totalScore: number, maxScore: number, savedAt: string }} ReviewHistory
 */

/**
 * @param {number} step
 * @returns {ReviewHistory | null}
 */
export function loadReviewHistory(step) {
  try {
    const raw = localStorage.getItem(`${REVIEW_HISTORY_PREFIX}${step}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.markdown || !data?.questionCount) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * @param {number} step
 * @param {Omit<ReviewHistory, 'savedAt'>} payload
 */
export function saveReviewHistory(step, payload) {
  localStorage.setItem(
    `${REVIEW_HISTORY_PREFIX}${step}`,
    JSON.stringify({ ...payload, savedAt: new Date().toISOString() }),
  );
}

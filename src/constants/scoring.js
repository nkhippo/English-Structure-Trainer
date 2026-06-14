/** Score band colors and criteria — single source of truth for UI and modal. */

export const SCORE_BANDS = [
  {
    label: '10点',
    min: 10,
    max: 10,
    description: '意味・文法とも正解、または表現差のみで意味は完全一致',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
  },
  {
    label: '7〜9点',
    min: 7,
    max: 9,
    description: '意味は正確だが、軽微な文法・語彙・スペル誤り',
    bg: '#F0FDF4',
    text: '#15803D',
    border: '#BBF7D0',
  },
  {
    label: '4〜6点',
    min: 4,
    max: 6,
    description: '意味はおおむね伝わるが、時制・語法・語順など重要な誤り',
    bg: '#FFFBEB',
    text: '#B45309',
    border: '#FDE68A',
  },
  {
    label: '1〜3点',
    min: 1,
    max: 3,
    description: '意味が部分的にしか伝わらない、または重大な誤りが多い',
    bg: '#FFF7ED',
    text: '#C2410C',
    border: '#FED7AA',
  },
  {
    label: '0点',
    min: 0,
    max: 0,
    unenteredOnly: true,
    description: '未入力（採点対象外）',
    bg: '#F4F4F5',
    text: '#71717A',
    border: '#E4E4E7',
  },
];

/**
 * @param {number} score
 * @param {{ unentered?: boolean }} [options]
 */
export function getScoreStyle(score, { unentered = false } = {}) {
  if (unentered || score === 0) {
    return SCORE_BANDS[SCORE_BANDS.length - 1];
  }

  const band = SCORE_BANDS.find((b) => !b.unenteredOnly && score >= b.min && score <= b.max);
  return band ?? SCORE_BANDS[SCORE_BANDS.length - 2];
}

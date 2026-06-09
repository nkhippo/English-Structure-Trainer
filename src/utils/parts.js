import { ROLES } from '../constants/roles.js';

const VALID_ROLES = new Set(['X', 'V', 'Y', 'Z']);

/**
 * @typedef {{ t: string, r: 'X'|'V'|'Y'|'Z', n?: string, inner?: Part[] }} Part
 */

export function roleStyle(r) {
  return ROLES[r?.toUpperCase()] ?? ROLES.X;
}

/** @param {unknown} part @returns {Part|null} */
export function normalizePart(part) {
  if (!part || typeof part.t !== 'string') return null;
  const r = String(part.r ?? 'X').toUpperCase();
  const inner = Array.isArray(part.inner)
    ? part.inner.map(normalizePart).filter(Boolean)
    : undefined;
  return {
    t: part.t,
    r: VALID_ROLES.has(r) ? r : 'X',
    n: typeof part.n === 'string' ? part.n : '',
    ...(inner?.length ? { inner } : {}),
  };
}

/** @param {Part[]} parts @param {number} [depth] */
export function formatPartsForCheck(parts, depth = 0) {
  if (!parts?.length) return '';
  const indent = '  '.repeat(depth + 1);
  const lines = parts.flatMap((p) => {
    const line = `${indent}- [${p.r}] ${p.t}${p.n ? `（${p.n}）` : ''}`;
    if (p.inner?.length) {
      return [line, formatPartsForCheck(p.inner, depth + 1)];
    }
    return [line];
  });
  if (depth === 0) {
    return `\n構造分解:\n${lines.join('\n')}`;
  }
  return lines.join('\n');
}

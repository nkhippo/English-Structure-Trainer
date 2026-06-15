import { ROLES } from '../constants/roles.js';

const VALID_ROLES = new Set(['X', 'V', 'Y', 'Z']);

/**
 * @typedef {{ t: string, r: 'X'|'V'|'Y'|'Z', n?: string, inner?: Part[] }} Part
 */

/** @param {string} text */
function collapseSpaces(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/** @param {Part[]} inner */
function joinInnerText(inner) {
  return collapseSpaces(inner.map((p) => p.t).join(' '));
}

/**
 * ColorChunk renders only inner children when inner is present. If inner text
 * does not cover the full parent.t, the color-coded view omits the head chunk.
 * @param {Part} part
 * @returns {Part}
 */
export function repairPartInner(part) {
  if (!part.inner?.length) return part;

  const inner = part.inner.map(repairPartInner);
  const parentText = collapseSpaces(part.t);
  const joined = joinInnerText(inner);

  if (joined === parentText) {
    return { ...part, inner };
  }

  const idx = parentText.indexOf(joined);
  if (idx !== -1 && joined.length > 0) {
    const before = parentText.slice(0, idx).trim();
    const after = parentText.slice(idx + joined.length).trim();
    /** @param {string} text @returns {Part} */
    const filler = (text) => ({ t: text, r: part.r, n: '' });
    const repaired = [
      ...(before ? [filler(before)] : []),
      ...inner,
      ...(after ? [filler(after)] : []),
    ];
    return { ...part, inner: repaired };
  }

  const { inner: _inner, ...rest } = part;
  return rest;
}

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
  const normalized = {
    t: part.t,
    r: VALID_ROLES.has(r) ? r : 'X',
    n: typeof part.n === 'string' ? part.n : '',
    ...(inner?.length ? { inner } : {}),
  };
  return repairPartInner(normalized);
}

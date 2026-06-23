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

/** @param {Record<string, unknown>} part */
function resolvePartText(part) {
  for (const key of ['t', 'text', 'chunk', 'token']) {
    if (typeof part[key] === 'string') return part[key];
  }
  return '';
}

/** @param {Record<string, unknown>} part */
function resolvePartRole(part) {
  for (const key of ['r', 'role', 'type']) {
    if (part[key] != null && part[key] !== '') return String(part[key]);
  }
  return 'X';
}

/** Parts that have displayable chunk text after normalization. */
export function getRenderableParts(parts) {
  return (parts ?? []).filter((p) => p && collapseSpaces(p.t || ''));
}

/** Top-level role sequence for the skeleton frame (e.g. "X · V · Y"). */
export function formatSkeletonFrame(parts) {
  return getRenderableParts(parts)
    .map((p) => {
      const role = String(p.r ?? 'X').toUpperCase();
      return VALID_ROLES.has(role) ? role : 'X';
    })
    .join(' · ');
}

/** @param {unknown} part @returns {Part|null} */
export function normalizePart(part) {
  if (!part || typeof part !== 'object') return null;

  const inner = Array.isArray(part.inner)
    ? part.inner.map(normalizePart).filter(Boolean)
    : undefined;

  let t = collapseSpaces(resolvePartText(part));
  if (!t && inner?.length) t = joinInnerText(inner);
  if (!t) return null;

  const r = resolvePartRole(part).toUpperCase();
  const normalized = {
    t,
    r: VALID_ROLES.has(r) ? r : 'X',
    n: typeof part.n === 'string' ? part.n : '',
    ...(inner?.length ? { inner } : {}),
  };
  return repairPartInner(normalized);
}

/**
 * Compress parts for grading prompt (top level + 1 inner depth; t and r only).
 * @param {Part[]} parts
 * @returns {string}
 */
export function formatCompressedParts(parts) {
  if (!Array.isArray(parts) || parts.length === 0) return '（なし）';

  return parts.map((p) => {
    if (!p?.t) return '';
    let line = `${p.t} [${p.r}]`;
    if (Array.isArray(p.inner) && p.inner.length > 0) {
      const inner = p.inner
        .filter((c) => c?.t)
        .map((c) => `${c.t} [${c.r}]`)
        .join(' ');
      if (inner) line += ` { ${inner} }`;
    }
    return line;
  }).filter(Boolean).join(' | ');
}

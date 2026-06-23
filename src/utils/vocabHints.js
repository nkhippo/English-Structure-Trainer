/**
 * Normalize one vocab hint from API output into { jp, en }.
 * Handles common LLM shape drift (string arrays, alternate keys, tuples).
 * @param {unknown} hint
 * @returns {{ jp: string, en: string } | null}
 */
export function normalizeVocabHint(hint) {
  if (hint == null) return null;

  if (typeof hint === 'string') {
    const text = hint.trim();
    if (!text) return null;
    const paired = text.match(/^(.+?)\s*(?:→|:|：|-)\s*(.+)$/u);
    if (paired) {
      return { jp: paired[1].trim(), en: paired[2].trim() };
    }
    return { jp: text, en: '' };
  }

  if (Array.isArray(hint)) {
    const [first, second] = hint;
    if (typeof first === 'string' && typeof second === 'string') {
      const jp = first.trim();
      const en = second.trim();
      return jp || en ? { jp, en } : null;
    }
    return null;
  }

  if (typeof hint !== 'object') return null;

  const record = /** @type {Record<string, unknown>} */ (hint);
  const jp = pickString(record, ['jp', 'ja', 'japanese', 'word', 'term', 'jaWord', 'jpWord', '日本語']);
  const en = pickString(record, ['en', 'english', 'translation', 'meaning', 'gloss', 'enWord', '英語']);

  if (jp || en) {
    return { jp, en };
  }

  const keys = Object.keys(record).filter((k) => !/^(note|n|hint)$/i.test(k));
  if (keys.length === 1 && typeof record[keys[0]] === 'string') {
    const key = keys[0].trim();
    const value = record[keys[0]].trim();
    if (key || value) return { jp: key, en: value };
  }

  return null;
}

/**
 * @param {unknown} hints
 * @returns {{ jp: string, en: string }[]}
 */
export function normalizeVocabHints(hints) {
  if (!Array.isArray(hints)) return [];
  return hints.map(normalizeVocabHint).filter((h) => h && (h.jp || h.en));
}

/** @param {Record<string, unknown>} record @param {string[]} keys */
function pickString(record, keys) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

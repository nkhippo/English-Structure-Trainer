const MAX_LOG_ENTRIES = 50;

/** @type {ApiDebugEntry[]} */
const logs = [];
/** @type {Set<(entries: ApiDebugEntry[]) => void>} */
const listeners = new Set();

/**
 * @typedef {{
 *   id: string,
 *   at: string,
 *   operation: 'generate' | 'check',
 *   step: number | null,
 *   input_tokens: number | null,
 *   output_tokens: number | null,
 *   stop_reason: string | null,
 *   max_tokens: number,
 *   response_chars: number,
 * }} ApiDebugEntry
 */

export function pushApiDebugLog(entry) {
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  logs.unshift(record);
  if (logs.length > MAX_LOG_ENTRIES) logs.length = MAX_LOG_ENTRIES;
  const snapshot = [...logs];
  listeners.forEach((fn) => fn(snapshot));
  console.log('[API Debug]', record);
  return record;
}

export function getApiDebugLog() {
  return [...logs];
}

export function clearApiDebugLog() {
  logs.length = 0;
  listeners.forEach((fn) => fn([]));
}

/** @param {(entries: ApiDebugEntry[]) => void} fn */
export function subscribeApiDebugLog(fn) {
  listeners.add(fn);
  fn([...logs]);
  return () => listeners.delete(fn);
}

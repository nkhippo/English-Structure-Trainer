import { buildGeneratePrompt, buildCheckPrompt, buildEnNativePrompt, shuffleArray } from '../prompts/index.js';
import { ERROR_TAG_CODES } from '../constants/essences.js';
import { saveLastStep7TagSet } from '../constants/step7.js';
import { buildPhraseGeneratePrompt, buildPhraseFeedbackEnrichPrompt } from '../prompts/phraseQuiz.js';
import { getLevelConfig, buildPhraseChoices, planPhraseSession } from '../constants/framingExpressions.js';
import { normalizePart } from '../utils/parts.js';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL_GENERATE = 'claude-haiku-4-5-20251001';
const MODEL_CHECK = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS_CHECK = 8192;
const MAX_TOKENS_GENERATE = 8192;
const MAX_TOKENS_PHRASE_ENRICH = 12288;
const CHECK_RETRIES = 2;
/** Questions per grading API call (sequential batches). */
export const CHECK_BATCH_SIZE = 1;

/** Number of exercises generated and shown per session. */
export const EXERCISES_PER_SET = 7;
/** Default interrogative sentences in a new set (out of EXERCISES_PER_SET, Steps 3–7). */
export const DEFAULT_INTERROGATIVE_COUNT = 2;
/** Phrase quiz: questions per API generation (sampled from level bank). */
export const PHRASE_QUESTIONS_PER_SET = 10;
/** Points awarded per question (total = EXERCISES_PER_SET × POINTS_PER_QUESTION). */
export const POINTS_PER_QUESTION = 10;
const API_KEY_STORAGE = 'est_api_key';

// ── Key management ──────────────────────────────────────────────────────────

export function getStoredApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function saveApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function clearApiKey() {
  localStorage.removeItem(API_KEY_STORAGE);
}

// ── JSON extraction ──────────────────────────────────────────────────────────

function sanitizeJsonText(text) {
  return text
    .replace(/```(?:json)?\s*/gi, '')
    .replace(/```/g, '')
    .replace(/[\u201c\u201d\u201e\u201f]/g, '"')
    .replace(/[\u2018\u2019\u201a\u201b]/g, "'");
}

/**
 * Extract a JSON array using bracket matching (string-aware).
 */
function extractJsonArray(text) {
  const cleaned = sanitizeJsonText(text);
  const start = cleaned.indexOf('[');
  if (start === -1) {
    throw new Error('レスポンスからJSON配列を抽出できませんでした');
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
  }

  throw new Error('JSON配列が途中で切れています（出力トークン上限の可能性があります）');
}

/** Escape literal newlines/tabs inside JSON string values. */
function fixUnescapedNewlinesInJson(json) {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        result += ch;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        result += ch;
        continue;
      }
      if (ch === '"') {
        inString = false;
        result += ch;
        continue;
      }
      if (ch === '\n') {
        result += '\\n';
        continue;
      }
      if (ch === '\r') {
        result += '\\r';
        continue;
      }
      if (ch === '\t') {
        result += '\\t';
        continue;
      }
      result += ch;
      continue;
    }
    if (ch === '"') inString = true;
    result += ch;
  }
  return result;
}

/**
 * Escape double quotes that appear inside JSON string values (common LLM mistake).
 * A closing quote is recognized only when followed by , } ] or : (after whitespace).
 */
function fixUnescapedQuotesInJson(json) {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    if (!inString) {
      result += ch;
      if (ch === '"') inString = true;
      continue;
    }
    if (escaped) {
      escaped = false;
      result += ch;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      result += ch;
      continue;
    }
    if (ch === '"') {
      let j = i + 1;
      while (j < json.length && /\s/.test(json[j])) j++;
      const next = json[j];
      if (next === ',' || next === '}' || next === ']' || next === ':' || next === undefined) {
        result += ch;
        inString = false;
      } else {
        result += '\\"';
      }
      continue;
    }
    result += ch;
  }
  return result;
}

function buildJsonCandidates(json) {
  const repaired = [
    json,
    fixUnescapedNewlinesInJson(json),
    fixUnescapedQuotesInJson(json),
    fixUnescapedQuotesInJson(fixUnescapedNewlinesInJson(json)),
  ];
  const candidates = new Set();
  for (const item of repaired) {
    candidates.add(item);
    candidates.add(item.replace(/,\s*([\]}])/g, '$1'));
  }
  return [...candidates];
}

function parseJsonArray(text) {
  const json = extractJsonArray(text);
  let lastError;
  for (const candidate of buildJsonCandidates(json)) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error('JSONの解析に失敗しました');
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

function logApiDebug(entry) {
  console.log('[API Debug]', {
    at: new Date().toISOString(),
    ...entry,
  });
}

async function callClaude(apiKey, system, userMessage, { prefill, debug, maxTokens = MAX_TOKENS_CHECK, model = MODEL_GENERATE } = {}) {
  const messages = [{ role: 'user', content: userMessage }];
  if (prefill) {
    messages.push({ role: 'assistant', content: prefill });
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // Required for direct browser-to-API calls.
      // We intentionally expose this app to the API key holder only (personal use).
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? '';
  const fullText = prefill ? prefill + text : text;

  if (debug) {
    logApiDebug({
      operation: debug.operation,
      step: debug.step ?? null,
      input_tokens: data.usage?.input_tokens ?? null,
      output_tokens: data.usage?.output_tokens ?? null,
      stop_reason: data.stop_reason ?? null,
      max_tokens: maxTokens,
      response_chars: fullText.length,
    });
  }

  return fullText;
}

function normalizeExercise(ex) {
  return {
    ...ex,
    parts: (ex.parts || []).map(normalizePart).filter(Boolean),
    vocabHints: Array.isArray(ex.vocabHints) ? ex.vocabHints : [],
    nuance: typeof ex.nuance === 'string' ? ex.nuance : '',
    enNative: typeof ex.enNative === 'string' ? ex.enNative.trim() : '',
    nuanceNative: typeof ex.nuanceNative === 'string' ? ex.nuanceNative : '',
    operationTag: typeof ex.operationTag === 'string' ? ex.operationTag : undefined,
    cefr: typeof ex.cefr === 'string' ? ex.cefr : undefined,
    thread: typeof ex.thread === 'string' ? ex.thread : undefined,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate new exercises for the given step.
 *
 * @param {string} apiKey
 * @param {{ sub: string, focus: string, exercises?: { jp: string, en: string }[] }} stepInfo
 * @param {number} n  Number of exercises to generate (default EXERCISES_PER_SET)
 * @returns {Promise<Exercise[]>}
 */
export async function generateExercises(apiKey, stepInfo, n = EXERCISES_PER_SET, { step, reviewMarkdown, coreTagSummary, interrogativeCount } = {}) {
  const { system, user } = buildGeneratePrompt(stepInfo, n, { step, reviewMarkdown, coreTagSummary, interrogativeCount });
  const raw = await callClaude(apiKey, system, user, {
    prefill: '[',
    maxTokens: MAX_TOKENS_GENERATE,
    debug: { operation: 'generate', step: step ?? null },
  });
  const exercises = parseJsonArray(raw);

  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new Error('生成結果が不正です');
  }
  const normalized = shuffleArray(exercises.map(normalizeExercise));
  if (step === 7) {
    const tags = [...new Set(normalized.map((ex) => ex.operationTag).filter(Boolean))];
    if (tags.length) saveLastStep7TagSet(tags);
  }
  return normalized;
}

function parseJsonObject(text) {
  const cleaned = sanitizeJsonText(text);
  const start = cleaned.indexOf('{');
  if (start === -1) throw new Error('JSONオブジェクトを抽出できませんでした');
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        const json = cleaned.slice(start, i + 1);
        let lastError;
        for (const candidate of buildJsonCandidates(json)) {
          try {
            const parsed = JSON.parse(candidate);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
          } catch (e) {
            lastError = e;
          }
        }
        throw lastError ?? new Error('JSONオブジェクトの解析に失敗しました');
      }
    }
  }
  throw new Error('JSONオブジェクトが途中で切れています');
}

/**
 * On-demand enNative + nuanceNative for one exercise.
 * @param {string} apiKey
 * @param {string} jp
 * @param {string} en
 */
export async function generateEnNative(apiKey, jp, en) {
  const { system, user } = buildEnNativePrompt(jp, en);
  const raw = await callClaude(apiKey, system, user, {
    prefill: '{',
    maxTokens: 2048,
    debug: { operation: 'en_native', step: null },
  });
  const parsed = parseJsonObject(raw);
  return {
    enNative: typeof parsed.enNative === 'string' ? parsed.enNative.trim() : '',
    nuanceNative: typeof parsed.nuanceNative === 'string' ? parsed.nuanceNative.trim() : '',
  };
}

/**
 * Evaluate a single batch of translation attempts (one API call).
 *
 * @param {string} apiKey
 * @param {{ jp: string, en: string, attempt: string, parts?: object[], nuance?: string }[]} pairs
 * @returns {Promise<Evaluation[]>}
 */
async function checkAnswersBatch(apiKey, pairs, { step } = {}) {
  const { system, user } = buildCheckPrompt(pairs, { step });
  let lastError;

  for (let attempt = 0; attempt < CHECK_RETRIES; attempt++) {
    try {
      const raw = await callClaude(apiKey, system, user, {
        prefill: '[',
        model: MODEL_CHECK,
        debug: { operation: 'check', step: step ?? null },
      });
      const evaluations = parseJsonArray(raw);

      if (!Array.isArray(evaluations) || evaluations.length !== pairs.length) {
        throw new Error('採点結果の件数が一致しません');
      }
      return evaluations.map((ev, i) => normalizeEvaluation(ev, pairs[i]?.attempt));
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError;
}

/**
 * Evaluate user translation attempts in sequential batches of CHECK_BATCH_SIZE.
 * On failure, throws an error with `failedAtIndex` (0-based) for resume.
 *
 * @param {string} apiKey
 * @param {{ jp: string, en: string, attempt: string, parts?: object[], nuance?: string }[]} pairs
 * @param {{ step?: number, startIndex?: number, onBatchComplete?: (batchStart: number, results: Evaluation[]) => void }} [options]
 * @returns {Promise<Evaluation[]>}
 */
export async function checkAnswers(apiKey, pairs, { step, startIndex = 0, onBatchComplete } = {}) {
  const results = [];

  for (let i = startIndex; i < pairs.length; i += CHECK_BATCH_SIZE) {
    const batchPairs = pairs.slice(i, i + CHECK_BATCH_SIZE);
    try {
      const batchResults = await checkAnswersBatch(apiKey, batchPairs, { step });
      batchResults.forEach((ev, j) => {
        results[i + j] = ev;
      });
      onBatchComplete?.(i, batchResults);
    } catch (e) {
      const err = new Error(e.message);
      err.failedAtIndex = i;
      throw err;
    }
  }

  return results;
}

const GENERIC_CONFUSABLE_WHY = 'この文の文脈では意味が合いません。';

function isWeakConfusableWhy(why) {
  const text = String(why || '').trim();
  if (!text || text === GENERIC_CONFUSABLE_WHY) return true;
  if (text.length < 40) return true;
  if (/^(意味が合いません|文脈では|不適切)/.test(text) && text.length < 80) return true;
  return false;
}

function isWeakCorrectFit(text) {
  const fit = String(text || '').trim();
  return !fit || fit.length < 30;
}

function getWrongChoices(question) {
  return (question.choices ?? []).filter(
    (c) => c.trim().toLowerCase() !== question.expr.trim().toLowerCase(),
  );
}

function normalizeConfusable(c) {
  return {
    phrase: String(c.phrase).trim(),
    why: String(c.why).trim(),
    sample: String(c.sample || '').trim(),
  };
}

function alignConfusables(question, wrongChoices) {
  const confusablesByPhrase = new Map(
    (question.confusables ?? []).map((c) => [c.phrase.toLowerCase(), c]),
  );
  return wrongChoices.map((phrase) => {
    const existing = confusablesByPhrase.get(phrase.toLowerCase());
    if (existing && !isWeakConfusableWhy(existing.why)) {
      return normalizeConfusable({ phrase, why: existing.why, sample: existing.sample });
    }
    return normalizeConfusable({ phrase, why: existing?.why ?? GENERIC_CONFUSABLE_WHY, sample: existing?.sample });
  });
}

async function enrichPhraseFeedback(apiKey, questions, levelId) {
  if (questions.length === 0) return new Map();

  const items = questions.map((q) => ({
    expr: q.expr,
    jp: q.jp,
    en: q.en,
    meaning: q.meaning,
    wrongPhrases: getWrongChoices(q),
  }));

  const { system, user } = buildPhraseFeedbackEnrichPrompt(items);
  const raw = await callClaude(apiKey, system, user, {
    prefill: '[',
    maxTokens: MAX_TOKENS_PHRASE_ENRICH,
    debug: { operation: 'phrase_feedback_enrich', step: `phrase-${levelId}` },
  });
  const enriched = parseJsonArray(raw);

  if (!Array.isArray(enriched) || enriched.length !== questions.length) {
    throw new Error('フィードバック解説の生成件数が一致しません');
  }

  const byIndex = new Map();
  enriched.forEach((entry, i) => {
    const confusables = Array.isArray(entry?.confusables)
      ? entry.confusables
          .filter((c) => c?.phrase && c?.why)
          .map((c) => normalizeConfusable(c))
      : [];
    byIndex.set(i, {
      correctFit: String(entry?.correctFit || '').trim(),
      confusables,
    });
  });
  return byIndex;
}

function mergeEnrichedConfusables(aligned, enrichedList) {
  const enrichedByPhrase = new Map(
    enrichedList.map((c) => [c.phrase.toLowerCase(), c]),
  );
  return aligned.map((c) => {
    const enriched = enrichedByPhrase.get(c.phrase.toLowerCase());
    if (enriched && !isWeakConfusableWhy(enriched.why)) {
      return normalizeConfusable({
        phrase: c.phrase,
        why: enriched.why,
        sample: enriched.sample || c.sample,
      });
    }
    return c;
  });
}

function stripJapaneseQuotes(text) {
  return String(text || '').trim().replace(/^[「『"']+|[」』"']+$/g, '').trim();
}

/** Collapse stray underscores before the canonical ___ blank (e.g. "__ ___ fire" → "___ fire"). */
function normalizePhraseBlank(en) {
  const text = String(en || '').trim();
  const idx = text.indexOf('___');
  if (idx === -1) return text;
  const before = text.slice(0, idx).replace(/_+$/, '').trimEnd();
  const after = text.slice(idx + 3).trimStart();
  if (!before) return after ? `___ ${after}` : '___';
  return after ? `${before} ___ ${after}` : `${before} ___`;
}

/**
 * Conjunctive adverbs need a comma after the blank, not a period.
 * e.g. "fluent. ___ . he" → "fluent. ___, he"
 */
function normalizeConjunctiveAdvPunctuation(en) {
  let text = String(en || '').trim();
  text = text.replace(/___\s*\.\s*([A-Za-z])/g, (_, ch) => `___, ${ch.toLowerCase()}`);
  text = text.replace(/___\s+(?![,.;])([a-z])/g, '___, $1');
  return text;
}

export function normalizePhraseEn(en, category) {
  const withPunctuation = category === 'conjunctive_adv'
    ? normalizeConjunctiveAdvPunctuation(en)
    : String(en || '').trim();
  return normalizePhraseBlank(withPunctuation);
}

function normalizePhraseQuestion(q, targets) {
  const target = targets.find(
    (t) => t.expr.toLowerCase() === String(q.expr || '').trim().toLowerCase(),
  );
  if (!target) {
    throw new Error(`生成結果に未知のフレーズが含まれています: ${q.expr}`);
  }
  if (!q.en || !String(q.en).includes('___')) {
    throw new Error(`「${target.expr}」の英文に穴埋め（___）がありません`);
  }
  const distractors = Array.isArray(q.distractors)
    ? q.distractors.map((d) => String(d).trim()).filter(Boolean).slice(0, 2)
    : [];

  return {
    expr: target.expr,
    jp: stripJapaneseQuotes(q.jp),
    en: normalizePhraseEn(q.en, target.category),
    meaning: String(q.meaning || '').trim(),
    correctFit: String(q.correctFit || '').trim(),
    distractors,
    confusables: Array.isArray(q.confusables)
      ? q.confusables
          .filter((c) => c?.phrase && c?.why)
          .slice(0, 2)
          .map((c) => normalizeConfusable(c))
      : [],
    category: target.category,
    cefr: target.cefr,
    isCrossLevel: Boolean(target.isCrossLevel),
  };
}

/**
 * Generate phrase fill-in-blank questions for one level tab (single API call).
 *
 * @param {string} apiKey
 * @param {string} levelId  'a12' | 'b1' | 'b2'
 * @param {object[]} targets  Expressions to include (pre-randomized subset)
 */
export async function generatePhraseQuestions(apiKey, levelId, targets) {
  const level = getLevelConfig(levelId);
  const { system, user } = buildPhraseGeneratePrompt(targets, level.label, levelId);
  const raw = await callClaude(apiKey, system, user, {
    prefill: '[',
    maxTokens: MAX_TOKENS_GENERATE,
    debug: { operation: 'phrase_generate', step: `phrase-${levelId}` },
  });
  const questions = parseJsonArray(raw);

  if (!Array.isArray(questions) || questions.length !== targets.length) {
    throw new Error(`生成結果の件数が一致しません（期待: ${targets.length}）`);
  }

  const normalized = questions.map((q) => normalizePhraseQuestion(q, targets));
  const exprSet = new Set(normalized.map((q) => q.expr.toLowerCase()));
  if (exprSet.size !== targets.length) {
    throw new Error('同じフレーズが重複して生成されました');
  }
  const withChoices = normalized.map((q) => {
    const choices = buildPhraseChoices(q.expr, levelId, {
      apiDistractors: q.distractors ?? [],
      confusables: q.confusables ?? [],
      isCrossLevel: q.isCrossLevel,
    });
    const wrongChoices = getWrongChoices({ ...q, choices });
    const alignedConfusables = alignConfusables(q, wrongChoices);
    return { ...q, choices, confusables: alignedConfusables };
  });

  const enrichedByIndex = await enrichPhraseFeedback(apiKey, withChoices, levelId);
  withChoices.forEach((q, index) => {
    const enriched = enrichedByIndex.get(index) ?? { correctFit: '', confusables: [] };
    if (!isWeakCorrectFit(enriched.correctFit)) {
      q.correctFit = enriched.correctFit;
    } else if (isWeakCorrectFit(q.correctFit)) {
      q.correctFit = q.meaning;
    }
    q.confusables = mergeEnrichedConfusables(q.confusables, enriched.confusables);
  });

  return shuffleArray(withChoices);
}

/**
 * Plan targets for a phrase quiz session (~20% cross-level).
 */
export function planPhraseQuizTargets(levelId, count) {
  return planPhraseSession(levelId, count);
}

function normalizeErrorTags(tags) {
  if (!Array.isArray(tags)) return [];
  return [...new Set(tags.filter((code) => ERROR_TAG_CODES.includes(code)))];
}

function normalizeEvaluation(ev, attempt = '') {
  const hasAttempt = String(attempt || '').trim().length > 0;

  if (!hasAttempt) {
    return {
      ...ev,
      score: 0,
      correct: false,
      errorTags: [],
    };
  }

  const raw = Number(ev.score);
  const rounded = Number.isFinite(raw) ? Math.round(raw) : (ev.correct ? 10 : 1);
  const score = Math.min(10, Math.max(1, rounded));

  return {
    ...ev,
    score,
    correct: score >= 8,
    errorTags: normalizeErrorTags(ev.errorTags),
  };
}

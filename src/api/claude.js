import { buildGeneratePrompt, buildCheckPrompt, shuffleArray } from '../prompts/index.js';
import { buildPhraseGeneratePrompt } from '../prompts/phraseQuiz.js';
import { getLevelConfig, buildPhraseChoices, planPhraseSession } from '../constants/framingExpressions.js';
import { pushApiDebugLog } from './debugLog.js';
import { normalizePart } from '../utils/parts.js';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS_CHECK = 4096;
const MAX_TOKENS_GENERATE = 8192;

/** Current max_tokens ceilings (for debug UI). */
export const API_MAX_TOKENS_CHECK = MAX_TOKENS_CHECK;
export const API_MAX_TOKENS_GENERATE = MAX_TOKENS_GENERATE;

/** Number of exercises generated and shown per session. */
export const EXERCISES_PER_SET = 7;
/** Phrase quiz: questions per API generation (sampled from level bank). */
export const PHRASE_QUESTIONS_PER_SET = 7;
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

function parseJsonArray(text) {
  const json = extractJsonArray(text);
  const candidates = [json, json.replace(/,\s*([\]}])/g, '$1')];
  let lastError;
  for (const candidate of candidates) {
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

async function callClaude(apiKey, system, userMessage, { prefill, debug, maxTokens = MAX_TOKENS_CHECK } = {}) {
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
      model: MODEL,
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
    pushApiDebugLog({
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
export async function generateExercises(apiKey, stepInfo, n = EXERCISES_PER_SET, { step } = {}) {
  const { system, user } = buildGeneratePrompt(stepInfo, n);
  const raw = await callClaude(apiKey, system, user, {
    prefill: '[',
    maxTokens: MAX_TOKENS_GENERATE,
    debug: { operation: 'generate', step: step ?? null },
  });
  const exercises = parseJsonArray(raw);

  if (!Array.isArray(exercises) || exercises.length === 0) {
    throw new Error('生成結果が不正です');
  }
  return shuffleArray(exercises.map(normalizeExercise));
}

/**
 * Evaluate user translation attempts for all exercises in bulk.
 *
 * @param {string} apiKey
 * @param {{ jp: string, en: string, attempt: string, parts?: object[], nuance?: string }[]} pairs
 * @returns {Promise<Evaluation[]>}
 */
export async function checkAnswers(apiKey, pairs, { step } = {}) {
  const { system, user } = buildCheckPrompt(pairs);
  const raw = await callClaude(apiKey, system, user, {
    prefill: '[',
    debug: { operation: 'check', step: step ?? null },
  });
  const evaluations = parseJsonArray(raw);

  if (!Array.isArray(evaluations) || evaluations.length !== pairs.length) {
    throw new Error('採点結果の件数が一致しません');
  }
  return evaluations.map(normalizeEvaluation);
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
    jp: String(q.jp || '').trim(),
    en: String(q.en || '').trim(),
    meaning: String(q.meaning || '').trim(),
    distractors,
    confusables: Array.isArray(q.confusables)
      ? q.confusables
          .filter((c) => c?.phrase && c?.why)
          .slice(0, 2)
          .map((c) => ({ phrase: String(c.phrase).trim(), why: String(c.why).trim() }))
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
  return shuffleArray(
    normalized.map((q) => ({
      ...q,
      choices: buildPhraseChoices(q.expr, levelId, {
        apiDistractors: q.distractors?.length ? q.distractors : q.confusables?.map((c) => c.phrase),
        isCrossLevel: q.isCrossLevel,
      }),
    })),
  );
}

/**
 * Plan targets for a phrase quiz session (~20% cross-level).
 */
export function planPhraseQuizTargets(levelId, count) {
  return planPhraseSession(levelId, count);
}

function normalizeEvaluation(ev) {
  const raw = Number(ev.score);
  const score = Number.isFinite(raw) ? Math.min(10, Math.max(0, Math.round(raw))) : (ev.correct ? 10 : 0);
  return {
    ...ev,
    score,
    correct: score >= 8,
  };
}

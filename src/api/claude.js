import { buildGeneratePrompt, buildCheckPrompt, shuffleArray } from '../prompts/index.js';
import { normalizePart } from '../utils/parts.js';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 4096;

/** Number of exercises generated and shown per session. */
export const EXERCISES_PER_SET = 7;
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

/**
 * Extract a JSON array from Claude's text response.
 * Handles markdown fences and stray surrounding text.
 */
function extractJsonArray(text) {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end <= start) {
    throw new Error('レスポンスからJSON配列を抽出できませんでした');
  }
  return text.slice(start, end + 1);
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

async function callClaude(apiKey, system, userMessage) {
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
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? '';
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
export async function generateExercises(apiKey, stepInfo, n = EXERCISES_PER_SET) {
  const { system, user } = buildGeneratePrompt(stepInfo, n);
  const raw = await callClaude(apiKey, system, user);
  const json = extractJsonArray(raw);
  const exercises = JSON.parse(json);

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
export async function checkAnswers(apiKey, pairs) {
  const { system, user } = buildCheckPrompt(pairs);
  const raw = await callClaude(apiKey, system, user);
  const json = extractJsonArray(raw);
  const evaluations = JSON.parse(json);

  if (!Array.isArray(evaluations) || evaluations.length !== pairs.length) {
    throw new Error('採点結果の件数が一致しません');
  }
  return evaluations.map(normalizeEvaluation);
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

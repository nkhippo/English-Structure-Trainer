import { STEP_QUESTION_POLICY } from '../constants/essences.js';
import { inferInterrogativeMood, getUnnaturalJpIssue } from './interrogative.js';

/** @param {object[]} parts @param {object[]} acc */
export function flattenParts(parts, acc = []) {
  for (const p of parts ?? []) {
    if (!p) continue;
    acc.push(p);
    if (p.inner?.length) flattenParts(p.inner, acc);
  }
  return acc;
}

function allPartText(ex) {
  return [
    ...flattenParts(ex.parts).map((p) => p.t || ''),
    ex.en || '',
    ex.jp || '',
  ].join(' ');
}

/** Y+Z key sentence: relative Y + adverbial Z with inner structure. */
export function hasYzKeySentence(ex) {
  const parts = flattenParts(ex.parts);
  const hasY = parts.some(
    (p) => p.r === 'Y' && /\b(who|which|that)\b/i.test(p.t || '') && p.inner?.length,
  );
  const hasZ = parts.some(
    (p) => p.r === 'Z' && /\b(when|because|if|although|while|since)\b/i.test(p.t || '') && p.inner?.length,
  );
  return hasY && hasZ;
}

function validateStep5Scope(ex) {
  const en = (ex.en || '').trim();
  const parts = flattenParts(ex.parts);
  const text = allPartText(ex);

  if (/^it\s+(is|was)\b/i.test(en)) return 'scope';

  const hasRelativeY = parts.some(
    (p) => p.r === 'Y' && /\b(who|which|where)\b/i.test(p.t || ''),
  );
  const hasWhatX = parts.some(
    (p) => p.r === 'X' && /\bwhat\b/i.test(p.t || ''),
  );
  const hasAppositive = parts.some(
    (p) => /同格/.test(p.n || '') || (p.r === 'Y' && /\bthat\b/i.test(p.t || '') && p.inner?.length),
  );

  if (!hasRelativeY && !hasWhatX && !hasAppositive) return 'scope';

  const topLevelZ = (ex.parts ?? []).filter(
    (p) => p.r === 'Z' && /^(when|because|although|if|while|since)\b/i.test((p.t || '').trim()),
  );
  if (topLevelZ.length > 0 && !hasRelativeY && !hasWhatX) return 'scope';

  if (/\b(when|because|although)\b/i.test(text) && !hasRelativeY && !hasWhatX && !hasAppositive) {
    return 'scope';
  }

  return null;
}

function validateStep6Scope(ex) {
  const parts = flattenParts(ex.parts);
  const hasNestedClause = parts.some(
    (p) => (p.r === 'X' || p.r === 'Y' || p.r === 'Z') && p.inner?.some(
      (inner) => inner.r === 'V' || inner.inner?.some((i) => i.r === 'V'),
    ),
  );
  return hasNestedClause ? null : 'scope';
}

const STEP7_TAG_MARKERS = {
  比較: /-er\b|more\s+\w+\s+than|as\s+\w+\s+as|less\s+\w+\s+than/i,
  仮定法: /\bwould\b|\bwere\b|\bhad\s+\w+(ed|en)\b/i,
  '倒置/強調': /^(never|rarely|not only|little|hardly|scarcely|only|it\s+is|it\s+was|what\s+.+\s+(is|was))\b/i,
  否定: /\b(not|never|no longer|without)\b/i,
  話法: /\b(said|told|asked|reported)\b.+\bthat\b/i,
  省略: /\b(if|when|while|though)\b.+,?\s+\w+/i,
};

function isBasicWhQuestion(ex) {
  const en = (ex.en || '').trim();
  return /^(What|Who|Where|When|Why|How)\s+(do|does|did|is|are|was|were)\b/i.test(en)
    && !/^(Never|Rarely|Not only|It is|It was|What .+ is\b)/i.test(en);
}

function validateStep7Scope(ex) {
  const en = (ex.en || '').trim();
  const tag = ex.operationTag;

  if (tag && STEP7_TAG_MARKERS[tag] && !STEP7_TAG_MARKERS[tag].test(en)) {
    return 'scope';
  }

  if (!tag) return 'scope';

  const bareInfinitiveMain = /^\w+\s+(wants|wanted|likes|liked|needs|needed|plans|planned)\s+to\s+\w+/i.test(en)
    && !/\b(would|had|than|if|whether)\b/i.test(en);
  if (bareInfinitiveMain) return 'scope';

  if (isBasicWhQuestion(ex) && tag === '倒置/強調' && ex.thread !== '糸2') {
    return 'scope';
  }

  return null;
}

function validateStep3Scope(ex) {
  const parts = flattenParts(ex.parts);
  const gerundHeavy = parts.filter((p) => /\b\w+ing\b/i.test(p.t || '') && p.r === 'X').length >= 2
    && !parts.some((p) => p.r === 'V' && /\b(has|have|had|will|would|do|does|did)\b/i.test(p.t || ''));
  return gerundHeavy ? 'scope' : null;
}

function validateStep4Scope(ex) {
  const parts = flattenParts(ex.parts);
  const hasPrepOrNonfinite = parts.some(
    (p) => /\bto\s+\w+|\b\w+ing\b|\b(in|on|at|for|with|by)\s+\w+/i.test(p.t || ''),
  );
  return hasPrepOrNonfinite ? null : 'scope';
}

export function validateScope(ex, step) {
  switch (step) {
    case 3: return validateStep3Scope(ex);
    case 4: return validateStep4Scope(ex);
    case 5: return validateStep5Scope(ex);
    case 6: return validateStep6Scope(ex);
    case 7: return validateStep7Scope(ex);
    default: return null;
  }
}

export function inferQuestionType(ex) {
  if (ex.questionType) return ex.questionType;
  const en = (ex.en || '').trim();
  const jp = ex.jp || '';
  if (en.endsWith('?')) {
    return /^(What|Who|Where|When|Why|How)\b/i.test(en) ? 'wh' : 'yesno';
  }
  if (/(かどうか|知りたい|確認したい|聞きたい|知りたがっている)/.test(jp)) return 'indirect';
  return null;
}

export function validateQuestionType(ex, step, generationMode = 'declarative') {
  if (generationMode === 'declarative') return null;

  if (inferInterrogativeMood(ex) !== 'interrogative') return null;
  if (getUnnaturalJpIssue(ex.jp)) return 'unnatural';

  const policy = STEP_QUESTION_POLICY[step];
  if (!policy) return null;

  const qType = inferQuestionType(ex);
  const en = (ex.en || '').trim();

  if (step === 5) {
    if (qType === 'wh' || /^(What|Who|Where|Why|How)\b/i.test(en)) return 'wrong_type';
  }

  if (qType && !policy.allowedTypes.includes(qType)) return 'wrong_type';

  return null;
}

/** Classify Step5 relative structure for diversity checks. */
export function classifyStep5RelativeType(ex) {
  const parts = flattenParts(ex.parts);
  const text = allPartText(ex);

  if (parts.some((p) => p.r === 'X' && /\bwhat\b/i.test(p.t || ''))) return 'what_clause';
  if (parts.some((p) => /同格/.test(p.n || '') || (p.r === 'Y' && /\bthat\b/i.test(p.t || '') && p.inner?.length))) {
    return 'appositive_that';
  }
  if (parts.some((p) => p.r === 'Y' && /\b(where|when|why)\b/i.test(p.t || ''))) return 'relative_adverb';
  if (parts.some((p) => p.r === 'Y' && /\b(who|which|that)\b/i.test(p.t || ''))) {
    if (/\b(who|which|that)\s+\w+/i.test(text) && !/\b(who|which|that)\s+\w+\s+\w+/i.test(text)) {
      return 'relative_pronoun_subject';
    }
    return 'relative_pronoun_object';
  }
  return 'other';
}

function validateMood(ex, generationMode) {
  const mood = inferInterrogativeMood(ex);
  if (generationMode === 'declarative' && mood === 'interrogative') return 'wrong_mood';
  if (generationMode === 'interrogative' && mood !== 'interrogative') return 'wrong_mood';
  return null;
}

/**
 * @returns {'scope'|'wrong_type'|'wrong_mood'|'unnatural'|null}
 */
export function getExerciseValidationIssue(ex, step, generationMode = 'declarative') {
  const moodIssue = validateMood(ex, generationMode);
  if (moodIssue) return moodIssue;
  if (getUnnaturalJpIssue(ex.jp)) return 'unnatural';
  const typeIssue = validateQuestionType(ex, step, generationMode);
  if (typeIssue) return typeIssue;
  return validateScope(ex, step);
}

export function validateStep5InterrogativeDiversity(exercises) {
  const counts = {};
  for (const ex of exercises) {
    const type = classifyStep5RelativeType(ex);
    counts[type] = (counts[type] || 0) + 1;
  }
  for (const count of Object.values(counts)) {
    if (count >= 3) {
      const index = exercises.findIndex((ex) => classifyStep5RelativeType(ex) !== 'other');
      return [{ kind: 'step5_diversity', index: index >= 0 ? index : 0 }];
    }
  }
  return [];
}

export function validateSetLevelIssues(exercises, step, generationMode = 'declarative') {
  if (generationMode === 'interrogative') {
    if (step === 5) return validateStep5InterrogativeDiversity(exercises);
    return [];
  }

  if (step === 6 && !exercises.some(hasYzKeySentence)) {
    const index = exercises.findIndex((ex) => inferInterrogativeMood(ex) !== 'interrogative');
    return [{ kind: 'missing_yz_key', index: index >= 0 ? index : 0 }];
  }
  return [];
}

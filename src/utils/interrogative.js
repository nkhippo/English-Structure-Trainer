/**
 * Detect unnatural Japanese that must not consume an interrogative slot.
 * @param {string} jp
 * @returns {'incomplete'|'hybrid'|'trick'|null}
 */
export function getUnnaturalJpIssue(jp) {
  const text = (jp || '').trim();
  if (!text) return null;
  if (/のですが[。.]?$|けれども[。.]?$|けど[。.]?$/.test(text)) return 'incomplete';
  if (/知りたい.*ですか|確認したい.*ですか|知りたいと思っていますか|聞きたい.*ですか/.test(text)) {
    return 'hybrid';
  }
  if (/住んでいない状態が続いていますか/.test(text)) return 'trick';
  return null;
}

/**
 * Detect whether an exercise is interrogative (direct or indirect).
 * Used when the model omits mood metadata.
 */
export function inferInterrogativeMood(ex) {
  if (ex.mood === 'interrogative') {
    if (getUnnaturalJpIssue(ex.jp)) return 'declarative';
    return 'interrogative';
  }
  if (ex.mood === 'declarative') return 'declarative';

  const en = (ex.en || '').trim();
  const jp = ex.jp || '';

  if (getUnnaturalJpIssue(jp)) return 'declarative';

  if (en.endsWith('?')) return 'interrogative';

  if (/^(Do|Does|Did|Is|Are|Am|Was|Were|Have|Has|Had|Will|Would|Can|Could|Should|May|Might|What|Who|Where|When|Why|How|Which|Didn't|Don't|Doesn't|Isn't|Aren't|Wasn't|Weren't|Haven't|Hasn't|Hadn't|Won't|Wouldn't|Can't|Couldn't|Shouldn't)\b/i.test(en)) {
    return 'interrogative';
  }

  const hasEmbeddedClause = /\b(whether|if)\s+\w/i.test(en)
    || /\b(what|who|where|when|why|how|which)\s+\w+/i.test(en);
  const hasQuestionFrame = /\b(know|wonder|asked|tell|remember|forget|sure|unsure|doubt|check|find out|explain|understand|decide)\b/i.test(en);
  if (hasEmbeddedClause && hasQuestionFrame) return 'interrogative';

  if (/(かどうか|知りたい|わからない|教えて|尋ね|聞きたい|確認したい|不明|何を|誰が|どこ|いつ|なぜ|どう|ですか|ますか|でしょうか)/.test(jp)) {
    if (/知りたい.*ですか|確認したい.*ですか/.test(jp)) return 'declarative';
    return 'interrogative';
  }

  return undefined;
}

export function enrichInterrogativeMetadata(ex) {
  const inferred = inferInterrogativeMood(ex);
  if (!inferred) return ex;
  if (ex.mood === inferred) return ex;
  if (ex.mood && ex.mood !== inferred) {
    return { ...ex, mood: inferred };
  }
  return { ...ex, mood: inferred };
}

export function isCountableInterrogative(ex) {
  return inferInterrogativeMood(ex) === 'interrogative';
}

export function countInterrogativeExercises(exercises) {
  return (exercises || []).filter(isCountableInterrogative).length;
}

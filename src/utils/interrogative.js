/**
 * Detect whether an exercise is interrogative (direct or indirect).
 * Used when the model omits mood metadata.
 */
export function inferInterrogativeMood(ex) {
  if (ex.mood === 'interrogative') return 'interrogative';
  if (ex.mood === 'declarative') return 'declarative';

  const en = (ex.en || '').trim();
  const jp = ex.jp || '';

  if (en.endsWith('?')) return 'interrogative';

  if (/^(Do|Does|Did|Is|Are|Am|Was|Were|Have|Has|Had|Will|Would|Can|Could|Should|May|Might|What|Who|Where|When|Why|How|Which|Didn't|Don't|Doesn't|Isn't|Aren't|Wasn't|Weren't|Haven't|Hasn't|Hadn't|Won't|Wouldn't|Can't|Couldn't|Shouldn't)\b/i.test(en)) {
    return 'interrogative';
  }

  if (ex.operationTag === '疑問') return 'interrogative';

  const hasEmbeddedClause = /\b(whether|if)\s+\w/i.test(en)
    || /\b(what|who|where|when|why|how|which)\s+\w+/i.test(en);
  const hasQuestionFrame = /\b(know|wonder|asked|tell|remember|forget|sure|unsure|doubt|check|find out|explain|understand|decide)\b/i.test(en);
  if (hasEmbeddedClause && hasQuestionFrame) return 'interrogative';

  if (/(かどうか|知りたい|わからない|教えて|尋ね|聞きたい|確認したい|不明|何を|誰が|どこ|いつ|なぜ|どう|ですか|ますか|でしょうか)/.test(jp)) {
    return 'interrogative';
  }

  return undefined;
}

export function enrichInterrogativeMetadata(ex) {
  const inferred = inferInterrogativeMood(ex);
  return inferred && !ex.mood ? { ...ex, mood: inferred } : ex;
}

export function countInterrogativeExercises(exercises) {
  return (exercises || []).filter((ex) => inferInterrogativeMood(ex) === 'interrogative').length;
}

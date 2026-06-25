import { useState } from 'react';
import { STEPS } from './constants/steps.js';
import { getStoredApiKey, clearApiKey, generateExercises, generateEnNative, checkAnswers, POINTS_PER_QUESTION } from './api/claude.js';
import ApiKeyInput from './components/ApiKeyInput.jsx';
import StepTabs from './components/StepTabs.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import GuideModal from './components/GuideModal.jsx';
import PhraseBankQuiz from './components/PhraseBankQuiz.jsx';
import StepInfoAccordion from './components/StepInfoAccordion.jsx';
import SetCompletePanel from './components/SetCompletePanel.jsx';
import CopyResultsButton from './components/CopyResultsButton.jsx';
import GradingOverlay from './components/GradingOverlay.jsx';
import ScoringCriteriaModal from './components/ScoringCriteriaModal.jsx';
import { getScoreStyle } from './constants/scoring.js';
import { APP_SCROLL_ID } from './hooks/usePinnedSectionHeader.js';
import { formatResultsMarkdown } from './utils/formatResultsMarkdown.js';
import { getFollowUpCount, loadReviewHistory, saveReviewHistory } from './utils/reviewHistory.js';
import { parseReviewMarkdown } from './utils/parseReviewMarkdown.js';
import ReviewMarkdownPanel from './components/ReviewMarkdownPanel.jsx';
import { aggregateCoreErrorTags, formatCoreTagSummary, STEP_MODES, resolveGenerationMode, getSetSizeForMode } from './constants/essences.js';
import { countInterrogativeExercises } from './utils/interrogative.js';

const C = { page: '#FAF9F6', card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D', ink: '#1C1B19' };

export default function App() {
  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [step, setStep] = useState(3);
  const [exercisesByStep, setExercisesByStep] = useState({}); // { step: Exercise[] }
  const [attemptsByStep, setAttemptsByStep] = useState({});   // { step: { idx: string } }
  const [evaluationsByStep, setEvaluationsByStep] = useState({}); // { step: { idx: Evaluation } }
  const [checkResumeFromByStep, setCheckResumeFromByStep] = useState({}); // { step: startIndex }
  const [revealedByStep, setRevealedByStep] = useState({});   // { step: boolean }
  const [generatingMode, setGeneratingMode] = useState(null); // null | 'new' | 'followUp'
  const isGeneratingNew = generatingMode === 'new';
  const isGeneratingFollowUp = generatingMode === 'followUp';
  const isGenerating = generatingMode != null;
  const [isChecking, setIsChecking] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [error, setError] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideAnchor, setGuideAnchor] = useState(null);
  const [scoringOpen, setScoringOpen] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [markdownFileError, setMarkdownFileError] = useState('');
  const [markdownFileSuccess, setMarkdownFileSuccess] = useState('');
  const [enNativeLoadingKey, setEnNativeLoadingKey] = useState(null);
  const [generationModeByStep, setGenerationModeByStep] = useState({ 3: 'declarative', 4: 'declarative', 5: 'declarative' });

  const isPhrase = step === 'phrase';
  const sd = isPhrase ? null : STEPS[step];
  const exercises = isPhrase ? [] : (exercisesByStep[step] || []);
  const attempts = isPhrase ? {} : (attemptsByStep[step] || {});
  const evaluations = isPhrase ? {} : (evaluationsByStep[step] || {});
  const checkResumeFrom = isPhrase ? null : (checkResumeFromByStep[step] ?? null);
  const revealed = isPhrase ? false : (revealedByStep[step] || false);
  const showCreateButton = !isPhrase && (exercises.length === 0 || revealed);
  const hasPartialCheck = !revealed && checkResumeFrom != null;

  const storedReview = !isPhrase ? loadReviewHistory(step) : null;
  // historyVersion triggers re-read after save
  void historyVersion;

  const buildResultsMarkdown = () => formatResultsMarkdown({
    step,
    stepLabel: sd.focus,
    stepSub: sd.sub,
    exercises,
    attempts,
    evaluations,
  });

  const sessionFollowUpCount = revealed && exercises.length > 0
    ? getFollowUpCount(exercises.length)
    : 0;
  const storedFollowUpCount = exercises.length === 0 && storedReview
    ? getFollowUpCount(storedReview.questionCount)
    : 0;
  const showSessionFollowUp = sessionFollowUpCount > 0;
  const availableModes = STEP_MODES[step] ?? ['declarative'];
  const generationMode = resolveGenerationMode(step, generationModeByStep[step] ?? 'declarative');
  const setSize = getSetSizeForMode(generationMode, step);
  const showModeToggle = availableModes.length > 1;
  const interrogativeCount = countInterrogativeExercises(exercises);
  const isInterrogativeSet = generationMode === 'interrogative' && exercises.length > 0;

  // ── Step switch ─────────────────────────────────────────────────────────────
  const switchStep = (s) => {
    setStep(s);
    setError('');
    setMarkdownFileError('');
    setMarkdownFileSuccess('');
    if (s !== 'phrase') {
      setExercisesByStep((prev) => ({ ...prev, [s]: [] }));
      setAttemptsByStep((prev) => ({ ...prev, [s]: {} }));
      setEvaluationsByStep((prev) => ({ ...prev, [s]: {} }));
      setCheckResumeFromByStep((prev) => ({ ...prev, [s]: null }));
      setRevealedByStep((prev) => ({ ...prev, [s]: false }));
    }
    document.getElementById(APP_SCROLL_ID)?.scrollTo({ top: 0 });
  };

  // ── Generate new exercises via Claude ───────────────────────────────────────
  const resetStepSession = () => {
    setAttemptsByStep((prev) => ({ ...prev, [step]: {} }));
    setEvaluationsByStep((prev) => ({ ...prev, [step]: {} }));
    setCheckResumeFromByStep((prev) => ({ ...prev, [step]: null }));
    setRevealedByStep((prev) => ({ ...prev, [step]: false }));
  };

  const handleGenerate = async () => {
    setGeneratingMode('new');
    setError('');
    try {
      const generated = await generateExercises(apiKey, sd, setSize, {
        step,
        generationMode,
      });
      setExercisesByStep((prev) => ({ ...prev, [step]: generated }));
      resetStepSession();
    } catch (e) {
      setError(`問題生成エラー: ${e.message}`);
    } finally {
      setGeneratingMode(null);
    }
  };

  const handleFollowUpGenerate = async (count, reviewMarkdown, coreTagSummary = '') => {
    setGeneratingMode('followUp');
    setError('');
    try {
      const generated = await generateExercises(apiKey, sd, count, { step, reviewMarkdown, coreTagSummary });
      setExercisesByStep((prev) => ({ ...prev, [step]: generated }));
      resetStepSession();
      document.getElementById(APP_SCROLL_ID)?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(`弱点克服問題の生成エラー: ${e.message}`);
    } finally {
      setGeneratingMode(null);
    }
  };

  const handleSessionFollowUp = () => {
    const coreTagSummary = formatCoreTagSummary(aggregateCoreErrorTags(evaluations));
    handleFollowUpGenerate(sessionFollowUpCount, buildResultsMarkdown(), coreTagSummary);
  };

  const handleStoredFollowUp = () => {
    if (!storedReview) return;
    handleFollowUpGenerate(
      storedFollowUpCount,
      storedReview.markdown,
      storedReview.coreTagSummary || '',
    );
  };

  const handleMarkdownFile = async (file) => {
    setMarkdownFileError('');
    setMarkdownFileSuccess('');
    try {
      const text = await file.text();
      const parsed = parseReviewMarkdown(text);
      if (parsed.step == null || parsed.step < 3 || parsed.step > 7) {
        throw new Error('ファイルから Step（3〜7）を読み取れませんでした');
      }
      if (parsed.step !== step) {
        throw new Error(`このファイルは Step ${parsed.step} の結果です。Step ${parsed.step} タブで読み込んでください`);
      }
      saveReviewHistory(step, {
        markdown: parsed.markdown,
        questionCount: parsed.questionCount,
        totalScore: parsed.totalScore ?? 0,
        maxScore: parsed.maxScore ?? parsed.questionCount * POINTS_PER_QUESTION,
        sourceStep: parsed.step,
        coreTagSummary: parsed.coreTagSummary || '',
      });
      setHistoryVersion((v) => v + 1);
      setMarkdownFileSuccess('読み込みました。この Step の最新結果として保存しました');
    } catch (e) {
      setMarkdownFileError(e.message || 'ファイルの読み込みに失敗しました');
    }
  };

  // ── Bulk answer check via Claude (1 question per batch, resumable) ─────────
  const handleCheck = async () => {
    const startIndex = checkResumeFrom ?? 0;
    setIsChecking(true);
    setGradingProgress(startIndex);
    setError('');
    if (startIndex === 0) {
      setEvaluationsByStep((prev) => ({ ...prev, [step]: {} }));
      setCheckResumeFromByStep((prev) => ({ ...prev, [step]: null }));
    }
    try {
      const pairs = exercises.map((ex, i) => ({
        jp: ex.jp,
        en: ex.en,
        attempt: attempts[i] || '',
        parts: ex.parts,
        nuance: ex.nuance,
        operationTag: ex.operationTag,
        thread: ex.thread,
      }));
      const finalEvaluations = await checkAnswers(apiKey, pairs, {
        step,
        startIndex,
        onBatchComplete: (batchStart, batchResults) => {
          setGradingProgress(batchStart + batchResults.length);
          setEvaluationsByStep((prev) => {
            const current = { ...(prev[step] || {}) };
            batchResults.forEach((r, j) => { current[batchStart + j] = r; });
            return { ...prev, [step]: current };
          });
        },
      });
      const evalMap = startIndex === 0
        ? Object.fromEntries(finalEvaluations.map((ev, i) => [i, ev]))
        : {
          ...(evaluationsByStep[step] || {}),
          ...Object.fromEntries(
            finalEvaluations
              .map((ev, i) => (ev != null ? [i, ev] : null))
              .filter(Boolean),
          ),
        };
      setCheckResumeFromByStep((prev) => ({ ...prev, [step]: null }));
      setRevealedByStep((prev) => ({ ...prev, [step]: true }));
      const markdown = formatResultsMarkdown({
        step,
        stepLabel: sd.focus,
        stepSub: sd.sub,
        exercises,
        attempts,
        evaluations: evalMap,
      });
      const total = Object.values(evalMap).reduce((sum, ev) => sum + (ev?.score ?? 0), 0);
      const coreTagSummary = formatCoreTagSummary(aggregateCoreErrorTags(evalMap));
      saveReviewHistory(step, {
        markdown,
        questionCount: exercises.length,
        totalScore: total,
        maxScore: exercises.length * POINTS_PER_QUESTION,
        sourceStep: step,
        coreTagSummary,
      });
      setHistoryVersion((v) => v + 1);
      document.getElementById(APP_SCROLL_ID)?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      const failedAt = e.failedAtIndex ?? startIndex;
      setCheckResumeFromByStep((prev) => ({ ...prev, [step]: failedAt }));
      setError(`採点エラー（Q${failedAt + 1}〜から再開できます）: ${e.message}`);
    } finally {
      setIsChecking(false);
      setGradingProgress(0);
    }
  };

  const handleLoadEnNative = async (index) => {
    const ex = exercises[index];
    if (!ex || ex.enNative) return;
    const key = `${step}-${index}`;
    setEnNativeLoadingKey(key);
    setError('');
    try {
      const { enNative, enNativeReply, nuanceNative } = await generateEnNative(apiKey, ex.jp, ex.en, { enReply: ex.enReply });
      setExercisesByStep((prev) => {
        const list = [...(prev[step] || [])];
        list[index] = { ...list[index], enNative, enNativeReply, nuanceNative };
        return { ...prev, [step]: list };
      });
    } catch (e) {
      setError(`ネイティブ表現の生成エラー: ${e.message}`);
    } finally {
      setEnNativeLoadingKey(null);
    }
  };

  const totalScore = Object.values(evaluations).reduce((sum, ev) => sum + (ev?.score ?? 0), 0);
  const maxScore = exercises.length * POINTS_PER_QUESTION;

  // ── API key not set ──────────────────────────────────────────────────────────
  if (!apiKey) {
    return <ApiKeyInput onSaved={(k) => setApiKey(k)} />;
  }

  return (
    <div
      id={APP_SCROLL_ID}
      style={{
        background: C.page,
        height: '100%',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '18px 16px 48px',
        fontFamily: "'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',system-ui,sans-serif",
        color: C.t1,
        boxSizing: 'border-box',
      }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>英文構造トレーナー</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isPhrase && (
              <button type="button" onClick={() => setScoringOpen(true)} style={{
                fontSize: 11, fontWeight: 600, color: C.t1, background: C.card, border: `1px solid ${C.line}`,
                borderRadius: 8, cursor: 'pointer', padding: '5px 10px', fontFamily: 'inherit' }}>
                採点基準
              </button>
            )}
            <button type="button" onClick={() => { setGuideAnchor(null); setGuideOpen(true); }} style={{
              fontSize: 11, fontWeight: 600, color: C.t1, background: C.card, border: `1px solid ${C.line}`,
              borderRadius: 8, cursor: 'pointer', padding: '5px 10px', fontFamily: 'inherit' }}>
              構造ガイド
            </button>
            <button type="button" onClick={() => { clearApiKey(); setApiKey(''); }} style={{
              fontSize: 11, color: C.t3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
              APIキー変更
            </button>
          </div>
        </div>

        {/* Step tabs */}
        <StepTabs currentStep={step} onSwitch={switchStep} />

        {isPhrase ? (
          <PhraseBankQuiz
            apiKey={apiKey}
            onOpenStep7={() => {
              switchStep(7);
              setGuideAnchor('ch-27');
              setGuideOpen(true);
            }}
          />
        ) : (
          <>
            {/* Step desc + Create button */}
            <div style={{ marginBottom: 16 }}>
              <StepInfoAccordion step={step} />
              {showCreateButton && (
                <div style={{
                  marginBottom: 10,
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: C.card,
                  border: `1px solid ${C.line}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  {showModeToggle && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div
                        role="group"
                        aria-label="出題モード"
                        style={{
                          display: 'flex', borderRadius: 8, overflow: 'hidden',
                          border: `1px solid ${C.line}`,
                        }}
                      >
                        {[
                          { mode: 'declarative', label: '平叙文（7問）' },
                          { mode: 'interrogative', label: '疑問文（5問）' },
                        ].map(({ mode, label }) => {
                          const active = generationMode === mode;
                          return (
                            <button
                              key={mode}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setGenerationModeByStep((prev) => ({ ...prev, [step]: mode }))}
                              disabled={isGenerating}
                              style={{
                                flex: 1, padding: '8px 6px', border: 'none',
                                background: active ? C.ink : C.page,
                                color: active ? '#fff' : C.t2,
                                fontSize: 12, fontWeight: 700,
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={handleGenerate} disabled={isGenerating} style={{
                    width: '100%', padding: '11px 12px', borderRadius: 10, border: 'none',
                    background: C.ink, color: '#fff', fontSize: 14, fontWeight: 700,
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    opacity: isGenerating ? 0.7 : 1, fontFamily: 'inherit',
                  }}>
                    {isGeneratingNew ? '問題を作成中…' : '問題を作成する'}
                  </button>
                </div>
              )}
              {isInterrogativeSet && (
                <p style={{ fontSize: 12, color: C.t2, margin: '6px 0 0', textAlign: 'center' }}>
                  疑問ドリル {interrogativeCount} / {exercises.length}問
                </p>
              )}
              {revealed && showSessionFollowUp && (
                <button type="button" onClick={handleSessionFollowUp} disabled={isGenerating} style={{
                  width: '100%', padding: 14, borderRadius: 12, marginTop: 8,
                  border: `1px solid ${C.line}`, background: C.card, color: C.t1,
                  fontSize: 15, fontWeight: 700,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating ? 0.7 : 1, fontFamily: 'inherit',
                }}>
                  {isGeneratingFollowUp ? '弱点克服問題を作成中…' : `弱点に合わせて再出題（${sessionFollowUpCount}問）`}
                </button>
              )}
              {exercises.length === 0 && (
                <ReviewMarkdownPanel
                  review={storedReview}
                  followUpCount={storedFollowUpCount}
                  onFileSelect={handleMarkdownFile}
                  onFollowUp={handleStoredFollowUp}
                  isGeneratingNew={isGeneratingNew}
                  isGeneratingFollowUp={isGeneratingFollowUp}
                  fileError={markdownFileError}
                  fileSuccess={markdownFileSuccess}
                />
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#FEF0EF', border: '1px solid #FACACB', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: '#C0392B', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Score summary (top) */}
            {revealed && Object.keys(evaluations).length > 0 && (
              <>
              <SetCompletePanel step={step} onGoToFirstStep={() => switchStep(3)} />
              <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: C.t3, margin: '0 0 4px', fontWeight: 600, textAlign: 'center' }}>合計スコア</p>
                <p style={{ fontSize: 28, fontWeight: 700, margin: '0 0 14px', color: C.t1, lineHeight: 1.2, textAlign: 'center' }}>
                  {totalScore} <span style={{ fontSize: 16, fontWeight: 600, color: C.t3 }}>/ {maxScore}点</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
                  {exercises.map((_, i) => {
                    const ev = evaluations[i];
                    const unentered = !(attempts[i] || '').trim();
                    const style = getScoreStyle(ev?.score ?? 0, { unentered });
                    return (
                      <div key={i} style={{
                        textAlign: 'center', padding: '8px 6px', borderRadius: 10,
                        background: style.bg, border: `1px solid ${style.border}`,
                      }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.t3, margin: '0 0 2px' }}>Q{i + 1}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: style.text }}>
                          {ev?.score ?? 0}<span style={{ fontSize: 11, fontWeight: 600 }}>/{POINTS_PER_QUESTION}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
              </>
            )}

            {/* Question cards */}
            {exercises.map((ex, i) => (
              <QuestionCard
                key={`${step}-${i}-${ex.jp}`}
                index={i}
                exercise={ex}
                attempt={attempts[i] || ''}
                evaluation={evaluations[i] || null}
                revealed={revealed || evaluations[i] != null}
                onAttemptChange={(v) => setAttemptsByStep((a) => ({ ...a, [step]: { ...a[step], [i]: v } }))}
                onOpenGuideChapter={(anchor) => { setGuideAnchor(anchor); setGuideOpen(true); }}
                onLoadEnNative={() => handleLoadEnNative(i)}
                enNativeLoading={enNativeLoadingKey === `${step}-${i}`}
              />
            ))}

            {/* Bulk action */}
            {exercises.length > 0 && !revealed ? (
              <>
                <button type="button" onClick={() => setScoringOpen(true)} style={{
                  width: '100%', marginBottom: 8, padding: '8px 12px', borderRadius: 10,
                  border: `1px solid ${C.line}`, background: C.card, color: C.t2,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  採点基準を見る
                </button>
                {hasPartialCheck && (
                  <p style={{ fontSize: 12, color: C.t2, margin: '0 0 8px', textAlign: 'center' }}>
                    Q{checkResumeFrom + 1}〜の採点が未完了です。ボタンで続きから再開できます。
                  </p>
                )}
                <button onClick={handleCheck} disabled={isChecking} style={{
                width: '100%', padding: 15, borderRadius: 14, border: 'none',
                cursor: isChecking ? 'not-allowed' : 'pointer',
                background: C.ink, color: '#fff', fontSize: 15, fontWeight: 700,
                opacity: isChecking ? 0.7 : 1, fontFamily: 'inherit', marginTop: 4 }}>
                {isChecking
                  ? 'Claude が採点中…'
                  : hasPartialCheck
                    ? `続きから答え合わせ（Q${checkResumeFrom + 1}〜${exercises.length}問）`
                    : `まとめて答え合わせ（${exercises.length}問）`}
              </button>
              </>
            ) : exercises.length > 0 && revealed ? (
              <>
                <button type="button" onClick={() => setScoringOpen(true)} style={{
                  width: '100%', marginBottom: 8, padding: '8px 12px', borderRadius: 10,
                  border: `1px solid ${C.line}`, background: C.card, color: C.t2,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  採点基準を見る
                </button>
                <CopyResultsButton
                getMarkdown={buildResultsMarkdown}
              />
                {showSessionFollowUp && (
                  <button type="button" onClick={handleSessionFollowUp} disabled={isGenerating} style={{
                    width: '100%', padding: 14, borderRadius: 14, marginTop: 8,
                    border: `1px solid ${C.line}`, background: C.card, color: C.t1,
                    fontSize: 15, fontWeight: 700,
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    opacity: isGenerating ? 0.7 : 1, fontFamily: 'inherit',
                  }}>
                    {isGeneratingFollowUp ? '弱点克服問題を作成中…' : `弱点に合わせて再出題（${sessionFollowUpCount}問）`}
                  </button>
                )}
              </>
            ) : null}
          </>
        )}

      </div>

      <GuideModal
        open={guideOpen}
        onClose={() => { setGuideOpen(false); setGuideAnchor(null); }}
        initialAnchor={guideAnchor}
      />
      <ScoringCriteriaModal open={scoringOpen} onClose={() => setScoringOpen(false)} />
      {isChecking && (
        <GradingOverlay
          questionCount={exercises.length}
          gradedCount={gradingProgress}
        />
      )}
    </div>
  );
}

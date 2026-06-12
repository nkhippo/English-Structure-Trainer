import { useState } from 'react';
import { ROLES } from './constants/roles.js';
import { STEPS } from './constants/steps.js';
import { getStoredApiKey, clearApiKey, generateExercises, checkAnswers, EXERCISES_PER_SET, POINTS_PER_QUESTION } from './api/claude.js';
import ApiKeyInput from './components/ApiKeyInput.jsx';
import StepTabs from './components/StepTabs.jsx';
import QuestionCard from './components/QuestionCard.jsx';
import ApiDebugPanel from './components/ApiDebugPanel.jsx';
import GuideModal from './components/GuideModal.jsx';
import PhraseBankQuiz from './components/PhraseBankQuiz.jsx';
import StepInfoAccordion from './components/StepInfoAccordion.jsx';
import SetCompletePanel from './components/SetCompletePanel.jsx';
import { APP_SCROLL_ID } from './hooks/usePinnedSectionHeader.js';

const C = { page: '#FAF9F6', card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D', ink: '#1C1B19' };

export default function App() {
  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [step, setStep] = useState(3);
  const [exercisesByStep, setExercisesByStep] = useState({}); // { step: Exercise[] }
  const [attemptsByStep, setAttemptsByStep] = useState({});   // { step: { idx: string } }
  const [evaluationsByStep, setEvaluationsByStep] = useState({}); // { step: { idx: Evaluation } }
  const [revealedByStep, setRevealedByStep] = useState({});   // { step: boolean }
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [debugOpen, setDebugOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideAnchor, setGuideAnchor] = useState(null);

  const isPhrase = step === 'phrase';
  const sd = isPhrase ? null : STEPS[step];
  const exercises = isPhrase ? [] : (exercisesByStep[step] || []);
  const attempts = isPhrase ? {} : (attemptsByStep[step] || {});
  const evaluations = isPhrase ? {} : (evaluationsByStep[step] || {});
  const revealed = isPhrase ? false : (revealedByStep[step] || false);
  const showCreateButton = !isPhrase && (exercises.length === 0 || revealed);

  // ── Step switch ─────────────────────────────────────────────────────────────
  const switchStep = (s) => {
    setStep(s);
    setError('');
    if (s !== 'phrase') {
      setExercisesByStep((prev) => ({ ...prev, [s]: [] }));
      setAttemptsByStep((prev) => ({ ...prev, [s]: {} }));
      setEvaluationsByStep((prev) => ({ ...prev, [s]: {} }));
      setRevealedByStep((prev) => ({ ...prev, [s]: false }));
    }
    document.getElementById(APP_SCROLL_ID)?.scrollTo({ top: 0 });
  };

  // ── Generate new exercises via Claude ───────────────────────────────────────
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const generated = await generateExercises(apiKey, sd, EXERCISES_PER_SET, { step });
      setExercisesByStep((prev) => ({ ...prev, [step]: generated }));
      setAttemptsByStep((prev) => ({ ...prev, [step]: {} }));
      setEvaluationsByStep((prev) => ({ ...prev, [step]: {} }));
      setRevealedByStep((prev) => ({ ...prev, [step]: false }));
    } catch (e) {
      setError(`問題生成エラー: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Bulk answer check via Claude ─────────────────────────────────────────────
  const handleCheck = async () => {
    setIsChecking(true);
    setError('');
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
      const results = await checkAnswers(apiKey, pairs, { step });
      const evalMap = {};
      results.forEach((r, i) => { evalMap[i] = r; });
      setEvaluationsByStep((prev) => ({ ...prev, [step]: evalMap }));
      setRevealedByStep((prev) => ({ ...prev, [step]: true }));
      document.getElementById(APP_SCROLL_ID)?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(`採点エラー: ${e.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setAttemptsByStep((prev) => ({ ...prev, [step]: {} }));
    setEvaluationsByStep((prev) => ({ ...prev, [step]: {} }));
    setRevealedByStep((prev) => ({ ...prev, [step]: false }));
    setError('');
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
        padding: `18px 16px ${debugOpen ? 280 : 48}px`,
        fontFamily: "'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',system-ui,sans-serif",
        color: C.t1,
        boxSizing: 'border-box',
      }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>英文構造トレーナー</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                <button type="button" onClick={handleGenerate} disabled={isGenerating} style={{
                  width: '100%', padding: 14, borderRadius: 12, border: 'none',
                  background: C.ink, color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating ? 0.7 : 1, fontFamily: 'inherit',
                }}>
                  {isGenerating ? '問題を作成中…' : '問題を作成する'}
                </button>
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
                    const correct = ev?.correct;
                    const scoreColor = correct ? ROLES.V.text : ROLES.Y.text;
                    const scoreBg = correct ? ROLES.V.bg : ROLES.Y.bg;
                    const scoreBorder = correct ? ROLES.V.border : ROLES.Y.border;
                    return (
                      <div key={i} style={{
                        textAlign: 'center', padding: '8px 6px', borderRadius: 10,
                        background: scoreBg, border: `1px solid ${scoreBorder}`,
                      }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: C.t3, margin: '0 0 2px' }}>Q{i + 1}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: scoreColor }}>
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
                revealed={revealed}
                onAttemptChange={(v) => setAttemptsByStep((a) => ({ ...a, [step]: { ...a[step], [i]: v } }))}
                onOpenGuideChapter={(anchor) => { setGuideAnchor(anchor); setGuideOpen(true); }}
              />
            ))}

            {/* Bulk action */}
            {exercises.length > 0 && !revealed ? (
              <button onClick={handleCheck} disabled={isChecking} style={{
                width: '100%', padding: 15, borderRadius: 14, border: 'none',
                cursor: isChecking ? 'not-allowed' : 'pointer',
                background: C.ink, color: '#fff', fontSize: 15, fontWeight: 700,
                opacity: isChecking ? 0.7 : 1, fontFamily: 'inherit', marginTop: 4 }}>
                {isChecking ? 'Claude が採点中…' : `まとめて答え合わせ（${exercises.length}問）`}
              </button>
            ) : exercises.length > 0 ? (
              <button onClick={handleReset} style={{
                width: '100%', padding: 13, borderRadius: 14, cursor: 'pointer',
                border: `1px solid ${C.line}`, background: C.card, color: C.t1,
                fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
                やり直す
              </button>
            ) : null}
          </>
        )}

      </div>

      <GuideModal
        open={guideOpen}
        onClose={() => { setGuideOpen(false); setGuideAnchor(null); }}
        initialAnchor={guideAnchor}
      />
      <ApiDebugPanel open={debugOpen} onToggle={() => setDebugOpen((v) => !v)} />
    </div>
  );
}

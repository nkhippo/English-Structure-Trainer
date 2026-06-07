import { useState } from 'react';
import { ROLES } from './constants/roles.js';
import { STEPS } from './constants/steps.js';
import { getStoredApiKey, clearApiKey, generateExercises, checkAnswers } from './api/claude.js';
import ApiKeyInput from './components/ApiKeyInput.jsx';
import StepTabs from './components/StepTabs.jsx';
import QuestionCard from './components/QuestionCard.jsx';

const C = { page: '#FAF9F6', card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D', ink: '#1C1B19' };

export default function App() {
  const [apiKey, setApiKey] = useState(getStoredApiKey);
  const [step, setStep] = useState(3);
  // exercises: uses static seed by default; replaced by AI-generated on demand
  const [exercises, setExercises] = useState(STEPS[3].exercises);
  const [attempts, setAttempts] = useState({});       // { idx: string }
  const [evaluations, setEvaluations] = useState({}); // { idx: Evaluation }
  const [marks, setMarks] = useState({});              // { `${step}-${idx}`: 'got' | 'review' }
  const [revealed, setRevealed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const sd = STEPS[step];

  // ── Step switch ─────────────────────────────────────────────────────────────
  const switchStep = (s) => {
    setStep(s);
    setExercises(STEPS[s].exercises);
    setAttempts({});
    setEvaluations({});
    setRevealed(false);
    setError('');
  };

  // ── Generate new exercises via Claude ───────────────────────────────────────
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const generated = await generateExercises(apiKey, sd, 5);
      setExercises(generated);
      setAttempts({});
      setEvaluations({});
      setRevealed(false);
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
      }));
      const results = await checkAnswers(apiKey, pairs);
      const evalMap = {};
      results.forEach((r, i) => { evalMap[i] = r; });
      setEvaluations(evalMap);
      setRevealed(true);
    } catch (e) {
      setError(`採点エラー: ${e.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setAttempts({});
    setEvaluations({});
    setRevealed(false);
    setError('');
  };

  // ── Summary counts ───────────────────────────────────────────────────────────
  const gotCount = exercises.filter((_, i) => marks[`${step}-${i}`] === 'got').length;
  const reviewCount = exercises.filter((_, i) => marks[`${step}-${i}`] === 'review').length;

  // ── API key not set ──────────────────────────────────────────────────────────
  if (!apiKey) {
    return <ApiKeyInput onSaved={(k) => setApiKey(k)} />;
  }

  return (
    <div style={{ background: C.page, minHeight: '100vh', padding: '18px 16px 60px',
      fontFamily: "'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',system-ui,sans-serif",
      color: C.t1 }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>英文構造トレーナー</h1>
          <button onClick={() => { clearApiKey(); setApiKey(''); }} style={{
            fontSize: 11, color: C.t3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            APIキー変更
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: C.t2, margin: '0 0 14px' }}>全問を英訳 → まとめて答え合わせ（Claude API による採点）</p>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {Object.entries(ROLES).map(([r, s]) => (
            <span key={r} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>{s.label}</span>
          ))}
        </div>

        {/* Step tabs */}
        <StepTabs currentStep={step} marks={marks} onSwitch={switchStep} />

        {/* Step desc + Generate button */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 12px' }}>
            <span style={{ fontSize: 12, color: C.t2 }}>
              <span style={{ fontWeight: 700, color: C.t1 }}>{sd.sub}</span>：{sd.desc}
            </span>
          </div>
          <button onClick={handleGenerate} disabled={isGenerating} style={{
            padding: '9px 14px', borderRadius: 10, border: `1px solid ${C.line}`,
            background: C.card, color: C.t1, fontSize: 12, fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap', opacity: isGenerating ? 0.6 : 1, fontFamily: 'inherit' }}>
            {isGenerating ? '生成中…' : '問題を生成'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FEF0EF', border: '1px solid #FACACB', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: '#C0392B', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Question cards */}
        {exercises.map((ex, i) => (
          <QuestionCard
            key={`${step}-${i}`}
            index={i}
            exercise={ex}
            attempt={attempts[i] || ''}
            evaluation={evaluations[i] || null}
            mark={marks[`${step}-${i}`] || null}
            revealed={revealed}
            onAttemptChange={(v) => setAttempts((a) => ({ ...a, [i]: v }))}
            onMark={(v) => setMarks((m) => ({ ...m, [`${step}-${i}`]: v }))}
          />
        ))}

        {/* Bulk action */}
        {!revealed ? (
          <button onClick={handleCheck} disabled={isChecking} style={{
            width: '100%', padding: 15, borderRadius: 14, border: 'none',
            cursor: isChecking ? 'not-allowed' : 'pointer',
            background: C.ink, color: '#fff', fontSize: 15, fontWeight: 700,
            opacity: isChecking ? 0.7 : 1, fontFamily: 'inherit', marginTop: 4 }}>
            {isChecking ? 'Claude が採点中…' : `まとめて答え合わせ（${exercises.length}問）`}
          </button>
        ) : (
          <div>
            {/* Score summary */}
            {(gotCount + reviewCount) > 0 && (
              <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: '12px 16px',
                display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: ROLES.V.text, fontWeight: 700 }}>✓ できた {gotCount}</span>
                <span style={{ fontSize: 13, color: ROLES.Y.text, fontWeight: 700 }}>↻ 要復習 {reviewCount}</span>
                <span style={{ fontSize: 13, color: C.t3 }}>未採点 {exercises.length - gotCount - reviewCount}</span>
              </div>
            )}
            <button onClick={handleReset} style={{
              width: '100%', padding: 13, borderRadius: 14, cursor: 'pointer',
              border: `1px solid ${C.line}`, background: C.card, color: C.t1,
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
              やり直す
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

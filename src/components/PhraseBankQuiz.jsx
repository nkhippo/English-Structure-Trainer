import { useState } from 'react';
import {
  PHRASE_LEVELS,
  getLevelConfig,
  getExpressionsForLevel,
  pickRandomExpressions,
} from '../constants/framingExpressions.js';
import { generatePhraseQuestions, PHRASE_QUESTIONS_PER_SET } from '../api/claude.js';

const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D', ink: '#1C1B19' };

function FeedbackDetail({ question }) {
  return (
    <div style={{ fontSize: 12, lineHeight: 1.7 }}>
      <p style={{ margin: '0 0 8px' }}>{question.meaning}</p>
      {question.confusables?.length > 0 && (
        <div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 11, color: '#6b7280' }}>
            間違えやすい表現
          </p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {question.confusables.map(({ phrase, why }) => (
              <li key={phrase} style={{ marginBottom: 4 }}>
                <strong>{phrase}</strong> — {why}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PhraseBankQuiz({ apiKey }) {
  const [levelId, setLevelId] = useState('a12');
  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const level = getLevelConfig(levelId);
  const bankSize = getExpressionsForLevel(levelId).length;
  const perSet = Math.min(PHRASE_QUESTIONS_PER_SET, bankSize);
  const q = pool[idx];
  const isCorrect = checked && q && input.trim().toLowerCase() === q.expr.toLowerCase();
  const parts = q ? q.en.split('___') : [];
  const progress = pool.length ? Math.round((idx + (checked ? 1 : 0)) / pool.length * 100) : 0;

  function resetQuiz() {
    setPool([]);
    setIdx(0);
    setInput('');
    setChecked(false);
    setScore(0);
    setFinished(false);
    setError('');
  }

  function switchLevel(id) {
    setLevelId(id);
    resetQuiz();
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setError('');
    resetQuiz();
    try {
      const targets = pickRandomExpressions(levelId, perSet);
      const generated = await generatePhraseQuestions(apiKey, levelId, targets);
      setPool(generated);
    } catch (e) {
      setError(`問題生成エラー: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCheck() {
    if (checked || !q) return;
    setChecked(true);
    if (input.trim().toLowerCase() === q.expr.toLowerCase()) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (idx + 1 >= pool.length) {
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setInput('');
      setChecked(false);
    }
  }

  const inputWidth = q ? Math.min(250, Math.max(100, q.expr.length * 11 + 24)) : 120;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* CEFR level tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
        {PHRASE_LEVELS.map((lv) => {
          const active = levelId === lv.id;
          const count = getExpressionsForLevel(lv.id).length;
          return (
            <button
              key={lv.id}
              type="button"
              onClick={() => switchLevel(lv.id)}
              style={{
                padding: '10px 6px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                border: active ? `2px solid ${C.ink}` : `1px solid ${C.line}`,
                background: active ? C.card : '#F5F4F0',
                color: C.t1, textAlign: 'center',
              }}>
              <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{lv.label}</div>
              <div style={{ fontSize: 10, color: C.t2, lineHeight: 1.3 }}>{count}語</div>
            </button>
          );
        })}
      </div>

      {/* Level description + generate */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 12px', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: C.t2 }}>
            <span style={{ fontWeight: 700, color: C.t1 }}>{level.subtitle}</span>：{level.description}
            （1回 {perSet} 問をランダム出題）
          </span>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none',
            background: C.ink, color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.7 : 1, fontFamily: 'inherit',
          }}>
          {isGenerating ? '問題を作成中…' : pool.length ? '新しいセットを作成する' : '問題を作成する'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#FEF0EF', border: '1px solid #FACACB', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: '#C0392B', margin: 0 }}>{error}</p>
        </div>
      )}

      {pool.length === 0 && !isGenerating && !error && (
        <p style={{ fontSize: 13, color: C.t3, textAlign: 'center', margin: '24px 0' }}>
          「問題を作成する」で {bankSize} 語のバンクから {perSet} 問を出題します
        </p>
      )}

      {/* Finished screen */}
      {finished && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
            {score}
            <span style={{ fontSize: 24, fontWeight: 400, color: '#9ca3af' }}> / {pool.length}</span>
          </div>
          <div style={{ color: '#6b7280', marginTop: 6, marginBottom: 24, fontSize: 14 }}>
            正答率 {Math.round(score / pool.length * 100)}%
          </div>
          <button type="button" onClick={handleGenerate} disabled={isGenerating} style={styles.btnPrimary}>
            {isGenerating ? '作成中…' : 'もう一度（ランダム）'}
          </button>
        </div>
      )}

      {/* Active question */}
      {q && !finished && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: '#6b7280', minWidth: 52 }}>
              {idx + 1} / {pool.length}
            </span>
            <div style={{ flex: 1, height: 3, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#111', borderRadius: 2, width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
            <span style={{ fontSize: 12, color: '#6b7280', minWidth: 32, textAlign: 'right' }}>
              {score}点
            </span>
          </div>

          <div style={styles.card}>
            <div style={styles.jpBox}>「{q.jp}」</div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, fontSize: 14, lineHeight: '2.4', marginBottom: 14 }}>
              {parts[0] && <span>{parts[0]}</span>}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !checked && handleCheck()}
                disabled={checked}
                autoFocus
                style={{
                  ...styles.blankInput,
                  width: inputWidth,
                  borderBottomColor: checked
                    ? (isCorrect ? '#22c55e' : '#ef4444')
                    : '#9ca3af',
                  color: checked
                    ? (isCorrect ? '#15803d' : '#b91c1c')
                    : 'inherit',
                  background: checked && isCorrect ? '#f0fdf4' : 'transparent',
                }}
              />
              {parts[1] && <span>{parts[1]}</span>}
            </div>

            {!checked && (
              <button type="button" onClick={handleCheck} style={styles.btnPrimary}>
                答え合わせ
              </button>
            )}

            {checked && (
              <>
                <div style={{
                  ...styles.feedback,
                  background: isCorrect ? '#f0fdf4' : '#fff1f2',
                  borderColor: isCorrect ? '#bbf7d0' : '#fecdd3',
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>
                    {isCorrect
                      ? '✓ 正解！'
                      : <>✗ 不正解 — 正解：<strong style={{ background: '#f3f4f6', padding: '1px 8px', borderRadius: 4 }}>{q.expr}</strong></>
                    }
                  </div>
                  <FeedbackDetail question={q} />
                </div>
                <button type="button" onClick={handleNext} style={styles.btnSecondary}>
                  {idx + 1 < pool.length ? '次の問題 →' : '結果を見る →'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: '20px 24px',
  },
  jpBox: {
    background: '#f9fafb',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 15,
    lineHeight: 1.7,
    marginBottom: 18,
  },
  blankInput: {
    border: 'none',
    borderBottom: '2px solid',
    outline: 'none',
    fontSize: 14,
    fontFamily: 'inherit',
    textAlign: 'center',
    padding: '0 6px 2px',
    cursor: 'text',
  },
  feedback: {
    border: '1px solid',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  btnPrimary: {
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnSecondary: {
    background: 'transparent',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

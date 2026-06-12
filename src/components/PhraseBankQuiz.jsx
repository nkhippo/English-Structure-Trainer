import { useState } from 'react';
import {
  PHRASE_LEVELS,
  getLevelConfig,
  getExpressionsForLevel,
} from '../constants/framingExpressions.js';
import {
  generatePhraseQuestions,
  planPhraseQuizTargets,
  PHRASE_QUESTIONS_PER_SET,
  normalizePhraseEn,
} from '../api/claude.js';
import './PhraseBankQuiz.css';

const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D', ink: '#1C1B19' };

/** Split en at the single blank (___); strip stray underscores before the blank. */
function splitPhraseBlank(en) {
  const idx = en.indexOf('___');
  if (idx === -1) {
    const match = en.match(/_{2,}/);
    if (!match) return { before: en, after: '' };
    const at = en.indexOf(match[0]);
    return { before: en.slice(0, at).replace(/_+$/, ''), after: en.slice(at + match[0].length) };
  }
  return { before: en.slice(0, idx).replace(/_+$/, ''), after: en.slice(idx + 3) };
}

function FeedbackDetail({ question, selected, isCorrect }) {
  const selectedKey = selected.trim().toLowerCase();
  const selectedConfusable = question.confusables?.find(
    (c) => c.phrase.toLowerCase() === selectedKey,
  );
  const otherConfusables = (question.confusables ?? []).filter(
    (c) => c.phrase.toLowerCase() !== selectedKey,
  );

  return (
    <div style={{ fontSize: 12, lineHeight: 1.7, color: C.t2 }}>
      <div className="phrase-selected-note">
        <p className="phrase-selected-label">
          <strong>{selected}</strong>
          {isCorrect ? ' — あなたの回答' : ' — あなたが選んだ解答'}
        </p>
        <p style={{ margin: 0 }}>
          {isCorrect
            ? (question.correctFit || question.meaning)
            : (selectedConfusable?.why ?? 'この文脈では正解になりません。')}
        </p>
      </div>

      {isCorrect && question.meaning && question.correctFit && (
        <p style={{ margin: '0 0 10px' }}>{question.meaning}</p>
      )}

      {!isCorrect && (
        <div className="phrase-correct-note">
          <p className="phrase-selected-label">
            <strong>{question.expr}</strong> — 正解の理由
          </p>
          <p style={{ margin: 0 }}>{question.correctFit || question.meaning}</p>
        </div>
      )}

      {(isCorrect ? question.confusables : otherConfusables)?.length > 0 && (
        <div className="phrase-other-choices">
          <p className="phrase-other-label">{isCorrect ? 'ほかの選択肢' : 'ほかの誤答'}</p>
          {(isCorrect ? question.confusables : otherConfusables).map(({ phrase, why }) => (
            <div key={phrase} style={{ margin: '0 0 8px' }}>
              <p style={{ margin: '0 0 2px', fontWeight: 600, color: C.t1 }}>{phrase}</p>
              <p style={{ margin: 0 }}>{why}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PhraseBankQuiz({ apiKey }) {
  const [levelId, setLevelId] = useState('a12');
  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [choicesOpen, setChoicesOpen] = useState(false);

  const bankSize = getExpressionsForLevel(levelId).length;
  const perSet = Math.min(PHRASE_QUESTIONS_PER_SET, bankSize);
  const q = pool[idx];
  const isCorrect = checked && q && selected.trim().toLowerCase() === q.expr.toLowerCase();
  const blankParts = q ? splitPhraseBlank(normalizePhraseEn(q.en, q.category)) : { before: '', after: '' };
  const progress = pool.length ? Math.round((idx + (checked ? 1 : 0)) / pool.length * 100) : 0;

  function resetQuiz() {
    setPool([]);
    setIdx(0);
    setSelected('');
    setChecked(false);
    setScore(0);
    setAnsweredCount(0);
    setFinished(false);
    setError('');
    setChoicesOpen(false);
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
      const targets = planPhraseQuizTargets(levelId, perSet);
      const generated = await generatePhraseQuestions(apiKey, levelId, targets);
      setPool(generated);
    } catch (e) {
      setError(`問題生成エラー: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleChoice(choice) {
    if (checked || !q) return;
    setSelected(choice);
    setChecked(true);
    setAnsweredCount((n) => n + 1);
    if (choice.trim().toLowerCase() === q.expr.toLowerCase()) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (idx + 1 >= pool.length) {
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setSelected('');
      setChecked(false);
      setChoicesOpen(false);
    }
  }

  function choiceStyle(choice) {
    if (!checked) {
      return { ...styles.choiceBtn, border: `1px solid ${C.line}`, background: C.card };
    }
    const isAnswer = choice.toLowerCase() === q.expr.toLowerCase();
    if (isAnswer) {
      return { ...styles.choiceBtn, border: '2px solid #22c55e', background: '#f0fdf4', color: '#15803d', fontWeight: 600 };
    }
    if (choice === selected) {
      return { ...styles.choiceBtn, border: '2px solid #ef4444', background: '#fff1f2', color: '#b91c1c', fontWeight: 600 };
    }
    return { ...styles.choiceBtn, opacity: 0.5 };
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

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
              <div style={{ fontSize: 10, color: C.t2 }}>{count}語</div>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: C.t2, margin: '0 0 10px', lineHeight: 1.5 }}>
        <span style={{ fontWeight: 700, color: C.t1 }}>{getLevelConfig(levelId).subtitle}</span>
        ：{getLevelConfig(levelId).description}
      </p>

      {!pool.length && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none', marginBottom: 14,
            background: C.ink, color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.7 : 1, fontFamily: 'inherit',
          }}>
          {isGenerating ? '問題を作成中…' : '問題を作成する'}
        </button>
      )}

      {error && (
        <p style={{ fontSize: 13, color: '#C0392B', margin: '0 0 14px' }}>{error}</p>
      )}

      {finished && (
        <div style={{ textAlign: 'center', padding: '32px 8px' }}>
          <p style={{ fontSize: 48, fontWeight: 700, margin: '0 0 4px' }}>
            {score}<span style={{ fontSize: 22, color: C.t3 }}> / {pool.length}</span>
          </p>
          <p style={{ color: C.t2, margin: '0 0 20px', fontSize: 14 }}>
            正答率 {Math.round(score / pool.length * 100)}%
          </p>
          <button type="button" onClick={handleGenerate} disabled={isGenerating} style={styles.btnPrimary}>
            {isGenerating ? '作成中…' : 'もう一度'}
          </button>
        </div>
      )}

      {q && !finished && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 12, color: C.t2 }}>
            <span>{idx + 1} / {pool.length}</span>
            <div style={{ flex: 1, height: 3, background: '#e5e7eb', borderRadius: 2 }}>
              <div style={{ height: '100%', background: C.ink, borderRadius: 2, width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
            {answeredCount > 0 && (
              <span style={{ fontWeight: 600, color: C.t1 }}>正解 {score}</span>
            )}
          </div>

          <div style={styles.card}>
            <p style={{ fontSize: 15, margin: '0 0 10px', lineHeight: 1.6 }}>「{q.jp}」</p>
            <p style={{ fontSize: 14, margin: '0 0 14px', lineHeight: 1.7, color: C.t2 }}>
              {blankParts.before}<span style={{ color: C.t1, fontWeight: 600 }}>___</span>{blankParts.after}
            </p>

            <div className={`phrase-choices-accordion${checked ? ' phrase-choices-accordion--answered' : ''}`}>
              {!checked && (
                <button
                  type="button"
                  className="phrase-choices-toggle"
                  onClick={() => setChoicesOpen((open) => !open)}
                  aria-expanded={choicesOpen}
                >
                  <span>{choicesOpen ? '選択肢を隠す' : '選択肢を表示する'}</span>
                  <span className="phrase-choices-chevron" aria-hidden>{choicesOpen ? '▲' : '▼'}</span>
                </button>
              )}
              <div className={`phrase-choices-panel${choicesOpen || checked ? ' is-open' : ''}`}>
                <div className="phrase-choices" style={{ marginBottom: checked ? 14 : 0 }}>
                  {q.choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      className="phrase-choice-btn"
                      onClick={() => handleChoice(choice)}
                      disabled={checked || !choicesOpen}
                      style={choiceStyle(choice)}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {checked && (
              <div
                className="phrase-feedback"
                style={{
                  background: isCorrect ? '#f0fdf4' : '#fff1f2',
                  borderColor: isCorrect ? '#bbf7d0' : '#fecdd3',
                }}
              >
                <div className="phrase-feedback-header">
                  <p className="phrase-verdict">
                    {isCorrect ? '✓ 正解' : `✗ 正解は ${q.expr}`}
                  </p>
                  <button
                    type="button"
                    className="phrase-next-btn"
                    onClick={handleNext}
                  >
                    {idx + 1 < pool.length ? '次へ' : '結果を見る'}
                  </button>
                </div>
                <div className="phrase-feedback-body">
                  <FeedbackDetail question={q} selected={selected} isCorrect={isCorrect} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: C.card,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: '16px 18px',
  },
  choiceBtn: {
    padding: '11px 14px',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  btnPrimary: {
    background: C.ink,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

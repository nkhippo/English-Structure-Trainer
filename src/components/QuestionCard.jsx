import { ROLES } from '../constants/roles.js';

const C = { card: '#FFFFFF', page: '#FAF9F6', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D' };

/**
 * @param {{
 *   index: number,
 *   exercise: { jp: string, en: string, parts: object[] },
 *   attempt: string,
 *   evaluation: { correct: boolean, feedback: string, correction: string|null } | null,
 *   mark: 'got' | 'review' | null,
 *   revealed: boolean,
 *   onAttemptChange: (v: string) => void,
 *   onMark: (v: 'got' | 'review') => void,
 * }} props
 */
export default function QuestionCard({ index, exercise, attempt, evaluation, mark, revealed, onAttemptChange, onMark }) {
  const { jp, en, parts } = exercise;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.t3, paddingTop: 3, flexShrink: 0 }}>Q{index + 1}</span>
        <p style={{ fontSize: 19, fontWeight: 600, margin: 0, lineHeight: 1.6, flex: 1, color: C.t1 }}>{jp}</p>
        {mark && (
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginTop: 4,
            background: mark === 'got' ? ROLES.V.bg : ROLES.Y.bg,
            color: mark === 'got' ? ROLES.V.text : ROLES.Y.text }}>
            {mark === 'got' ? 'できた' : '要復習'}
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        value={attempt}
        onChange={(e) => onAttemptChange(e.target.value)}
        placeholder="英訳を入力…"
        rows={2}
        style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontSize: 15, lineHeight: 1.5,
          padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.line}`,
          color: C.t1, background: '#fff', fontFamily: 'inherit',
          marginBottom: revealed ? 14 : 0, outline: 'none' }} />

      {/* Revealed section */}
      {revealed && (
        <div>
          {/* User's attempt */}
          {attempt.trim() && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 5px', letterSpacing: '.05em' }}>あなたの解答</p>
              <div style={{ background: C.page, borderRadius: 10, padding: '8px 12px', fontSize: 15, color: C.t2, lineHeight: 1.5 }}>{attempt}</div>
            </div>
          )}

          {/* AI evaluation */}
          {evaluation && (
            <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10,
              background: evaluation.correct ? ROLES.V.bg : ROLES.Y.bg,
              border: `1px solid ${evaluation.correct ? ROLES.V.border : ROLES.Y.border}` }}>
              <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 4px', color: evaluation.correct ? ROLES.V.text : ROLES.Y.text }}>
                {evaluation.correct ? '✓ 正解' : '✗ 要修正'}
              </p>
              <p style={{ fontSize: 13, margin: '0', color: C.t1, lineHeight: 1.5 }}>{evaluation.feedback}</p>
              {evaluation.correction && (
                <p style={{ fontSize: 13, margin: '8px 0 0', color: C.t1, fontWeight: 600 }}>正解: {evaluation.correction}</p>
              )}
            </div>
          )}

          {/* Frame */}
          <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 5px', letterSpacing: '.05em' }}>骨格フレーム</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {parts.map((p, j) => (
              <span key={j} style={{ fontSize: 13, fontWeight: 700, color: ROLES[p.r].text }}>
                {p.r}{j < parts.length - 1 ? ' ·' : ''}
              </span>
            ))}
          </div>

          {/* Color-coded answer */}
          <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 8px', letterSpacing: '.05em' }}>模範解答（語順のまま色分け）</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 8px', alignItems: 'flex-end', marginBottom: 14 }}>
            {parts.map((p, j) => {
              const s = ROLES[p.r];
              return (
                <span key={j} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 10.5, color: s.text, fontWeight: 700, marginBottom: 2 }}>{p.r}</span>
                  <span style={{ fontSize: 17, color: C.t1, borderBottom: `2.5px solid ${s.line}`, paddingBottom: 2, lineHeight: 1.4 }}>{p.t}</span>
                </span>
              );
            })}
          </div>

          {/* Detail chips */}
          <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 8px', letterSpacing: '.05em' }}>各チャンクの役割</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
            {parts.map((p, j) => {
              const s = ROLES[p.r];
              return (
                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 9px', borderRadius: 7,
                    background: s.bg, color: s.text, border: `1px solid ${s.border}`,
                    flexShrink: 0, lineHeight: 1.5 }}>{p.t}</span>
                  <span style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{s.label}{p.n ? ` · ${p.n}` : ''}</span>
                </div>
              );
            })}
          </div>

          {/* Self-assessment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => onMark('review')} style={{
              padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              border: `1px solid ${ROLES.Y.border}`, background: mark === 'review' ? ROLES.Y.text : ROLES.Y.bg,
              color: mark === 'review' ? '#fff' : ROLES.Y.text }}>
              ↻ 要復習
            </button>
            <button onClick={() => onMark('got')} style={{
              padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              border: `1px solid ${ROLES.V.border}`, background: mark === 'got' ? ROLES.V.text : ROLES.V.bg,
              color: mark === 'got' ? '#fff' : ROLES.V.text }}>
              ✓ できた
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

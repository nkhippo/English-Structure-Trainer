import { createPortal } from 'react-dom';
import { ROLES } from '../constants/roles.js';
import { roleStyle } from '../utils/parts.js';
import { getStep7ChapterAnchor, getStep7ChapterLabel } from '../constants/step7.js';
import VocabHints from './VocabHints.jsx';
import { ColorChunk, DetailChunk } from './PartBreakdown.jsx';
import { POINTS_PER_QUESTION } from '../api/claude.js';
import QuestionHeader from './QuestionHeader.jsx';
import { usePinnedSectionHeader } from '../hooks/usePinnedSectionHeader.js';

const C = { card: '#FFFFFF', page: '#FAF9F6', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D' };

/**
 * @param {{
 *   index: number,
 *   exercise: { jp: string, en: string, parts: object[], nuance?: string, vocabHints?: { jp: string, en: string }[] },
 *   attempt: string,
 *   evaluation: { score: number, correct: boolean, feedback: string, correction: string|null } | null,
 *   revealed: boolean,
 *   onAttemptChange: (v: string) => void,
 *   onOpenGuideChapter?: (anchor: string) => void,
 * }} props
 */
export default function QuestionCard({ index, exercise, attempt, evaluation, revealed, onAttemptChange, onOpenGuideChapter }) {
  const { jp, en } = exercise;
  const parts = (exercise.parts ?? []).filter((p) => p?.t);
  const { sectionRef, sentinelRef, pinned, layout } = usePinnedSectionHeader(revealed);

  const inFlowHeaderStyle = revealed ? {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    margin: '-20px -20px 0',
    padding: '20px 20px 12px',
    visibility: pinned ? 'hidden' : 'visible',
  } : {
    marginBottom: 12,
  };

  const pinnedHeader = pinned && layout ? createPortal(
    <QuestionHeader
      index={index}
      jp={jp}
      style={{
        position: 'fixed',
        top: layout.top,
        left: layout.left,
        width: layout.width,
        zIndex: 30,
        margin: 0,
        padding: '12px 20px',
        boxSizing: 'border-box',
        borderBottom: `1px solid ${C.line}`,
      }}
    />,
    document.body,
  ) : null;

  return (
    <section ref={sectionRef} style={{ marginBottom: 12 }}>
      {revealed && <div ref={sentinelRef} aria-hidden="true" style={{ height: 0 }} />}

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20 }}>
        <QuestionHeader index={index} jp={jp} style={inFlowHeaderStyle} />

        {(exercise.cefr || exercise.operationTag) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {exercise.cefr && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: C.t3,
                border: `1px solid ${C.line}`, borderRadius: 6, padding: '2px 8px',
              }}>
                CEFR {exercise.cefr}
              </span>
            )}
            {exercise.operationTag && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: C.t1,
                background: C.page, border: `1px solid ${C.line}`, borderRadius: 6, padding: '2px 8px',
              }}>
                {exercise.operationTag}
              </span>
            )}
          </div>
        )}

        <VocabHints key={jp} hints={exercise.vocabHints} revealed={revealed} />

        {/* Textarea (hidden after answer check) */}
        {!revealed && (
          <textarea
            value={attempt}
            onChange={(e) => onAttemptChange(e.target.value)}
            placeholder="英訳を入力…"
            rows={2}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontSize: 15, lineHeight: 1.5,
              padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.line}`,
              color: C.t1, background: '#fff', fontFamily: 'inherit', outline: 'none' }} />
        )}

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

            {/* Model answer (100-point reference) */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 5px', letterSpacing: '.05em' }}>模範解答</p>
              <div style={{ background: C.page, borderRadius: 10, padding: '8px 12px', fontSize: 15, color: C.t2, lineHeight: 1.5 }}>{en}</div>
            </div>

            {/* AI evaluation */}
            {evaluation && (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                background: evaluation.correct ? ROLES.V.bg : ROLES.Y.bg,
                border: `1px solid ${evaluation.correct ? ROLES.V.border : ROLES.Y.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: evaluation.correct ? ROLES.V.text : ROLES.Y.text }}>
                    {evaluation.correct ? '✓ 正解' : '✗ 要修正'}
                  </p>
                  <span style={{ fontSize: 13, fontWeight: 700, color: evaluation.correct ? ROLES.V.text : ROLES.Y.text }}>
                    {evaluation.score} / {POINTS_PER_QUESTION}点
                  </span>
                </div>
                <p style={{ fontSize: 13, margin: '0', color: C.t1, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{evaluation.feedback}</p>
              </div>
            )}

            {/* Frame */}
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 5px', letterSpacing: '.05em' }}>骨格フレーム</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {parts.map((p, j) => (
                <span key={j} style={{ fontSize: 13, fontWeight: 700, color: roleStyle(p.r).text }}>
                  {p.r}{j < parts.length - 1 ? ' ·' : ''}
                </span>
              ))}
            </div>

            {/* Color-coded answer */}
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 8px', letterSpacing: '.05em' }}>模範解答（語順のまま色分け）</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 8px', alignItems: 'flex-end', marginBottom: 14 }}>
              {parts.map((p, j) => (
                <ColorChunk key={j} part={p} />
              ))}
            </div>

            {/* Detail chips */}
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 8px', letterSpacing: '.05em' }}>各チャンクの役割</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {parts.map((p, j) => (
                <DetailChunk key={j} part={p} />
              ))}
            </div>

            {exercise.nuance && (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: C.page, border: `1px solid ${C.line}` }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 4px', letterSpacing: '.05em' }}>模範解答のポイント</p>
                <p style={{ fontSize: 12, color: C.t1, margin: 0, lineHeight: 1.6 }}>{exercise.nuance}</p>
                {exercise.operationTag && onOpenGuideChapter && (
                  <button
                    type="button"
                    onClick={() => onOpenGuideChapter(getStep7ChapterAnchor(exercise.operationTag))}
                    style={{
                      marginTop: 8, padding: 0, border: 'none', background: 'none',
                      fontSize: 11, fontWeight: 600, color: C.t2, cursor: 'pointer',
                      fontFamily: 'inherit', textDecoration: 'underline',
                    }}
                  >
                    構造ガイド：{getStep7ChapterLabel(exercise.operationTag)}を読む →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {pinnedHeader}
    </section>
  );
}

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { getRenderableParts, roleStyle } from '../utils/parts.js';
import { getStep7ChapterAnchor, getStep7ChapterLabel } from '../constants/step7.js';
import VocabHints from './VocabHints.jsx';
import { ColorChunk } from './PartBreakdown.jsx';
import { POINTS_PER_QUESTION } from '../api/claude.js';
import { getScoreStyle } from '../constants/scoring.js';
import QuestionHeader from './QuestionHeader.jsx';
import { usePinnedSectionHeader } from '../hooks/usePinnedSectionHeader.js';

const C = { card: '#FFFFFF', page: '#FAF9F6', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D' };

/**
 * @param {{
 *   index: number,
 *   exercise: { jp: string, en: string, parts: object[], nuance?: string, enNative?: string, nuanceNative?: string, vocabHints?: { jp: string, en: string }[] },
 *   attempt: string,
 *   evaluation: { score: number, correct: boolean, feedback: string, correction: string|null, errorTags?: string[] } | null,
 *   revealed: boolean,
 *   onAttemptChange: (v: string) => void,
 *   onOpenGuideChapter?: (anchor: string) => void,
 *   onLoadEnNative?: () => void,
 *   enNativeLoading?: boolean,
 * }} props
 */
export default function QuestionCard({
  index, exercise, attempt, evaluation, revealed, onAttemptChange, onOpenGuideChapter,
  onLoadEnNative, enNativeLoading = false,
}) {
  const { jp, en } = exercise;
  const parts = getRenderableParts(exercise.parts);
  const [enNativeOpen, setEnNativeOpen] = useState(false);
  const showEnNative = enNativeOpen && Boolean(exercise.enNative);
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

      <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, minWidth: 0, overflow: 'hidden' }}>
        <QuestionHeader index={index} jp={jp} style={inFlowHeaderStyle} />

        <VocabHints key={jp} hints={exercise.vocabHints} revealed={revealed} />

        {/* Textarea (hidden after answer check) */}
        {!revealed && (
          <textarea
            value={attempt}
            onChange={(e) => onAttemptChange(e.target.value.replace(/[\r\n]+/g, ' '))}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            spellCheck
            lang="en"
            placeholder="英訳を入力…"
            rows={2}
            wrap="soft"
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontSize: 15, lineHeight: 1.5,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere',
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

            {/* Model answer (100-point reference — grammar/structure) */}
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 5px', letterSpacing: '.05em' }}>模範解答（文法・構造）</p>
              <div style={{ background: C.page, borderRadius: 10, padding: '8px 12px', fontSize: 15, color: C.t2, lineHeight: 1.5 }}>{en}</div>
            </div>

            {exercise.enNative && showEnNative && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 5px', letterSpacing: '.05em' }}>ネイティブらしい表現</p>
                <div style={{ background: '#F5F8FC', borderRadius: 10, padding: '8px 12px', fontSize: 15, color: C.t2, lineHeight: 1.5, border: '1px solid #E2EAF2' }}>{exercise.enNative}</div>
                {exercise.nuanceNative && (
                  <p style={{ fontSize: 12, color: C.t2, margin: '6px 0 0', lineHeight: 1.6 }}>{exercise.nuanceNative}</p>
                )}
              </div>
            )}
            {!exercise.enNative && onLoadEnNative && (
              <button
                type="button"
                onClick={() => {
                  setEnNativeOpen(true);
                  onLoadEnNative();
                }}
                disabled={enNativeLoading}
                style={{
                  width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 10,
                  border: `1px solid ${C.line}`, background: C.page, color: C.t1,
                  fontSize: 13, fontWeight: 600, cursor: enNativeLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: enNativeLoading ? 0.7 : 1,
                }}
              >
                {enNativeLoading ? '生成中…' : 'ネイティブらしい表現を見る'}
              </button>
            )}
            {exercise.enNative && !showEnNative && (
              <button
                type="button"
                onClick={() => setEnNativeOpen(true)}
                style={{
                  width: '100%', marginBottom: 12, padding: '10px 12px', borderRadius: 10,
                  border: `1px solid ${C.line}`, background: C.page, color: C.t1,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ネイティブらしい表現を見る
              </button>
            )}

            {/* AI evaluation */}
            {evaluation && (() => {
              const unentered = !attempt.trim();
              const style = getScoreStyle(evaluation.score, { unentered });
              return (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                background: style.bg,
                border: `1px solid ${style.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: style.text }}>
                    {evaluation.correct ? '✓ 正解' : unentered ? '— 未入力' : '✗ 要修正'}
                  </p>
                  <span style={{ fontSize: 13, fontWeight: 700, color: style.text }}>
                    {evaluation.score} / {POINTS_PER_QUESTION}点
                  </span>
                </div>
                <p style={{ fontSize: 13, margin: '0', color: C.t1, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{evaluation.feedback}</p>
              </div>
              );
            })()}

            {/* Frame */}
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 5px', letterSpacing: '.05em' }}>骨格フレーム</p>
            {parts.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                {parts.map((p, j) => (
                  <span key={j} style={{ fontSize: 13, fontWeight: 700, color: roleStyle(p.r).text }}>
                    {p.r}{j < parts.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: C.t3, margin: '0 0 12px', fontStyle: 'italic' }}>構造データがありません</p>
            )}

            {/* Color-coded answer */}
            <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 8px', letterSpacing: '.05em' }}>模範解答（語順のまま色分け）</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, minWidth: 0 }}>
              {parts.map((p, j) => (
                <ColorChunk key={j} part={p} />
              ))}
            </div>

            {exercise.nuance && (
              <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: C.page, border: `1px solid ${C.line}` }}>
                <p style={{ fontSize: 10.5, fontWeight: 700, color: C.t3, margin: '0 0 4px', letterSpacing: '.05em' }}>模範解答のポイント（文法・構造）</p>
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

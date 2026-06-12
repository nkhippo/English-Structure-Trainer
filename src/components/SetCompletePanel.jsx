const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', ink: '#1C1B19' };

/**
 * Shown after grading when the current step is the final one (Step 7).
 */
export default function SetCompletePanel({ step, onGoToFirstStep }) {
  if (step !== 7) return null;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 12,
      padding: '14px 16px',
      marginBottom: 14,
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.t1, margin: '0 0 6px' }}>
        Step 7 セット完了
      </p>
      <p style={{ fontSize: 12, color: C.t2, margin: '0 0 12px', lineHeight: 1.5 }}>
        発展構文の練習お疲れさまでした。最初の Step から復習することもできます。
      </p>
      <button
        type="button"
        onClick={onGoToFirstStep}
        style={{
          padding: '10px 18px',
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          background: C.card,
          color: C.t1,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        最初の Step（Step 3）に戻る
      </button>
    </div>
  );
}

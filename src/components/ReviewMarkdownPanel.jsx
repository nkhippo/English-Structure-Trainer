import { useRef } from 'react';

const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D', ink: '#1C1B19' };

/**
 * @param {{
 *   review: { questionCount: number, totalScore?: number | null, maxScore?: number | null, savedAt?: string } | null,
 *   followUpCount: number,
 *   stepMismatch: boolean,
 *   onFileSelect: (file: File) => void,
 *   onFollowUp: () => void,
 *   isGenerating: boolean,
 *   fileError: string,
 * }} props
 */
export default function ReviewMarkdownPanel({
  review,
  followUpCount,
  stepMismatch,
  onFileSelect,
  onFollowUp,
  isGenerating,
  fileError,
}) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  }

  const savedLabel = review?.savedAt
    ? new Date(review.savedAt).toLocaleString('ja-JP', { hour12: false })
    : null;

  return (
    <div style={{
      marginTop: 12,
      padding: '14px 16px',
      borderRadius: 12,
      border: `1px solid ${C.line}`,
      background: C.card,
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px', color: C.t1 }}>
        答え合わせ結果から弱点克服
      </p>
      <p style={{ fontSize: 12, color: C.t2, margin: '0 0 12px', lineHeight: 1.5 }}>
        コピーした Markdown（.md / .txt）を読み込むと、誤り傾向を踏まえた再出題ができます。
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isGenerating}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          background: '#FAF9F6',
          color: C.t1,
          fontSize: 13,
          fontWeight: 600,
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          opacity: isGenerating ? 0.7 : 1,
        }}
      >
        Markdownファイルを選ぶ
      </button>

      {fileError && (
        <p style={{ fontSize: 12, color: '#C0392B', margin: '8px 0 0' }}>{fileError}</p>
      )}

      {review && (
        <div style={{
          marginTop: 10,
          padding: '10px 12px',
          borderRadius: 8,
          background: '#FAF9F6',
          fontSize: 12,
          color: C.t2,
          lineHeight: 1.5,
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: C.t1 }}>
            読み込み済み: {review.questionCount}問
            {review.totalScore != null && review.maxScore != null
              ? ` · ${review.totalScore}/${review.maxScore}点`
              : ''}
          </p>
          {savedLabel && (
            <p style={{ margin: '4px 0 0', color: C.t3 }}>保存: {savedLabel}</p>
          )}
          {stepMismatch && (
            <p style={{ margin: '6px 0 0', color: '#B45309' }}>
              ファイルの Step と現在のタブが異なります。内容は参考にして出題します。
            </p>
          )}
        </div>
      )}

      {followUpCount > 0 && review && (
        <button
          type="button"
          onClick={onFollowUp}
          disabled={isGenerating}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 12,
            marginTop: 10,
            border: `1px solid ${C.line}`,
            background: C.card,
            color: C.t1,
            fontSize: 15,
            fontWeight: 700,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.7 : 1,
            fontFamily: 'inherit',
          }}
        >
          {isGenerating ? '弱点克服問題を作成中…' : `弱点克服問題を作成（${followUpCount}問）`}
        </button>
      )}

      {review && followUpCount === 0 && (
        <p style={{ fontSize: 12, color: C.t3, margin: '10px 0 0', textAlign: 'center' }}>
          このセットは再出題の上限に達しています（1問セットの後）
        </p>
      )}
    </div>
  );
}

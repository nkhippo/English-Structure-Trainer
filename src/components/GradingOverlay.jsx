import './GradingOverlay.css';

export default function GradingOverlay({ questionCount, gradedCount = 0 }) {
  const progress = gradedCount > 0
    ? `${gradedCount}/${questionCount}問`
    : `${questionCount}問`;

  return (
    <div className="grading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="grading-panel">
        <div className="grading-spinner" aria-hidden="true" />
        <p className="grading-title">Claude が採点中…</p>
        <p className="grading-sub">
          {progress}の解答を評価しています
          <br />
          少々お待ちください
        </p>
      </div>
    </div>
  );
}

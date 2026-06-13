import './GradingOverlay.css';

export default function GradingOverlay({ questionCount }) {
  return (
    <div className="grading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="grading-panel">
        <div className="grading-spinner" aria-hidden="true" />
        <p className="grading-title">Claude が採点中…</p>
        <p className="grading-sub">
          {questionCount}問の解答を評価しています
          <br />
          少々お待ちください
        </p>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { SCORE_BANDS } from '../constants/scoring.js';
import './ScoringCriteriaModal.css';

export default function ScoringCriteriaModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="scoring-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scoring-title"
      onClick={onClose}
    >
      <div className="scoring-panel" onClick={(e) => e.stopPropagation()}>
        <div className="scoring-header">
          <h2 id="scoring-title">採点基準（10点満点）</h2>
          <button type="button" className="scoring-close" onClick={onClose}>
            閉じる
          </button>
        </div>
        <div className="scoring-body">
          <p className="scoring-note">
            8点以上を正解とします。0点は未入力の場合のみです（解答がある場合の最低点は1点）。
          </p>
          <table className="scoring-table">
            <thead>
              <tr>
                <th scope="col">点数</th>
                <th scope="col">意味</th>
              </tr>
            </thead>
            <tbody>
              {SCORE_BANDS.map((band) => (
                <tr key={band.label}>
                  <td
                    style={{
                      background: band.bg,
                      color: band.text,
                      borderColor: band.border,
                    }}
                  >
                    {band.label}
                  </td>
                  <td
                    style={{
                      background: band.bg,
                      color: '#1c1b19',
                      borderColor: band.border,
                    }}
                  >
                    {band.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

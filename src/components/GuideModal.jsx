import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import textbook from '../assets/textbook.md?raw';
import './GuideModal.css';

export default function GuideModal({ open, onClose }) {
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
      className="guide-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      onClick={onClose}
    >
      <div className="guide-panel" onClick={(e) => e.stopPropagation()}>
        <div className="guide-header">
          <h2 id="guide-title">英文構造ガイドブック</h2>
          <button type="button" className="guide-close" onClick={onClose}>
            閉じる
          </button>
        </div>
        <div className="guide-body">
          <div className="guide-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{textbook}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

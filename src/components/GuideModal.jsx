import { useCallback, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import textbook from '../assets/textbook.md?raw';
import './GuideModal.css';

function getTextFromChildren(children) {
  if (children == null) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getTextFromChildren).join('');
  if (typeof children === 'object' && children.props?.children != null) {
    return getTextFromChildren(children.props.children);
  }
  return '';
}

const CHAPTER3_STEPS_ANCHOR = 'ch-3-steps';

function chapterIdFromHeading(children) {
  const match = getTextFromChildren(children).match(/^第(\d+)章/);
  return match ? `ch-${match[1]}` : null;
}

function chapterNumberFromId(id) {
  if (!id) return null;
  const match = id.match(/^ch-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function partIdFromHeading(children) {
  const text = getTextFromChildren(children).trim();
  const partMatch = text.match(/^第(\d+)部/);
  if (partMatch) return `part-${partMatch[1]}`;
  if (text.startsWith('付録')) return 'appendix';
  return null;
}

export default function GuideModal({ open, onClose }) {
  const handleAnchorClick = useCallback((event, href) => {
    if (!href?.startsWith('#')) return;

    event.preventDefault();
    const target = document.getElementById(href.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const markdownComponents = useMemo(
    () => ({
      h1: ({ children, ...props }) => {
        const id = partIdFromHeading(children);

        return (
          <h1
            id={id ?? undefined}
            className={id ? 'guide-part-heading' : undefined}
            {...props}
          >
            {children}
          </h1>
        );
      },
      h2: ({ children, ...props }) => {
        const id = chapterIdFromHeading(children);
        const chapterNum = chapterNumberFromId(id);
        const showBackLink = chapterNum != null && chapterNum >= 4;

        return (
          <h2
            id={id ?? undefined}
            className={id ? 'guide-chapter-heading' : undefined}
            {...props}
          >
            <span className="guide-chapter-heading-main">{children}</span>
            {showBackLink && (
              <a
                href={`#${CHAPTER3_STEPS_ANCHOR}`}
                className="guide-chapter-back-link"
                onClick={(event) => handleAnchorClick(event, `#${CHAPTER3_STEPS_ANCHOR}`)}
              >
                第3章の対応表へ
              </a>
            )}
          </h2>
        );
      },
      h3: ({ children, ...props }) => {
        const isStepsTable =
          getTextFromChildren(children).trim() === '学習ステップとアプリの対応';

        return (
          <h3
            id={isStepsTable ? CHAPTER3_STEPS_ANCHOR : undefined}
            className={isStepsTable ? 'guide-steps-anchor' : undefined}
            {...props}
          >
            {children}
          </h3>
        );
      },
      a: ({ href, children, ...props }) => (
        <a
          href={href}
          onClick={href?.startsWith('#') ? (event) => handleAnchorClick(event, href) : undefined}
          {...props}
        >
          {children}
        </a>
      ),
    }),
    [handleAnchorClick],
  );

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
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {textbook}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

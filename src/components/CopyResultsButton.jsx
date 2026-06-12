import { useState } from 'react';

const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', ink: '#1C1B19' };

function ClipboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="2" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 6h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V6z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/**
 * @param {{ getMarkdown: () => string }} props
 */
export default function CopyResultsButton({ getMarkdown }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getMarkdown());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        width: '100%',
        padding: 13,
        borderRadius: 14,
        cursor: 'pointer',
        border: `1px solid ${C.line}`,
        background: copied ? '#f0fdf4' : C.card,
        color: copied ? '#15803d' : C.t1,
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 4,
      }}
    >
      <ClipboardIcon />
      {copied ? 'コピーしました' : '結果をコピー（Markdown）'}
    </button>
  );
}

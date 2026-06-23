import { useEffect, useMemo, useState } from 'react';
import { normalizeVocabHints } from '../utils/vocabHints.js';

const C = { page: '#FAF9F6', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D', accent: '#5B7FA5' };

/**
 * @param {{ hints: { jp: string, en: string }[], revealed?: boolean }} props
 */
export default function VocabHints({ hints, revealed = false }) {
  const [open, setOpen] = useState(false);
  const items = useMemo(() => normalizeVocabHints(hints), [hints]);

  useEffect(() => {
    setOpen(false);
  }, [items]);

  if (!items.length || revealed) return null;

  return (
    <div style={{ marginBottom: 10 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          borderRadius: 8,
          border: `1px solid ${open ? C.accent : C.line}`,
          background: open ? '#F0F4F8' : C.page,
          color: open ? C.accent : C.t2,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
        <span aria-hidden="true">💡</span>
        単語ヒント
        <span aria-hidden="true" style={{ fontSize: 10, color: C.t3 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          marginTop: 8,
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          background: C.page,
        }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((h, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13, lineHeight: 1.5 }}>
                {h.jp ? <span style={{ color: C.t2, flexShrink: 0 }}>{h.jp}</span> : null}
                <span style={{ color: C.t3, flexShrink: 0 }}>→</span>
                {h.en ? <span style={{ color: C.t1, fontWeight: 600 }}>{h.en}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

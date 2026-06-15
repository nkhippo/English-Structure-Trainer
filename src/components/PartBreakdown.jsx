import { roleStyle } from '../utils/parts.js';

const C = { t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D' };

/**
 * Color-coded chunk with optional nested inner structure.
 * @param {{ part: import('../utils/parts.js').Part, nested?: boolean }} props
 */
export function ColorChunk({ part, nested = false }) {
  const hasInner = part.inner?.length > 0;
  const s = roleStyle(part.r);

  if (hasInner) {
    return (
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          width: nested ? 'auto' : '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          border: `2px solid ${s.line}`,
          borderRadius: 8,
          padding: nested ? '4px 6px' : '6px 8px',
          background: s.bg,
        }}
      >
        <span
          style={{
            fontSize: nested ? 9 : 10.5,
            color: s.text,
            fontWeight: 700,
            marginBottom: 4,
            textAlign: nested ? 'center' : 'left',
          }}
        >
          {part.r}
        </span>
        <span
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 4px',
            alignItems: 'flex-end',
            minWidth: 0,
          }}
        >
          {part.inner.map((child, i) => (
            <ColorChunk key={i} part={child} nested />
          ))}
        </span>
      </span>
    );
  }

  const fontSize = nested ? 14 : 17;
  return (
    <span
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: nested ? 'center' : 'flex-start',
        maxWidth: '100%',
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: nested ? 9 : 10.5, color: s.text, fontWeight: 700, marginBottom: 2 }}>{part.r}</span>
      <span
        style={{
          fontSize,
          color: C.t1,
          borderBottom: `2.5px solid ${s.line}`,
          paddingBottom: 2,
          lineHeight: 1.4,
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        }}
      >
        {part.t}
      </span>
    </span>
  );
}

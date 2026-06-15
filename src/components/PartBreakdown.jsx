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

/**
 * Detail row for 各チャンクの役割 with optional nested inner structure.
 * @param {{ part: import('../utils/parts.js').Part, depth?: number }} props
 */
export function DetailChunk({ part, depth = 0 }) {
  const s = roleStyle(part.r);
  const hasInner = part.inner?.length > 0;

  return (
    <div
      style={{
        padding: depth === 0 ? '10px 12px' : undefined,
        borderRadius: depth === 0 ? 10 : undefined,
        background: depth === 0 ? s.bg : undefined,
        border: depth === 0 ? `1px solid ${s.border}` : undefined,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span
          style={{
            fontSize: depth > 0 ? 11 : 13,
            fontWeight: 600,
            padding: depth > 0 ? '2px 9px' : 0,
            borderRadius: depth > 0 ? 7 : 0,
            background: depth > 0 ? s.bg : 'transparent',
            color: s.text,
            border: depth > 0 ? `1px solid ${s.border}` : 'none',
            alignSelf: 'flex-start',
            maxWidth: '100%',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {part.t}
        </span>
        <span
          style={{
            fontSize: depth > 0 ? 11 : 12,
            color: C.t2,
            lineHeight: 1.6,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <span style={{ fontWeight: 600, color: s.text }}>{s.label}</span>
          {part.n ? ` · ${part.n}` : ''}
        </span>
      </div>
      {hasInner && (
        <div
          style={{
            marginTop: 8,
            paddingLeft: 12,
            borderLeft: `2px solid ${s.line}`,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.t3,
              margin: '0 0 6px',
              letterSpacing: '.05em',
            }}
          >
            内部構造
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {part.inner.map((child, i) => (
              <DetailChunk key={i} part={child} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

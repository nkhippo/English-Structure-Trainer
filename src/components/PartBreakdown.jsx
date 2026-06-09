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
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'stretch',
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
            textAlign: 'center',
          }}
        >
          {part.r}
        </span>
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 4px', alignItems: 'flex-end' }}>
          {part.inner.map((child, i) => (
            <ColorChunk key={i} part={child} nested />
          ))}
        </span>
      </span>
    );
  }

  const fontSize = nested ? 14 : 17;
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: nested ? 9 : 10.5, color: s.text, fontWeight: 700, marginBottom: 2 }}>{part.r}</span>
      <span
        style={{
          fontSize,
          color: C.t1,
          borderBottom: `2.5px solid ${s.line}`,
          paddingBottom: 2,
          lineHeight: 1.4,
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
    <div style={{ marginLeft: depth > 0 ? 0 : undefined }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span
          style={{
            fontSize: depth > 0 ? 11 : 12,
            fontWeight: 600,
            padding: '2px 9px',
            borderRadius: 7,
            background: s.bg,
            color: s.text,
            border: `1px solid ${s.border}`,
            flexShrink: 0,
            lineHeight: 1.5,
          }}
        >
          {part.t}
        </span>
        <span style={{ fontSize: depth > 0 ? 11 : 12, color: C.t2, lineHeight: 1.5 }}>
          {s.label}
          {part.n ? ` · ${part.n}` : ''}
        </span>
      </div>
      {hasInner && (
        <div
          style={{
            marginTop: 6,
            marginLeft: 4,
            paddingLeft: 12,
            borderLeft: `2px solid ${s.line}`,
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.t3,
              margin: '0 0 4px',
              letterSpacing: '.05em',
            }}
          >
            内部構造
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {part.inner.map((child, i) => (
              <DetailChunk key={i} part={child} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

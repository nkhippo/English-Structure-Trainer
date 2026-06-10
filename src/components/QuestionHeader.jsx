const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t3: '#9A968D' };

/**
 * @param {{ index: number, jp: string, style?: object }} props
 */
export default function QuestionHeader({ index, jp, style }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      background: C.card,
      boxShadow: `0 1px 0 ${C.line}`,
      ...style,
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.t3, paddingTop: 3, flexShrink: 0 }}>Q{index + 1}</span>
      <p style={{ fontSize: 19, fontWeight: 600, margin: 0, lineHeight: 1.6, flex: 1, color: C.t1 }}>{jp}</p>
    </div>
  );
}

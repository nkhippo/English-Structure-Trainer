import { STEP7_OPERATIONS, STEP7_THREADS } from '../constants/step7.js';

const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D' };

/**
 * "この Step で学ぶこと" panel — currently Step 7 only.
 */
export default function StepLearnPanel({ step }) {
  if (step !== 7) return null;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 10,
      padding: '12px 14px',
      marginBottom: 10,
      fontSize: 12,
      color: C.t2,
      lineHeight: 1.55,
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: C.t3, margin: '0 0 8px', letterSpacing: '.04em' }}>
        この Step で学ぶこと
      </p>
      <p style={{ margin: '0 0 10px', color: C.t1, fontWeight: 600 }}>
        骨格への7つの操作（操作レベルで MECE／1文に複数操作が併用されうる）
      </p>
      <div style={{ overflowX: 'auto', marginBottom: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.line}` }}>
              <th style={{ textAlign: 'left', padding: '4px 6px 6px 0', color: C.t3, fontWeight: 700 }}>操作</th>
              <th style={{ textAlign: 'left', padding: '4px 0 6px', color: C.t3, fontWeight: 700 }}>章</th>
            </tr>
          </thead>
          <tbody>
            {STEP7_OPERATIONS.map((op) => (
              <tr key={op.tag} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td style={{ padding: '5px 6px 5px 0', color: C.t1, whiteSpace: 'nowrap' }}>
                  {op.label}
                  <span style={{ color: C.t3, fontWeight: 400 }}>（{op.tag}）</span>
                </td>
                <td style={{ padding: '5px 0', color: C.t2 }}>第{op.chapter}章</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: C.t1, fontSize: 11 }}>{STEP7_THREADS.thread1.title}</p>
      <p style={{ margin: '0 0 10px' }}>{STEP7_THREADS.thread1.body}</p>
      <p style={{ margin: '0 0 6px', fontWeight: 700, color: C.t1, fontSize: 11 }}>{STEP7_THREADS.thread2.title}</p>
      <p style={{ margin: 0 }}>{STEP7_THREADS.thread2.body}</p>
    </div>
  );
}

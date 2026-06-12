import { useEffect, useState } from 'react';
import { STEPS } from '../constants/steps.js';
import { STEP_LEARN } from '../constants/stepLearn.js';
import { STEP7_OPERATIONS, STEP7_THREADS } from '../constants/step7.js';

const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D' };

function LearnBody({ step }) {
  const content = STEP_LEARN[step];
  if (!content) return null;

  if (content.operations) {
    return (
      <>
        <p style={{ margin: '0 0 10px', color: C.t1, fontWeight: 600 }}>{content.intro}</p>
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
      </>
    );
  }

  return (
    <>
      {content.intro && (
        <p style={{ margin: '0 0 10px', color: C.t1, fontWeight: 600 }}>{content.intro}</p>
      )}
      {content.bullets?.length > 0 && (
        <ul style={{ margin: '0 0 10px', paddingLeft: 18, lineHeight: 1.6 }}>
          {content.bullets.map((item) => (
            <li key={item.text} style={{ marginBottom: 4 }}>
              {item.text}
              {item.chapter != null && (
                <span style={{ color: C.t3, fontSize: 11 }}>（第{item.chapter}章）</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {content.sections?.map((section) => (
        <div key={section.title} style={{ marginBottom: 8 }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, color: C.t1, fontSize: 11 }}>{section.title}</p>
          <p style={{ margin: 0 }}>{section.body}</p>
        </div>
      ))}
    </>
  );
}

/**
 * Step description + "この Step で学ぶこと" in a single accordion (collapsed by default).
 */
export default function StepInfoAccordion({ step }) {
  const sd = STEPS[step];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [step]);

  if (!sd) return null;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.line}`,
      borderRadius: 10,
      marginBottom: 10,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '10px 12px',
          border: 'none',
          background: C.card,
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 12, color: C.t2, lineHeight: 1.45, flex: 1 }}>
          <span style={{ fontWeight: 700, color: C.t1 }}>{sd.sub}</span>
          ：{sd.desc}
        </span>
        <span
          aria-hidden="true"
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: C.t3,
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div style={{
          borderTop: `1px solid ${C.line}`,
          padding: '12px 14px',
          fontSize: 12,
          color: C.t2,
          lineHeight: 1.55,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.t3, margin: '0 0 8px', letterSpacing: '.04em' }}>
            この Step で学ぶこと
          </p>
          <LearnBody step={step} />
        </div>
      )}
    </div>
  );
}

import { STEPS } from '../constants/steps.js';
import { ROLES } from '../constants/roles.js';

const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', ink: '#1C1B19' };

const STEP_IDS = [3, 4, 5, 6];

export default function StepTabs({ currentStep, marks, onSwitch }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
      {STEP_IDS.map((id) => {
        const sd = STEPS[id];
        const active = currentStep === id;
        const gotCount = sd.exercises.filter((_, i) => marks[`${id}-${i}`] === 'got').length;
        const reviewCount = sd.exercises.filter((_, i) => marks[`${id}-${i}`] === 'review').length;

        return (
          <button
            key={id}
            onClick={() => onSwitch(id)}
            style={{
              padding: '10px 6px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              border: active ? `2px solid ${C.ink}` : `1px solid ${C.line}`,
              background: active ? C.card : '#F5F4F0',
              color: C.t1, textAlign: 'center',
            }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>Step {id}</div>
            <div style={{ fontSize: 10, color: C.t2, lineHeight: 1.3 }}>{sd.sub}</div>
            {(gotCount + reviewCount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 5 }}>
                {gotCount > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: ROLES.V.text }}>✓{gotCount}</span>
                )}
                {reviewCount > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: ROLES.Y.text }}>↻{reviewCount}</span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

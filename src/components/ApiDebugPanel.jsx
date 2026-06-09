import { useEffect, useState } from 'react';
import { clearApiDebugLog, subscribeApiDebugLog } from '../api/debugLog.js';
import { API_MAX_TOKENS_CHECK, API_MAX_TOKENS_GENERATE } from '../api/claude.js';

const C = { card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D' };

const STOP_REASON_LABELS = {
  end_turn: '正常終了',
  max_tokens: '上限到達（打ち切り）',
  stop_sequence: '停止シーケンス',
};

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function operationLabel(op) {
  return op === 'generate' ? '問題生成' : '採点';
}

function summarizeGenerate(logs) {
  const generateLogs = logs.filter((e) => e.operation === 'generate' && e.output_tokens != null);
  if (generateLogs.length === 0) return null;

  const byStep = {};
  for (const entry of generateLogs) {
    const key = entry.step ?? '?';
    if (!byStep[key]) byStep[key] = [];
    byStep[key].push(entry.output_tokens);
  }

  const stepStats = Object.entries(byStep).map(([step, tokens]) => ({
    step,
    max: Math.max(...tokens),
    count: tokens.length,
    truncated: generateLogs.some((e) => e.step === Number(step) && e.stop_reason === 'max_tokens'),
  }));

  const overallMax = Math.max(...generateLogs.map((e) => e.output_tokens));
  const suggested = Math.ceil(overallMax * 1.2 / 256) * 256;

  return { stepStats, overallMax, suggested };
}

export default function ApiDebugPanel({ open, onToggle }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => subscribeApiDebugLog(setLogs), []);

  const summary = summarizeGenerate(logs);

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: C.card, borderTop: `1px solid ${C.line}`,
      boxShadow: open ? '0 -4px 24px rgba(0,0,0,0.08)' : 'none',
      fontFamily: "'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',system-ui,sans-serif",
    }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%', padding: '8px 16px', border: 'none', background: '#F5F4F0',
          borderBottom: open ? `1px solid ${C.line}` : 'none',
          cursor: 'pointer', fontSize: 12, fontWeight: 600, color: C.t2,
          fontFamily: 'inherit', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <span>API デバッグ（output_tokens / stop_reason）</span>
        <span style={{ color: C.t3 }}>{open ? '▼ 閉じる' : '▲ 開く'}{logs.length > 0 ? ` · ${logs.length}件` : ''}</span>
      </button>

      {open && (
        <div style={{ maxHeight: '42vh', overflow: 'auto', padding: '12px 16px 16px' }}>
          <p style={{ fontSize: 11.5, color: C.t2, margin: '0 0 10px', lineHeight: 1.5 }}>
            「7問を生成」「答え合わせ」のたびに1行追加されます。
            <strong style={{ color: C.t1 }}> output_tokens</strong> が実際の出力量、
            <strong style={{ color: C.t1 }}> stop_reason</strong> が終了理由です。
            現在の上限は 問題生成 <strong>{API_MAX_TOKENS_GENERATE}</strong> / 採点 <strong>{API_MAX_TOKENS_CHECK}</strong> トークン。
            DevTools の Console にも <code style={{ fontSize: 11 }}>[API Debug]</code> で出力されます。
          </p>

          {summary && (
            <div style={{
              background: '#F8F7F4', border: `1px solid ${C.line}`, borderRadius: 8,
              padding: '10px 12px', marginBottom: 12, fontSize: 12, color: C.t2, lineHeight: 1.6,
            }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: C.t1 }}>問題生成の集計（記録済み分）</p>
              <p style={{ margin: 0 }}>
                全体の最大 output_tokens: <strong style={{ color: C.t1 }}>{summary.overallMax}</strong>
                {' · '}推奨 max_tokens（+20%・256刻み）: <strong style={{ color: C.t1 }}>{summary.suggested}</strong>
              </p>
              <p style={{ margin: '6px 0 0' }}>
                {summary.stepStats.map((s) => (
                  <span key={s.step} style={{ marginRight: 12 }}>
                    Step {s.step}: 最大 {s.max}（{s.count}回）
                    {s.truncated && <span style={{ color: '#C0392B', fontWeight: 700 }}> ※打ち切りあり</span>}
                  </span>
                ))}
              </p>
            </div>
          )}

          {logs.length === 0 ? (
            <p style={{ fontSize: 12, color: C.t3, margin: 0 }}>まだ記録がありません。問題を生成するか答え合わせを実行してください。</p>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: C.t3, borderBottom: `1px solid ${C.line}` }}>
                      <th style={{ padding: '6px 8px 6px 0', fontWeight: 600 }}>時刻</th>
                      <th style={{ padding: '6px 8px', fontWeight: 600 }}>操作</th>
                      <th style={{ padding: '6px 8px', fontWeight: 600 }}>Step</th>
                      <th style={{ padding: '6px 8px', fontWeight: 600 }}>input</th>
                      <th style={{ padding: '6px 8px', fontWeight: 600 }}>output</th>
                      <th style={{ padding: '6px 8px', fontWeight: 600 }}>上限</th>
                      <th style={{ padding: '6px 8px', fontWeight: 600 }}>使用率</th>
                      <th style={{ padding: '6px 8px', fontWeight: 600 }}>stop_reason</th>
                      <th style={{ padding: '6px 8px', fontWeight: 600 }}>文字数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((entry) => {
                      const truncated = entry.stop_reason === 'max_tokens';
                      const usagePct = entry.output_tokens != null
                        ? Math.round((entry.output_tokens / entry.max_tokens) * 100)
                        : null;
                      const highUsage = usagePct != null && usagePct >= 90;
                      return (
                        <tr key={entry.id} style={{ borderBottom: `1px solid ${C.line}`, color: C.t1 }}>
                          <td style={{ padding: '8px 8px 8px 0', whiteSpace: 'nowrap', color: C.t2 }}>{formatTime(entry.at)}</td>
                          <td style={{ padding: '8px' }}>{operationLabel(entry.operation)}</td>
                          <td style={{ padding: '8px' }}>{entry.step ?? '—'}</td>
                          <td style={{ padding: '8px' }}>{entry.input_tokens ?? '—'}</td>
                          <td style={{ padding: '8px', fontWeight: 700, color: truncated || highUsage ? '#C0392B' : C.t1 }}>
                            {entry.output_tokens ?? '—'}
                          </td>
                          <td style={{ padding: '8px', color: C.t2 }}>{entry.max_tokens}</td>
                          <td style={{ padding: '8px', color: highUsage ? '#C0392B' : C.t2 }}>
                            {usagePct != null ? `${usagePct}%` : '—'}
                          </td>
                          <td style={{ padding: '8px', color: truncated ? '#C0392B' : C.t2, fontWeight: truncated ? 700 : 400 }}>
                            {STOP_REASON_LABELS[entry.stop_reason] ?? entry.stop_reason ?? '—'}
                          </td>
                          <td style={{ padding: '8px', color: C.t2 }}>{entry.response_chars}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={clearApiDebugLog}
                style={{
                  marginTop: 10, padding: '6px 12px', borderRadius: 8,
                  border: `1px solid ${C.line}`, background: C.card, color: C.t2,
                  fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                記録をクリア
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

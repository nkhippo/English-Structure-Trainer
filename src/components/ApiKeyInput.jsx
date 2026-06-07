import { useState } from 'react';
import { saveApiKey } from '../api/claude.js';

const C = { page: '#FAF9F6', card: '#FFFFFF', line: '#EAE8E1', t1: '#1C1B19', t2: '#6B6862', t3: '#9A968D', ink: '#1C1B19' };

export default function ApiKeyInput({ onSaved }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      setError('sk-ant- で始まる Anthropic APIキーを入力してください。');
      return;
    }
    saveApiKey(trimmed);
    onSaved(trimmed);
  };

  return (
    <div style={{
      background: C.page, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',system-ui,sans-serif",
    }}>
      <div style={{ maxWidth: 420, width: '100%', background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px', color: C.t1 }}>英文構造トレーナー</h1>
        <p style={{ fontSize: 13, color: C.t2, margin: '0 0 20px', lineHeight: 1.6 }}>
          Anthropic APIキーを入力してください。キーはこのブラウザの localStorage にのみ保存され、サーバーには送信されません。
        </p>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.t3, marginBottom: 6 }}>APIキー</label>
        <input
          type="password"
          value={key}
          onChange={(e) => { setKey(e.target.value); setError(''); }}
          placeholder="sk-ant-..."
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
            border: `1px solid ${error ? '#FACACB' : C.line}`, fontSize: 14, marginBottom: error ? 8 : 16,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        {error && (
          <p style={{ fontSize: 12, color: '#C0392B', margin: '0 0 12px' }}>{error}</p>
        )}
        <button onClick={handleSave} style={{
          width: '100%', padding: 13, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: C.ink, color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
        }}>
          保存して始める
        </button>
      </div>
    </div>
  );
}

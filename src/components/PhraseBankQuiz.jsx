import { useState } from 'react';

const QUESTIONS = [
  // ── 複合前置詞 A2 ──
  { expr: 'according to',   jp: '天気予報によると、明日は雨が降るだろう。',             en: '___ the weather forecast, it will rain tomorrow.',                      note: '複合前置詞(A2) → Z（前置詞句）。後ろに名詞を取る。because + S+V とは構造が異なる。' },
  { expr: 'because of',     jp: '嵐のせいでイベントがキャンセルされた。',               en: 'The event was canceled ___ the storm.',                                  note: '複合前置詞(A2) → Z（前置詞句）。due to より口語的。' },
  { expr: 'instead of',     jp: 'コーヒーの代わりにお茶を頼んだ。',                   en: 'She ordered tea ___ coffee.',                                           note: '複合前置詞(A2) → Z（前置詞句）。後ろに名詞・動名詞が来る。' },
  { expr: 'due to',         jp: '渋滞のせいで電車が遅延した。',                       en: 'The train was delayed ___ heavy traffic.',                               note: '複合前置詞(A2) → Z（前置詞句）。because of よりフォーマル。' },
  { expr: 'in front of',    jp: '彼は大勢の観客の前に立った。',                       en: 'He stood ___ a large audience.',                                        note: '複合前置詞(A2) → Z（前置詞句）。3語で1つの前置詞として機能する。' },
  { expr: 'as for',         jp: '価格については、後で確認する。',                     en: '___ the price, I will check later.',                                    note: '複合前置詞(A2) → Z（前置詞句）。話題を切り出すときに文頭で使う。' },
  // ── 複合前置詞 B1 ──
  { expr: 'in spite of',    jp: '雨にもかかわらず、彼らは外出した。',                 en: '___ the rain, they went out.',                                          note: '複合前置詞(B1) → Z（前置詞句）。譲歩を示す。despite と同義。' },
  { expr: 'thanks to',      jp: 'あなたのおかげで、時間通りに終わった。',             en: '___ your help, we finished on time.',                                   note: '複合前置詞(B1) → Z（前置詞句）。肯定的な原因・理由。because of と違いポジティブな文脈。' },
  { expr: 'in addition to', jp: '英語に加えて、フランス語も話せる。',                 en: '___ English, she speaks French.',                                       note: '複合前置詞(B1) → Z（前置詞句）。追加情報を導く。後ろに名詞・動名詞。' },
  { expr: 'regardless of',  jp: 'コストに関わらず、修理が必要だ。',                   en: '___ the cost, the machine must be repaired.',                           note: '複合前置詞(B1) → Z（前置詞句）。条件を問わないことを示す。' },
  { expr: 'in terms of',    jp: '品質の観点から見ると、この製品は優秀だ。',           en: '___ quality, this product is excellent.',                               note: '複合前置詞(B1) → Z（前置詞句）。評価・比較の軸を示す。' },
  { expr: 'apart from',     jp: 'この問題を除けば、計画は順調だ。',                   en: '___ this issue, the plan is going well.',                               note: '複合前置詞(B1) → Z（前置詞句）。例外・除外を示す。' },
  // ── 複合前置詞 B2 ──
  { expr: 'with regard to', jp: 'お問い合わせについて、明日お返事します。',           en: '___ your inquiry, I will respond tomorrow.',                            note: '複合前置詞(B2) → Z（前置詞句）。フォーマルなビジネス文書で頻出。' },
  { expr: 'as a result of', jp: '長年の研究の結果として、治療法が発見された。',       en: '___ years of research, a cure was discovered.',                         note: '複合前置詞(B2) → Z（前置詞句）。as a result（接続副詞）とは別物。後ろに名詞が来る。' },
  { expr: 'in light of',    jp: '新しい証拠を踏まえて、計画を見直した。',             en: '___ the new evidence, the plan was revised.',                           note: '複合前置詞(B2) → Z（前置詞句）。根拠・状況を踏まえた判断に使う。' },
  { expr: 'on behalf of',   jp: 'チーム全体を代表して、感謝申し上げます。',           en: '___ the entire team, I would like to express our gratitude.',           note: '複合前置詞(B2) → Z（前置詞句）。代表・代理を示す。フォーマルなスピーチで頻出。' },
  // ── 接続副詞 B1 ──
  { expr: 'however',           jp: '一生懸命勉強した。しかし、試験に落ちた。',           en: 'She studied hard. ___, she failed the exam.',                           note: '接続副詞(B1)：逆接。but と違い節をつながない。直前は必ずピリオド。' },
  { expr: 'therefore',         jp: '雨が降っていた。したがって、家にいた。',             en: 'It was raining. ___, we stayed home.',                                  note: '接続副詞(B1)：論理的帰結。前の文の内容から結論を導く。' },
  { expr: 'moreover',          jp: '価格が安い。さらに、品質も高い。',                   en: 'The price is low. ___, the quality is high.',                           note: '接続副詞(B1)：追加（さらに良い情報を加える）。' },
  { expr: 'nevertheless',      jp: '非常に難しかった。それにもかかわらず、彼女は続けた。', en: 'It was very difficult. ___, she kept trying.',                          note: '接続副詞(B1)：譲歩の逆接。however より強い意志・決意のニュアンス。' },
  { expr: 'as a result',       jp: '毎日練習した。その結果、すぐに上達した。',           en: 'He practiced every day. ___, he improved quickly.',                     note: '接続副詞(B1)：結果。as a result of（複合前置詞）とは別物。後ろに名詞を取らない。' },
  { expr: 'on the other hand', jp: '猫は独立している。一方、犬は手がかかる。',           en: 'Cats are independent. ___, dogs need more attention.',                  note: '接続副詞(B1)：対比。2つの側面を並べるときに使う。' },
  { expr: 'in conclusion',     jp: '以上をまとめると、新しいアプローチが必要だ。',       en: '___, a new approach is needed.',                                        note: '接続副詞(B1)：結論の導入。論文・スピーチの締めに使う。' },
  // ── 接続副詞 B2 ──
  { expr: 'consequently',   jp: 'プロジェクトが失敗した。その結果、チームが解散された。', en: 'The project failed. ___, the team was dismissed.',                      note: '接続副詞(B2)：結果。as a result よりフォーマルで因果関係が明確なときに使う。' },
  { expr: 'in other words', jp: '彼女は疲弊していた。言い換えれば、もう続けられなかった。', en: 'She was exhausted. ___, she could not continue.',                     note: '接続副詞(B2)：言い換え・補足説明。前の内容を別の角度から説明する。' },
  { expr: 'thus',           jp: 'データは仮説を支持している。したがって、先に進める。',   en: 'The data supports our hypothesis. ___, we can proceed.',                note: '接続副詞(B2)：論理的帰結。therefore より academic なトーン。論文で頻出。' },
  { expr: 'similarly',      jp: '彼は全力で努力した。同様に、彼女も全力を尽くした。',   en: 'He worked hard. ___, she gave her best effort.',                        note: '接続副詞(B2)：類似・比較。likewise と同義。' },
  // ── 否定副詞句 A2 ──
  { expr: 'no longer',   jp: '彼はもはやここで働いていない。',               en: 'He ___ works here.',                          note: '否定副詞句(A2)：「もはや〜ない」。動詞の直前に置く。' },
  { expr: 'not yet',     jp: '報告書はまだ準備できていない。',               en: 'The report is ___ ready.',                    note: '否定副詞句(A2)：「まだ〜ない」。be動詞・助動詞の後ろに置く。' },
  { expr: 'not at all',  jp: 'それは私が期待していたものとは全く違った。',   en: 'It was ___ what I expected.',                 note: '否定副詞句(A2)：強調否定。「全く〜ない」。be動詞の後ろに置く。' },
  // ── 否定副詞句 B1 ──
  { expr: 'not necessarily', jp: 'お金持ちが必ずしも幸せとは限らない。',   en: 'Being wealthy does ___ mean being happy.',    note: '否定副詞句(B1)：部分否定。「必ずしも〜ではない」。' },
  { expr: 'hardly ever',     jp: '彼はめったに遅刻しない。',               en: 'He ___ arrives late.',                        note: '否定副詞句(B1)：「めったに〜ない」。seldom と同義。動詞の直前に置く。' },
  // ── 否定副詞句 B2 ──
  { expr: 'by no means',      jp: 'これは決して簡単な問題ではない。', en: 'This is ___ a simple problem.',   note: '否定副詞句(B2)：強調否定（フォーマル）。not at all の書き言葉版。' },
  { expr: 'not in the least', jp: '彼女は少しも驚かなかった。',       en: 'She was ___ surprised.',          note: '否定副詞句(B2)：「少しも〜ない」の強調。' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PhraseBankQuiz() {
  const [pool, setPool]       = useState(() => shuffle(QUESTIONS));
  const [idx, setIdx]         = useState(0);
  const [input, setInput]     = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore]     = useState(0);
  const [finished, setFinished] = useState(false);

  const q         = pool[idx];
  const isCorrect = checked && input.trim().toLowerCase() === q.expr.toLowerCase();
  const parts     = q.en.split('___');
  const progress  = Math.round((idx + (checked ? 1 : 0)) / pool.length * 100);

  function handleCheck() {
    if (checked) return;
    setChecked(true);
    if (input.trim().toLowerCase() === q.expr.toLowerCase()) {
      setScore(s => s + 1);
    }
  }

  function handleNext() {
    if (idx + 1 >= pool.length) {
      setFinished(true);
    } else {
      setIdx(i => i + 1);
      setInput('');
      setChecked(false);
    }
  }

  function handleRestart() {
    setPool(shuffle(QUESTIONS));
    setIdx(0);
    setInput('');
    setChecked(false);
    setScore(0);
    setFinished(false);
  }

  // ── 終了画面 ──────────────────────────────
  if (finished) {
    const pct = Math.round(score / pool.length * 100);
    return (
      <div style={{ textAlign: 'center', padding: '48px 16px' }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
          {score}
          <span style={{ fontSize: 24, fontWeight: 400, color: '#9ca3af' }}> / {pool.length}</span>
        </div>
        <div style={{ color: '#6b7280', marginTop: 6, marginBottom: 24, fontSize: 14 }}>
          正答率 {pct}%
        </div>
        <button onClick={handleRestart} style={styles.btnPrimary}>
          もう一度（シャッフル）
        </button>
      </div>
    );
  }

  const inputWidth = Math.min(250, Math.max(100, q.expr.length * 11 + 24));

  // ── 問題画面 ──────────────────────────────
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* プログレスバー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: '#6b7280', minWidth: 52 }}>
          {idx + 1} / {pool.length}
        </span>
        <div style={{ flex: 1, height: 3, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#111', borderRadius: 2, width: `${progress}%`, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 12, color: '#6b7280', minWidth: 32, textAlign: 'right' }}>
          {score}点
        </span>
      </div>

      {/* 問題カード */}
      <div style={styles.card}>

        {/* 日本語 */}
        <div style={styles.jpBox}>
          「{q.jp}」
        </div>

        {/* 英語＋入力欄 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, fontSize: 14, lineHeight: '2.4', marginBottom: 14 }}>
          {parts[0] && <span>{parts[0]}</span>}
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !checked && handleCheck()}
            disabled={checked}
            autoFocus
            style={{
              ...styles.blankInput,
              width: inputWidth,
              borderBottomColor: checked
                ? (isCorrect ? '#22c55e' : '#ef4444')
                : '#9ca3af',
              color: checked
                ? (isCorrect ? '#15803d' : '#b91c1c')
                : 'inherit',
              background: checked && isCorrect ? '#f0fdf4' : 'transparent',
            }}
          />
          {parts[1] && <span>{parts[1]}</span>}
        </div>

        {/* 答え合わせボタン */}
        {!checked && (
          <button onClick={handleCheck} style={styles.btnPrimary}>
            答え合わせ
          </button>
        )}

        {/* フィードバック */}
        {checked && (
          <>
            <div style={{
              ...styles.feedback,
              background: isCorrect ? '#f0fdf4' : '#fff1f2',
              borderColor: isCorrect ? '#bbf7d0' : '#fecdd3',
            }}>
              <div style={{ fontWeight: 600, marginBottom: 5 }}>
                {isCorrect
                  ? '✓ 正解！'
                  : <>✗ 不正解 — 正解：<strong style={{ background: '#f3f4f6', padding: '1px 8px', borderRadius: 4 }}>{q.expr}</strong></>
                }
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{q.note}</div>
            </div>
            <button onClick={handleNext} style={styles.btnSecondary}>
              {idx + 1 < pool.length ? '次の問題 →' : '結果を見る →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    padding: '20px 24px',
  },
  jpBox: {
    background: '#f9fafb',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 15,
    lineHeight: 1.7,
    marginBottom: 18,
  },
  blankInput: {
    border: 'none',
    borderBottom: '2px solid',
    outline: 'none',
    fontSize: 14,
    fontFamily: 'inherit',
    textAlign: 'center',
    padding: '0 6px 2px',
    cursor: 'text',
  },
  feedback: {
    border: '1px solid',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 13,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  btnPrimary: {
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnSecondary: {
    background: 'transparent',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: 10,
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

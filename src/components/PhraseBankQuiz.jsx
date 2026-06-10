import { useState } from 'react';

const QUESTIONS = [
  // ── 複合前置詞 A2 ──
  {
    expr: 'according to',
    jp: '天気予報によると、明日は雨が降るだろう。',
    en: '___ the weather forecast, it will rain tomorrow.',
    meaning: '「〜によると」という意味です。天気予報や調査結果など、情報の出どころを示すときに使います。後ろには名詞（the weather forecast など）が続きます。',
    confusables: [
      { phrase: 'because of', why: '「〜のせいで・〜が原因で」という意味。情報の出どころではなく、原因を表すのでここでは合いません。' },
      { phrase: 'due to', why: '「〜のために」という原因の表現。予報が「情報源」であるこの文では使えません。' },
    ],
  },
  {
    expr: 'because of',
    jp: '嵐のせいでイベントがキャンセルされた。',
    en: 'The event was canceled ___ the storm.',
    meaning: '「〜のせいで・〜が原因で」という意味です。後ろに名詞（the storm など）が続きます。日常会話でよく使われます。',
    confusables: [
      { phrase: 'because', why: 'because のあとには文（主語＋動詞）が続きます。ここは the storm という名詞だけなので because of が必要です。' },
      { phrase: 'due to', why: '意味は近いですが、due to はややフォーマル。日常の「せいで」なら because of が自然です。' },
    ],
  },
  {
    expr: 'instead of',
    jp: 'コーヒーの代わりにお茶を頼んだ。',
    en: 'She ordered tea ___ coffee.',
    meaning: '「〜の代わりに」という意味です。A の代わりに B を選んだ、という入れ替えを表します。後ろに名詞や動名詞が続きます。',
    confusables: [
      { phrase: 'in addition to', why: '「〜に加えて」という意味。代わりではなく、両方あることを表すので意味が違います。' },
      { phrase: 'rather than', why: '「〜よりむしろ」という比較の表現。入れ替えのニュアンスは似ますが、ここでは instead of が定番です。' },
    ],
  },
  {
    expr: 'due to',
    jp: '渋滞のせいで電車が遅延した。',
    en: 'The train was delayed ___ heavy traffic.',
    meaning: '「〜が原因で・〜のために」という意味です。ニュースやお知らせなど、ややフォーマルな場面でよく使われます。後ろに名詞が続きます。',
    confusables: [
      { phrase: 'because of', why: '意味はほぼ同じですが、because of のほうが口語的。お知らせ文なら due to も自然です。' },
      { phrase: 'thanks to', why: '「〜のおかげで」というポジティブな原因の表現。渋滞は良いことではないので thanks to は合いません。' },
    ],
  },
  {
    expr: 'in front of',
    jp: '彼は大勢の観客の前に立った。',
    en: 'He stood ___ a large audience.',
    meaning: '「〜の前に（位置）」という意味です。人や物の目の前にいる場所を表します。3語セットで1つの前置詞のように使います。',
    confusables: [
      { phrase: 'before', why: 'before は時間の「前」にも使えます。ここは物理的な位置なので in front of が明確です。' },
      { phrase: 'ahead of', why: '「〜より先に・前に進んで」という意味。観客の前に立つ場所を表すには in front of が自然です。' },
    ],
  },
  {
    expr: 'as for',
    jp: '価格については、後で確認する。',
    en: '___ the price, I will check later.',
    meaning: '「〜については」という意味で、話題を切り替えるときに使います。文の最初に置いて「次は価格の話をします」という合図になります。',
    confusables: [
      { phrase: 'about', why: 'about だけでも「〜について」ですが、話題の切り替えをはっきり示すには as for が向いています。' },
      { phrase: 'in terms of', why: '「〜の点で・観点から」という評価の軸を示す表現。単に話題を出すだけなら as for で十分です。' },
    ],
  },
  // ── 複合前置詞 B1 ──
  {
    expr: 'in spite of',
    jp: '雨にもかかわらず、彼らは外出した。',
    en: '___ the rain, they went out.',
    meaning: '「〜にもかかわらず」という意味です。悪い条件があるのに、それでも行動したことを表します。後ろに名詞が続きます。',
    confusables: [
      { phrase: 'despite', why: 'despite も同じ意味ですが、despite the rain の形。in spite of とほぼ同義で、ここでは in spite of が定番です。' },
      { phrase: 'because of', why: '「〜のせいで」は原因を表します。雨があるのに外出した、という逆接には in spite of が必要です。' },
    ],
  },
  {
    expr: 'thanks to',
    jp: 'あなたのおかげで、時間通りに終わった。',
    en: '___ your help, we finished on time.',
    meaning: '「〜のおかげで」という意味です。良い結果の原因を、感謝しながら表します。ポジティブな文脈で使います。',
    confusables: [
      { phrase: 'because of', why: 'because of は良いこと・悪いことどちらにも使えます。おかげで感謝するニュアンスなら thanks to が自然です。' },
      { phrase: 'due to', why: '「〜が原因で」という中立的・フォーマルな表現。感謝の気持ちを込めるなら thanks to が合います。' },
    ],
  },
  {
    expr: 'in addition to',
    jp: '英語に加えて、フランス語も話せる。',
    en: '___ English, she speaks French.',
    meaning: '「〜に加えて」という意味です。すでにあるものに、さらに別のものを足すときに使います。',
    confusables: [
      { phrase: 'instead of', why: '「〜の代わりに」は入れ替えの表現。英語もフランス語も話せる、という追加なら in addition to です。' },
      { phrase: 'as well as', why: 'as well as も「〜もまた」という意味で近いですが、文頭で追加を示すなら in addition to がよく使われます。' },
    ],
  },
  {
    expr: 'regardless of',
    jp: 'コストに関わらず、修理が必要だ。',
    en: '___ the cost, the machine must be repaired.',
    meaning: '「〜に関係なく・〜を問わず」という意味です。条件がどうであれ、結果は変わらないことを表します。',
    confusables: [
      { phrase: 'in spite of', why: '「にもかかわらず」は障害があっても、という譲歩。コストを気にしない、という無関心には regardless of が合います。' },
      { phrase: 'because of', why: '「〜が原因で」は理由を表します。コストと関係なく、という意味には regardless of が必要です。' },
    ],
  },
  {
    expr: 'in terms of',
    jp: '品質の観点から見ると、この製品は優秀だ。',
    en: '___ quality, this product is excellent.',
    meaning: '「〜の点で・〜の観点から」という意味です。何を基準に評価するかを示すときに使います。',
    confusables: [
      { phrase: 'as for', why: 'as for は話題の切り替え。「品質という観点で見ると」という評価の軸を示すなら in terms of です。' },
      { phrase: 'according to', why: 'according to は情報の出どころ（予報・調査など）。評価の基準を示すには in terms of が合います。' },
    ],
  },
  {
    expr: 'apart from',
    jp: 'この問題を除けば、計画は順調だ。',
    en: '___ this issue, the plan is going well.',
    meaning: '「〜を除けば・〜以外は」という意味です。1つだけ例外があり、それ以外はうまくいっている、というときに使います。',
    confusables: [
      { phrase: 'except for', why: 'except for も「〜を除いて」で意味は近いです。apart from は「それ以外は全部」というニュアンスが強いです。' },
      { phrase: 'instead of', why: '「〜の代わりに」は入れ替えの表現。問題だけ除外する、という意味には apart from が合います。' },
    ],
  },
  // ── 複合前置詞 B2 ──
  {
    expr: 'with regard to',
    jp: 'お問い合わせについて、明日お返事します。',
    en: '___ your inquiry, I will respond tomorrow.',
    meaning: '「〜について」という意味の、ややフォーマルな表現です。ビジネスメールやお知らせで「その件について」と書くときに使います。',
    confusables: [
      { phrase: 'about', why: 'about でも「〜について」ですが、ビジネス文書では with regard to のほうが丁寧な印象になります。' },
      { phrase: 'as for', why: 'as for は話題の切り替え。お問い合わせへの返答を約束する文では with regard to が自然です。' },
    ],
  },
  {
    expr: 'as a result of',
    jp: '長年の研究の結果として、治療法が発見された。',
    en: '___ years of research, a cure was discovered.',
    meaning: '「〜の結果として」という意味です。何かが起きた原因（名詞）のあとに続きます。as a result（接続副詞）とは別物で、ここでは後ろに名詞が必要です。',
    confusables: [
      { phrase: 'as a result', why: 'as a result は文と文のあいだに置く接続副詞。後ろに名詞（years of research）が来るので as a result of が必要です。' },
      { phrase: 'because of', why: 'because of も原因を表せますが、「長年の研究という結果として」という成果のニュアンスには as a result of が合います。' },
    ],
  },
  {
    expr: 'in light of',
    jp: '新しい証拠を踏まえて、計画を見直した。',
    en: '___ the new evidence, the plan was revised.',
    meaning: '「〜を踏まえて・〜を考慮して」という意味です。新しい情報や状況を受けて、判断や行動を変えるときに使います。',
    confusables: [
      { phrase: 'according to', why: 'according to は情報の出どころを示す表現。証拠を受けて方針を変える、という意味には in light of が合います。' },
      { phrase: 'because of', why: 'because of は単なる原因。「踏まえて見直した」という考慮のニュアンスには in light of が自然です。' },
    ],
  },
  {
    expr: 'on behalf of',
    jp: 'チーム全体を代表して、感謝申し上げます。',
    en: '___ the entire team, I would like to express our gratitude.',
    meaning: '「〜を代表して」という意味です。自分以外の人やグループの代わりに話す・行動するときに使います。スピーチやメールでよく見かけます。',
    confusables: [
      { phrase: 'as a part of', why: '「〜の一部として」という意味。チームの一員として、ではなくチーム全体の代わりに、という代表の意味には on behalf of です。' },
      { phrase: 'on account of', why: '「〜が原因で」という理由の表現。代表して感謝する、という意味とは全く違います。' },
    ],
  },
  // ── 接続副詞 B1 ──
  {
    expr: 'however',
    jp: '一生懸命勉強した。しかし、試験に落ちた。',
    en: 'She studied hard. ___, she failed the exam.',
    meaning: '「しかし」という意味です。前の文と逆の結果・意外な展開を続けるときに使います。文と文のあいだに置き、直前はピリオドで区切ります。',
    confusables: [
      { phrase: 'but', why: 'but は同じ文の中でつなぐ言葉（She studied hard but failed）。文を分けたあとに置くなら however です。' },
      { phrase: 'therefore', why: 'therefore は「だから」という結果の言葉。勉強したのに落ちた、という逆接には however が合います。' },
    ],
  },
  {
    expr: 'therefore',
    jp: '雨が降っていた。したがって、家にいた。',
    en: 'It was raining. ___, we stayed home.',
    meaning: '「したがって・だから」という意味です。前の文から自然に導かれる結論を述べるときに使います。',
    confusables: [
      { phrase: 'however', why: 'however は「しかし」という逆接。雨が降っていたから家にいた、という因果関係には therefore です。' },
      { phrase: 'moreover', why: 'moreover は「さらに」という追加の言葉。前の文から結論を出すには therefore が合います。' },
    ],
  },
  {
    expr: 'moreover',
    jp: '価格が安い。さらに、品質も高い。',
    en: 'The price is low. ___, the quality is high.',
    meaning: '「さらに・そのうえ」という意味です。すでに良い点に、もう1つ良い点を足すときに使います。',
    confusables: [
      { phrase: 'however', why: 'however は逆接の「しかし」。安い上に品質も高い、という追加の良い情報には moreover です。' },
      { phrase: 'therefore', why: 'therefore は結論の「だから」。別の良い点を足すなら moreover が自然です。' },
    ],
  },
  {
    expr: 'nevertheless',
    jp: '非常に難しかった。それにもかかわらず、彼女は続けた。',
    en: 'It was very difficult. ___, she kept trying.',
    meaning: '「それにもかかわらず」という意味です。困難や不利があっても、それでも続けた、という強い意志を表します。however より決意が強い印象です。',
    confusables: [
      { phrase: 'however', why: 'however も逆接ですが、nevertheless のほうが「それでもやり抜いた」という意志が強いです。' },
      { phrase: 'therefore', why: 'therefore は結果の「だから」。困難があったのに続けた、という譲歩の逆接には nevertheless です。' },
    ],
  },
  {
    expr: 'as a result',
    jp: '毎日練習した。その結果、すぐに上達した。',
    en: 'He practiced every day. ___, he improved quickly.',
    meaning: '「その結果」という意味です。前の行動のあとに起きた結果を述べます。文と文のあいだに置き、後ろに名詞は続きません。',
    confusables: [
      { phrase: 'as a result of', why: 'as a result of は後ろに名詞が必要（as a result of practice）。文と文をつなぐだけなら as a result です。' },
      { phrase: 'therefore', why: 'therefore も「だから」で近いですが、as a result は「その結果として起きたこと」を具体的に述べるときに使います。' },
    ],
  },
  {
    expr: 'on the other hand',
    jp: '猫は独立している。一方、犬は手がかかる。',
    en: 'Cats are independent. ___, dogs need more attention.',
    meaning: '「一方で・反対に」という意味です。2つの物事を対比して、別の側面を示すときに使います。',
    confusables: [
      { phrase: 'however', why: 'however は意外な逆接。猫と犬の2つの特徴を並べて比べるなら on the other hand が自然です。' },
      { phrase: 'moreover', why: 'moreover は同じ方向への追加。対比して別の側面を示すには on the other hand です。' },
    ],
  },
  {
    expr: 'in conclusion',
    jp: '以上をまとめると、新しいアプローチが必要だ。',
    en: '___, a new approach is needed.',
    meaning: '「まとめると・結論として」という意味です。話や文章の最後に、全体の結論を述べるときに使います。',
    confusables: [
      { phrase: 'therefore', why: 'therefore は1つの理由から導く「だから」。全体をまとめて結論を出す場面では in conclusion が合います。' },
      { phrase: 'as a result', why: 'as a result は直前の行動の結果を述べる表現。全体のまとめには in conclusion が向いています。' },
    ],
  },
  // ── 接続副詞 B2 ──
  {
    expr: 'consequently',
    jp: 'プロジェクトが失敗した。その結果、チームが解散された。',
    en: 'The project failed. ___, the team was dismissed.',
    meaning: '「その結果として」という意味の、ややフォーマルな表現です。失敗や問題のあとに起きた深刻な結果を述べるときに使います。',
    confusables: [
      { phrase: 'as a result', why: 'as a result も「その結果」ですが、consequently はよりフォーマルで、因果がはっきりしている印象です。' },
      { phrase: 'therefore', why: 'therefore は論理的な結論。プロジェクト失敗という事象の直接的な結果には consequently が自然です。' },
    ],
  },
  {
    expr: 'in other words',
    jp: '彼女は疲弊していた。言い換えれば、もう続けられなかった。',
    en: 'She was exhausted. ___, she could not continue.',
    meaning: '「言い換えれば・つまり」という意味です。前の文を、もっとわかりやすい言い方で言い直すときに使います。',
    confusables: [
      { phrase: 'therefore', why: 'therefore は「だから」という結論。疲弊していた、という言い換えなら in other words です。' },
      { phrase: 'similarly', why: 'similarly は「同様に」という別の例の追加。同じ内容の言い換えには in other words が合います。' },
    ],
  },
  {
    expr: 'thus',
    jp: 'データは仮説を支持している。したがって、先に進める。',
    en: 'The data supports our hypothesis. ___, we can proceed.',
    meaning: '「したがって・このようにして」という意味の、ややフォーマルな表現です。論文や報告書で、根拠から結論を導くときに使います。',
    confusables: [
      { phrase: 'therefore', why: 'therefore も「したがって」ですが、thus はより学術的・書き言葉的な印象です。' },
      { phrase: 'as a result', why: 'as a result は行動の結果を述べる表現。データという根拠から判断するなら thus が合います。' },
    ],
  },
  {
    expr: 'similarly',
    jp: '彼は全力で努力した。同様に、彼女も全力を尽くした。',
    en: 'He worked hard. ___, she gave her best effort.',
    meaning: '「同様に・同じように」という意味です。前の例と似たことを、別の人や場面について述べるときに使います。',
    confusables: [
      { phrase: 'moreover', why: 'moreover は「さらに」という別の良い点の追加。同じような行動を別の人について述べるなら similarly です。' },
      { phrase: 'likewise', why: 'likewise も「同様に」で意味は近いです。文頭で例を並べるなら similarly がよく使われます。' },
    ],
  },
  // ── 否定副詞句 A2 ──
  {
    expr: 'no longer',
    jp: '彼はもはやここで働いていない。',
    en: 'He ___ works here.',
    meaning: '「もはや〜ない」という意味です。以前はそうだったが、今はそうではない、という変化を表します。動詞の直前に置きます。',
    confusables: [
      { phrase: 'not yet', why: 'not yet は「まだ〜ない」。もはや働いていない、という「以前はしていた」変化には no longer です。' },
      { phrase: 'never', why: 'never は「一度も〜ない」。以前は働いていたが今はしていない、というニュアンスには no longer が合います。' },
    ],
  },
  {
    expr: 'not yet',
    jp: '報告書はまだ準備できていない。',
    en: 'The report is ___ ready.',
    meaning: '「まだ〜ない」という意味です。いずれはそうなるが、今の時点ではまだ、という状態を表します。be動詞や助動詞の直後に置きます。',
    confusables: [
      { phrase: 'no longer', why: 'no longer は「もはや〜ない」。まだ準備できていない、という「これからできる」には not yet です。' },
      { phrase: 'not at all', why: 'not at all は「全く〜ない」という強調。まだ時間が足りない、というニュアンスには not yet が自然です。' },
    ],
  },
  {
    expr: 'not at all',
    jp: 'それは私が期待していたものとは全く違った。',
    en: 'It was ___ what I expected.',
    meaning: '「全く〜ない・まったく〜でない」という強い否定です。be動詞の直後に置き、期待とまったく違った、というときに使います。',
    confusables: [
      { phrase: 'not yet', why: 'not yet は「まだ〜ない」。全く期待と違った、という完全な不一致には not at all です。' },
      { phrase: 'by no means', why: 'by no means も強い否定ですが、not at all は日常会話でよく使われます。' },
    ],
  },
  // ── 否定副詞句 B1 ──
  {
    expr: 'not necessarily',
    jp: 'お金持ちが必ずしも幸せとは限らない。',
    en: 'Being wealthy does ___ mean being happy.',
    meaning: '「必ずしも〜とは限らない」という意味です。一般にそう思われがちだが、常に当てはまるわけではない、という部分否定を表します。',
    confusables: [
      { phrase: 'not at all', why: 'not at all は「全く〜ない」という完全否定。必ずしもそうとは限らない、という部分否定には not necessarily です。' },
      { phrase: 'never', why: 'never は「決して〜ない」。お金持ち＝幸せではない、という完全否定にはなりません。部分否定の not necessarily が合います。' },
    ],
  },
  {
    expr: 'hardly ever',
    jp: '彼はめったに遅刻しない。',
    en: 'He ___ arrives late.',
    meaning: '「めったに〜ない・ほとんど〜ない」という意味です。頻度が非常に低いことを表します。動詞の直前に置きます。',
    confusables: [
      { phrase: 'not yet', why: 'not yet は「まだ〜ない」。めったに遅刻しない、という頻度の低さには hardly ever です。' },
      { phrase: 'never', why: 'never は「一度も〜ない」。めったに、という「ごくたまにある」ニュアンスには hardly ever が自然です。' },
    ],
  },
  // ── 否定副詞句 B2 ──
  {
    expr: 'by no means',
    jp: 'これは決して簡単な問題ではない。',
    en: 'This is ___ a simple problem.',
    meaning: '「決して〜ではない・とんでもない」という強い否定です。書き言葉やフォーマルな場面で、「簡単などではない」と強調するときに使います。',
    confusables: [
      { phrase: 'not at all', why: 'not at all も「全く〜ない」ですが、by no means はよりフォーマルで強い印象です。' },
      { phrase: 'not necessarily', why: 'not necessarily は「必ずしも〜ではない」という部分否定。決して簡単ではない、という完全な否定には by no means です。' },
    ],
  },
  {
    expr: 'not in the least',
    jp: '彼女は少しも驚かなかった。',
    en: 'She was ___ surprised.',
    meaning: '「少しも〜ない・まったく〜ない」という強い否定です。be動詞の直後に置き、驚きがまったくなかった、というときに使います。',
    confusables: [
      { phrase: 'not at all', why: 'not at all も「全く〜ない」で近いですが、not in the least は「少しも」という強調がよりはっきりします。' },
      { phrase: 'hardly ever', why: 'hardly ever は頻度の「めったに〜ない」。驚きの程度を否定するには not in the least が合います。' },
    ],
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function FeedbackDetail({ question }) {
  return (
    <div style={{ fontSize: 12, lineHeight: 1.7 }}>
      <p style={{ margin: '0 0 8px' }}>{question.meaning}</p>
      {question.confusables?.length > 0 && (
        <div>
          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 11, color: '#6b7280' }}>
            間違えやすい表現
          </p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {question.confusables.map(({ phrase, why }) => (
              <li key={phrase} style={{ marginBottom: 4 }}>
                <strong>{phrase}</strong> — {why}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {isCorrect
                  ? '✓ 正解！'
                  : <>✗ 不正解 — 正解：<strong style={{ background: '#f3f4f6', padding: '1px 8px', borderRadius: 4 }}>{q.expr}</strong></>
                }
              </div>
              <FeedbackDetail question={q} />
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

// Step definitions and seed exercises.
// These serve as reference examples for the AI generation prompt.

/**
 * @typedef {Object} Exercise
 * @property {string} jp
 * @property {string} en
 * @property {{ t: string, r: 'X'|'V'|'Y'|'Z', n: string, inner?: { t: string, r: 'X'|'V'|'Y'|'Z', n: string, inner?: object[] }[] }[]} parts
 * @property {string} [nuance]  // 模範解答が100点となる理由（語順・表現の選択根拠）
 * @property {string} [enReply]  // 疑問文への模範回答（mood=interrogative のみ）
 * @property {string} [enNative]  // ネイティブらしい表現（採点対象外）
 * @property {string} [enNativeReply]  // 模範回答のネイティブらしい言い換え
 * @property {string} [nuanceNative]  // enNative が自然な理由
 * @property {{ jp: string, en: string }[]} [vocabHints]  // 単語ヒント（任意）
 */

export const STEPS = {
  3: {
    sub: '動詞の変化',
    desc: '時制・相・態・法 ＋ 疑問文・否定文の基本',
    focus: '動詞の活用（時制・相・態）と助動詞 ＋ Yes/No疑問・wh疑問・not・短縮形',
    exercises: [
      {
        jp: '彼女は今、本を読んでいます。',
        en: 'She is reading a book now.',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'is reading', r: 'V', n: '現在進行形' },
          { t: 'a book', r: 'X', n: '目的語' },
          { t: 'now', r: 'Z', n: '時の副詞' },
        ],
      },
      {
        jp: '彼は昨日、その問題を解決した。',
        en: 'He solved the problem yesterday.',
        parts: [
          { t: 'He', r: 'X', n: '主語' },
          { t: 'solved', r: 'V', n: '過去形' },
          { t: 'the problem', r: 'X', n: '目的語' },
          { t: 'yesterday', r: 'Z', n: '時の副詞（後置）' },
        ],
      },
      {
        jp: 'その報告書はすでに書かれている。',
        en: 'The report has already been written.',
        parts: [
          { t: 'The report', r: 'X', n: '主語' },
          { t: 'has already been written', r: 'V', n: '現在完了受動態（already は中置）' },
        ],
        vocabHints: [{ jp: '報告書', en: 'report' }],
      },
      {
        jp: '彼女は3か国語を話せる。',
        en: 'She can speak three languages.',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'can speak', r: 'V', n: '助動詞 + 動詞原形' },
          { t: 'three languages', r: 'X', n: '目的語' },
        ],
      },
      {
        jp: 'そのドアは毎朝9時に開けられる。',
        en: 'The door is opened at 9 every morning.',
        parts: [
          { t: 'The door', r: 'X', n: '主語' },
          { t: 'is opened', r: 'V', n: '現在形受動態' },
          { t: 'at 9', r: 'Z', n: '時の前置詞句' },
          { t: 'every morning', r: 'Z', n: '時の副詞句' },
        ],
      },
      {
        jp: 'あなたは昨日、その本を買いましたか。',
        en: 'Did you buy the book yesterday?',
        parts: [
          { t: 'Did', r: 'V', n: '助動詞 did を主語の前へ（Yes/No疑問）' },
          { t: 'you', r: 'X', n: '主語' },
          { t: 'buy', r: 'V', n: '動詞原形' },
          { t: 'the book', r: 'X', n: '目的語' },
          { t: 'yesterday', r: 'Z', n: '時の副詞' },
        ],
        nuance: '一般動詞の過去疑問は did を前に出し、動詞は原形に戻す。骨格 You buy the book は不変。',
      },
      {
        jp: '彼女はまだそのメールを読んでいません。',
        en: "She hasn't read the email yet.",
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: "hasn't read", r: 'V', n: '現在完了否定（has + not + 過去分詞）' },
          { t: 'the email', r: 'X', n: '目的語' },
          { t: 'yet', r: 'Z', n: '否定副詞句（文末）' },
        ],
        nuance: '否定は助動詞 has に not を付ける基本操作。yet は否定文で「まだ〜ない」の意味を補強する。',
      },
      {
        jp: '彼は何を買ったのですか。',
        en: 'What did he buy?',
        parts: [
          { t: 'What', r: 'X', n: '疑問詞（目的語の空所を文頭へ）' },
          { t: 'did', r: 'V', n: '助動詞を主語の前へ' },
          { t: 'he', r: 'X', n: '主語' },
          { t: 'buy', r: 'V', n: '動詞原形' },
        ],
        nuance: 'wh疑問は聞きたい位置を空所化し、疑問詞を文頭に出す。did は一般動詞の過去疑問で前に出す助動詞。',
      },
    ],
  },
  4: {
    sub: '準動詞・前置詞句',
    desc: '不定詞・動名詞・分詞・前置詞句が X / Y / Z の3役割に登場',
    focus: '不定詞（to do）・動名詞（-ing）・分詞（doing/done）・前置詞句の3役割（X/Y/Z）',
    exercises: [
      {
        jp: '英語を勉強することは楽しい。',
        en: 'Studying English is fun.',
        parts: [
          { t: 'Studying English', r: 'X', n: '動名詞句（主語）' },
          { t: 'is', r: 'V', n: '' },
          { t: 'fun', r: 'Y', n: '補語（形容詞）' },
        ],
      },
      {
        jp: '彼女はピアノを弾いている少女だ。',
        en: 'She is a girl playing the piano.',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'is', r: 'V', n: '' },
          { t: 'a girl', r: 'X', n: '補語（名詞）' },
          { t: 'playing the piano', r: 'Y', n: '分詞句（girl を後置修飾）' },
        ],
      },
      {
        jp: '私は彼に会うために図書館に行った。',
        en: 'I went to the library to meet him.',
        parts: [
          { t: 'I', r: 'X', n: '主語' },
          { t: 'went', r: 'V', n: '過去形' },
          { t: 'to the library', r: 'Z', n: '場所の前置詞句' },
          { t: 'to meet him', r: 'Z', n: '不定詞句（目的・副詞役）' },
        ],
      },
      {
        jp: '机の上の本は面白い。',
        en: 'The book on the desk is interesting.',
        parts: [
          { t: 'The book', r: 'X', n: '主語（名詞）' },
          { t: 'on the desk', r: 'Y', n: '前置詞句（book を後置修飾）' },
          { t: 'is', r: 'V', n: '' },
          { t: 'interesting', r: 'Y', n: '補語（形容詞）' },
        ],
      },
      {
        jp: '彼女にはまだ読んでいない本がたくさんある。',
        en: 'She has many books to read.',
        nuance: 'to read は「これから読む予定・積読」の意。義務ではなく量の話。不定詞を名詞の後ろに置くことで「読むべき本」という後置修飾の英語語順を体現する。',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'has', r: 'V', n: '' },
          { t: 'many books', r: 'X', n: '目的語' },
          { t: 'to read', r: 'Y', n: '不定詞句（books を後置修飾）' },
        ],
      },
      {
        jp: '家に帰りながら、彼は音楽を聴いた。',
        en: 'Walking home, he listened to music.',
        parts: [
          { t: 'Walking home', r: 'Z', n: '分詞構文（副詞役・前置） · 同時の状況を文頭で示し、主節の行動と自然につなげる' },
          { t: 'he', r: 'X', n: '主語' },
          { t: 'listened to', r: 'V', n: '過去形' },
          { t: 'music', r: 'X', n: '目的語' },
        ],
        nuance: '「〜ながら」の同時性は分詞構文を文頭に置くのが自然。主語 he を分詞構文の暗黙の主語と一致させる。',
      },
      {
        jp: '彼女は疲れているように見えた。',
        en: 'She looked tired.',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'looked', r: 'V', n: '知覚動詞（過去形）' },
          { t: 'tired', r: 'Y', n: '補語（過去分詞の形容詞用法・Y/Word）' },
        ],
      },
      {
        jp: 'その問題はとても難しい。',
        en: 'The problem is very difficult.',
        parts: [
          { t: 'The problem', r: 'X', n: '主語' },
          { t: 'is', r: 'V', n: '' },
          { t: 'very difficult', r: 'Y', n: '補語（形容詞句：副詞+形容詞）' },
        ],
      },
      {
        jp: '首都の東京は大きな都市だ。',
        en: 'Tokyo, the capital, is a large city.',
        parts: [
          { t: 'Tokyo,', r: 'X', n: '主語' },
          { t: 'the capital,', r: 'Y', n: '同格（Tokyo の内容を特定）' },
          { t: 'is', r: 'V', n: '' },
          { t: 'a large city', r: 'X', n: '補語' },
        ],
        vocabHints: [{ jp: '首都', en: 'capital' }],
      },
      {
        jp: '彼女はとてもゆっくりと歩いた。',
        en: 'She walked very slowly.',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'walked', r: 'V', n: '過去形' },
          { t: 'very slowly', r: 'Z', n: '副詞句（副詞+副詞：様態）' },
        ],
      },
      {
        jp: '彼は毎朝6時に起きる。',
        en: 'He gets up at 6 every morning.',
        parts: [
          { t: 'He', r: 'X', n: '主語' },
          { t: 'gets up', r: 'V', n: '現在形（句動詞）' },
          { t: 'at 6', r: 'Z', n: '時の前置詞句' },
          { t: 'every morning', r: 'Z', n: '時の副詞（名詞句の副詞用法）' },
        ],
      },
    ],
  },
  5: {
    sub: '関係詞',
    desc: '関係代名詞（who/which/that）・関係副詞（where）・what節：Y または X',
    focus: '関係代名詞（who/which/that）・関係副詞（where/when）・whatの名詞節',
    exercises: [
      {
        jp: '私が昨日買った本は面白い。',
        en: 'The book that I bought yesterday is interesting.',
        parts: [
          { t: 'The book', r: 'X', n: '主語（名詞）' },
          {
            t: 'that I bought yesterday',
            r: 'Y',
            n: '関係詞節（book を後置修飾）',
            inner: [
              { t: 'that', r: 'X', n: '関係代名詞（目的語）' },
              { t: 'I', r: 'X', n: '主語' },
              { t: 'bought', r: 'V', n: '過去形' },
              { t: 'yesterday', r: 'Z', n: '時の副詞' },
            ],
          },
          { t: 'is', r: 'V', n: '' },
          { t: 'interesting', r: 'Y', n: '補語' },
        ],
      },
      {
        jp: '彼は英語を流暢に話す男性だ。',
        en: 'He is a man who speaks English fluently.',
        parts: [
          { t: 'He', r: 'X', n: '主語' },
          { t: 'is', r: 'V', n: '' },
          { t: 'a man', r: 'X', n: '補語' },
          {
            t: 'who speaks English fluently',
            r: 'Y',
            n: '関係詞節（man を後置修飾）',
            inner: [
              { t: 'who', r: 'X', n: '関係代名詞（主語）' },
              { t: 'speaks', r: 'V', n: '現在形（三単現）' },
              { t: 'English', r: 'X', n: '目的語' },
              { t: 'fluently', r: 'Z', n: '様態の副詞' },
            ],
          },
        ],
        vocabHints: [{ jp: '流暢に', en: 'fluent' }],
      },
      {
        jp: 'これが私が住んでいる街だ。',
        en: 'This is the city where I live.',
        parts: [
          { t: 'This', r: 'X', n: '主語' },
          { t: 'is', r: 'V', n: '' },
          { t: 'the city', r: 'X', n: '補語' },
          { t: 'where I live', r: 'Y', n: '関係詞節（city を後置修飾）' },
        ],
      },
      {
        jp: '彼が言ったことを、私は理解できなかった。',
        en: 'I could not understand what he said.',
        parts: [
          { t: 'I', r: 'X', n: '主語' },
          { t: 'could not understand', r: 'V', n: '助動詞 + 否定' },
          { t: 'what he said', r: 'X', n: '名詞節（目的語）' },
        ],
      },
      {
        jp: '昨日あなたに紹介した女性は、私の上司です。',
        en: 'The woman I introduced to you yesterday is my boss.',
        parts: [
          { t: 'The woman', r: 'X', n: '主語' },
          { t: 'I introduced to you yesterday', r: 'Y', n: '関係詞節（who 省略・woman を後置修飾）' },
          { t: 'is', r: 'V', n: '' },
          { t: 'my boss', r: 'X', n: '補語' },
        ],
        vocabHints: [
          { jp: '紹介する', en: 'introduce' },
          { jp: '上司', en: 'boss' },
        ],
      },
      {
        jp: '彼女には読むべき（仕事上推奨される）本がたくさんある。',
        en: 'She has many books she should read.',
        nuance: 'should read は外部起点の義務・推奨。that 節（Y）が books を後置修飾。',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'has', r: 'V', n: '' },
          { t: 'many books', r: 'X', n: '目的語' },
          { t: 'she should read', r: 'Y', n: '関係詞節（that 省略・books を後置修飾）' },
        ],
      },
      {
        jp: '公園を散歩するのが好きな高齢者たちは、毎朝集まる。',
        en: 'The elderly people who like taking walks in the park gather every morning.',
        parts: [
          { t: 'The elderly people', r: 'X', n: '主語' },
          {
            t: 'who like taking walks in the park',
            r: 'Y',
            n: '関係詞節（主語を後置修飾）',
            inner: [
              { t: 'who', r: 'X', n: '関係代名詞（主語）' },
              { t: 'like', r: 'V', n: '動詞（現在形）' },
              {
                t: 'taking walks in the park',
                r: 'X',
                n: '目的語（動名詞句）',
                inner: [
                  { t: 'taking walks', r: 'X', n: '動名詞句' },
                  { t: 'in the park', r: 'Z', n: '場所の前置詞句' },
                ],
              },
            ],
          },
          { t: 'gather', r: 'V', n: '動詞（現在形）' },
          { t: 'every morning', r: 'Z', n: '時の副詞句' },
        ],
      },
      {
        jp: '彼が嘘をついたという事実は変えられない。',
        en: 'The fact that he lied cannot be changed.',
        parts: [
          { t: 'The fact', r: 'X', n: '主語（名詞）' },
          {
            t: 'that he lied',
            r: 'Y',
            n: '同格節（fact の内容を説明・Y/Clause）',
            inner: [
              { t: 'that', r: 'X', n: '接続詞（同格）' },
              { t: 'he', r: 'X', n: '主語' },
              { t: 'lied', r: 'V', n: '過去形' },
            ],
          },
          { t: 'cannot be changed', r: 'V', n: '助動詞+受動態' },
        ],
        vocabHints: [
          { jp: '事実', en: 'fact' },
          { jp: '嘘をつく', en: 'lie' },
        ],
      },
      {
        jp: '私は次に何をすべきかわからない。',
        en: "I don't know what to do next.",
        parts: [
          { t: 'I', r: 'X', n: '主語' },
          { t: "don't know", r: 'V', n: '否定形' },
          { t: 'what to do next', r: 'X', n: '名詞句（疑問詞+不定詞・目的語）' },
        ],
      },
    ],
  },
  6: {
    sub: '節と接続・ネスト',
    desc: '副詞節（Z）・名詞節（X）・等位接続・Y + Z のネスト',
    focus: '副詞節（when/because/if/although）・that名詞節・等位接続・関係詞と副詞節のネスト',
    exercises: [
      {
        jp: '彼女が疲れているとき、彼女は早く帰る。',
        en: 'When she is tired, she goes home early.',
        parts: [
          { t: 'When she is tired', r: 'Z', n: '副詞節（前置）' },
          { t: 'she', r: 'X', n: '主語' },
          { t: 'goes', r: 'V', n: '現在形（三単現）' },
          { t: 'home', r: 'Z', n: '副詞として機能（前置詞不要）' },
          { t: 'early', r: 'Z', n: '様態の副詞' },
        ],
      },
      {
        jp: '彼は試験に合格したいので、一生懸命勉強する。',
        en: 'He studies hard because he wants to pass the exam.',
        parts: [
          { t: 'He', r: 'X', n: '主語' },
          { t: 'studies', r: 'V', n: '現在形' },
          { t: 'hard', r: 'Z', n: '様態の副詞' },
          { t: 'because he wants to pass the exam', r: 'Z', n: '副詞節（理由）' },
        ],
      },
      {
        jp: '私は彼が正直だと知っている。',
        en: 'I know that he is honest.',
        parts: [
          { t: 'I', r: 'X', n: '主語' },
          { t: 'know', r: 'V', n: '' },
          { t: 'that he is honest', r: 'X', n: '名詞節（目的語）' },
        ],
        vocabHints: [{ jp: '正直', en: 'honest' }],
      },
      {
        jp: '私と一緒に働く人々は、問題が起きたとき一生懸命努力する。',
        en: 'People who work with me work hard when an issue arises.',
        parts: [
          { t: 'People', r: 'X', n: '主語（名詞）' },
          {
            t: 'who work with me',
            r: 'Y',
            n: '関係詞節（People を後置修飾）',
            inner: [
              { t: 'who', r: 'X', n: '関係代名詞（主語）' },
              { t: 'work', r: 'V', n: '現在形' },
              { t: 'with me', r: 'Z', n: '前置詞句（一緒に）' },
            ],
          },
          { t: 'work', r: 'V', n: '現在形' },
          { t: 'hard', r: 'Z', n: '様態の副詞' },
          {
            t: 'when an issue arises',
            r: 'Z',
            n: '副詞節（内部にも X+V がネスト）',
            inner: [
              { t: 'when', r: 'Z', n: '接続副詞' },
              { t: 'an issue', r: 'X', n: '主語' },
              { t: 'arises', r: 'V', n: '現在形（三単現）' },
            ],
          },
        ],
        vocabHints: [
          { jp: '問題', en: 'issue' },
          { jp: '起きる', en: 'arise' },
        ],
      },
      {
        jp: '音楽を聴きながら勉強した彼女は、試験に合格した。',
        en: 'She studied listening to music and passed the exam.',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'studied', r: 'V', n: '過去形' },
          { t: 'listening to music', r: 'Z', n: '分詞構文（副詞役・同時進行）' },
          { t: 'and passed', r: 'V', n: '等位接続（and）で動詞を並列' },
          { t: 'the exam', r: 'X', n: '目的語' },
        ],
      },
      {
        jp: 'それが本当かどうか私にはわからない。',
        en: "I don't know whether it is true.",
        parts: [
          { t: 'I', r: 'X', n: '主語' },
          { t: "don't know", r: 'V', n: '否定形' },
          { t: 'whether it is true', r: 'X', n: '名詞節（whether節・目的語）' },
        ],
      },
      {
        jp: '試験に合格できるように、彼女は一生懸命勉強した。',
        en: 'She studied hard so that she could pass the exam.',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'studied', r: 'V', n: '過去形' },
          { t: 'hard', r: 'Z', n: '様態の副詞' },
          { t: 'so that she could pass the exam', r: 'Z', n: '副詞節（目的：so that）' },
        ],
      },
      {
        jp: '彼はとても疲れていたので、すぐに眠ってしまった。',
        en: 'He was so tired that he fell asleep immediately.',
        parts: [
          { t: 'He', r: 'X', n: '主語' },
          { t: 'was', r: 'V', n: '過去形' },
          { t: 'so tired', r: 'Y', n: '補語（形容詞句）' },
          { t: 'that he fell asleep immediately', r: 'Z', n: '副詞節（結果：so…that）' },
        ],
      },
      {
        jp: '彼は私より速く走る。',
        en: 'He runs faster than I do.',
        parts: [
          { t: 'He', r: 'X', n: '主語' },
          { t: 'runs', r: 'V', n: '現在形（三単現）' },
          { t: 'faster', r: 'Z', n: '比較級の副詞' },
          { t: 'than I do', r: 'Z', n: '副詞節（比較：than）' },
        ],
      },
    ],
  },
  7: {
    sub: '発展構文',
    desc: '比較・仮定法・文の種類・強調/語順・否定・話法・省略',
    focus: '骨格への7操作（比較・仮定法・疑問の体系・倒置/強調・否定・話法・省略）',
    exercises: [
      {
        jp: '彼女は私より背が高い。',
        en: 'She is taller than I am.',
        operationTag: '比較',
        cefr: 'B1',
        thread: '糸2',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'is', r: 'V', n: '連結動詞' },
          { t: 'taller', r: 'Y', n: '比較級（補語）' },
          { t: 'than I am', r: 'Z', n: '比較の基準（than節）' },
        ],
        nuance: '比較級＋than で程度を基準と照合する操作。糸2（空所＋移動）の再利用ではなく、基準との関係で程度を述べる点が核。',
      },
      {
        jp: 'もし私があなたなら、行くでしょう。',
        en: 'If I were you, I would go.',
        operationTag: '仮定法',
        cefr: 'B1',
        thread: '糸1',
        parts: [
          { t: 'If I were you', r: 'Z', n: '副詞節（仮定法過去・条件）' },
          { t: 'I', r: 'X', n: '主語' },
          { t: 'would go', r: 'V', n: '仮定法の帰結（would + 原形）' },
        ],
        nuance: '時制を1つずらして非現実を標識する仮定法。糸1の応用として、if 省略時は Were I you ... と助動詞前置の倒置にもつながる。',
      },
      {
        jp: '彼女はまだその報告書を提出していません。',
        en: 'She has not submitted the report yet.',
        operationTag: '否定',
        cefr: 'B1',
        thread: '糸1',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'has not submitted', r: 'V', n: '現在完了否定' },
          { t: 'the report', r: 'X', n: '目的語' },
          { t: 'yet', r: 'Z', n: '副詞（まだ）' },
        ],
        nuance: '否定操作の例。助動詞 has + not の否定と yet の組み合わせ。糸1（助動詞操作）の応用。',
      },
      {
        jp: 'もはや彼女はここでは働いていない。',
        en: 'No longer does she work here.',
        operationTag: '倒置/強調',
        cefr: 'B2',
        thread: '糸1',
        parts: [
          { t: 'No longer', r: 'Z', n: '否定副詞句（文頭・倒置のきっかけ）' },
          { t: 'does', r: 'V', n: '助動詞前置（倒置）' },
          { t: 'she', r: 'X', n: '主語' },
          { t: 'work', r: 'V', n: '動詞原形' },
          { t: 'here', r: 'Z', n: '場所の副詞' },
        ],
        nuance: '糸1（助動詞前置）の再利用。否定副詞句を文頭に出した結果、疑問文と同じ助動詞の前置が起きる。',
      },
      {
        jp: '会議に出席したのはすべての人ではない。',
        en: 'Not all of them attended the meeting.',
        operationTag: '否定',
        cefr: 'B2',
        thread: '糸1',
        parts: [
          { t: 'Not all of them', r: 'X', n: '主語（部分否定：not all）' },
          { t: 'attended', r: 'V', n: '過去形' },
          { t: 'the meeting', r: 'X', n: '目的語' },
        ],
        nuance: '部分否定（not all）は「全員が〜とは限らない」。全否定 None of them と範囲の軸で区別する。',
      },
      {
        jp: '彼は疲れていると言った。',
        en: 'He said that he was tired.',
        operationTag: '話法',
        cefr: 'B2',
        thread: '糸1',
        parts: [
          { t: 'He', r: 'X', n: '主語' },
          { t: 'said', r: 'V', n: '過去形' },
          { t: 'that he was tired', r: 'X', n: '名詞節（間接話法・that節）' },
        ],
        nuance: '話法＝発話を埋め込み、人称（I→he）と時制（am→was）をずらす。第10章の that節の再利用。',
      },
      {
        jp: '彼女はピアノが弾けるし、歌も歌える。',
        en: 'She can play the piano and sing as well.',
        operationTag: '省略',
        cefr: 'B2',
        thread: '糸1',
        parts: [
          { t: 'She', r: 'X', n: '主語' },
          { t: 'can play', r: 'V', n: '助動詞 + 動詞' },
          { t: 'the piano', r: 'X', n: '目的語' },
          { t: 'and sing as well', r: 'V', n: '等位接続（sing 前の can を省略）' },
        ],
        nuance: '省略操作：and の後ろで can を繰り返さず、同じ助動詞を受けた動詞原形だけを残す。',
      },
      {
        jp: '会ったのは昨日の彼女だった。',
        en: 'It was her that I met yesterday.',
        operationTag: '倒置/強調',
        cefr: 'B2',
        thread: '糸2',
        parts: [
          { t: 'It', r: 'X', n: '形式主語（強調枠）' },
          { t: 'was', r: 'V', n: '連結動詞' },
          { t: 'her', r: 'X', n: '強調要素' },
          { t: 'that I met yesterday', r: 'Y', n: 'it-cleft の残り節（関係詞節）' },
        ],
        nuance: '糸2（空所＋移動）の再利用。It is ... that の枠に強調要素を移動させただけで、骨格の意味は変わらない。',
      },
    ],
  },
};

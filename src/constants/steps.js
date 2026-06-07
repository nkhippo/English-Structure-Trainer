// Step definitions and seed exercises.
// These serve as reference examples for the AI generation prompt.

/**
 * @typedef {Object} Exercise
 * @property {string} jp
 * @property {string} en
 * @property {{ t: string, r: 'X'|'V'|'Y'|'Z', n: string }[]} parts
 * @property {string} [nuance]  // 日本語訳のニュアンス補足（任意）
 * @property {{ jp: string, en: string }[]} [vocabHints]  // 単語ヒント（任意）
 */

export const STEPS = {
  3: {
    sub: '動詞の変化',
    desc: '時制・相（進行/完了）・態（受動）・助動詞',
    focus: '動詞の活用（現在/過去/完了/進行/受動）と助動詞（can/must/will）',
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
        nuance: 'to read は「これから読む予定・積読」の意。義務ではなく量の話。',
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
          { t: 'Walking home', r: 'Z', n: '分詞構文（副詞役・前置）' },
          { t: 'he', r: 'X', n: '主語' },
          { t: 'listened to', r: 'V', n: '過去形' },
          { t: 'music', r: 'X', n: '目的語' },
        ],
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
          { t: 'that I bought yesterday', r: 'Y', n: '関係詞節（book を後置修飾）' },
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
          { t: 'who speaks English fluently', r: 'Y', n: '関係詞節（man を後置修飾）' },
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
        jp: '彼が嘘をついたという事実は変えられない。',
        en: 'The fact that he lied cannot be changed.',
        parts: [
          { t: 'The fact', r: 'X', n: '主語（名詞）' },
          { t: 'that he lied', r: 'Y', n: '同格節（fact の内容を説明・Y/Clause）' },
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
          { t: 'who work with me', r: 'Y', n: '関係詞節（People を後置修飾）' },
          { t: 'work', r: 'V', n: '現在形' },
          { t: 'hard', r: 'Z', n: '様態の副詞' },
          { t: 'when an issue arises', r: 'Z', n: '副詞節（内部にも X+V がネスト）' },
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
};

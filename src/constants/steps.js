// Step definitions and seed exercises.
// These serve as:
//   1. Fallback when Claude API is unavailable
//   2. Reference examples for the AI generation prompt
//   3. Default first load content

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
        jp: '彼女は読むべき本をたくさん持っている。',
        en: 'She has many books to read.',
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
    ],
  },
};

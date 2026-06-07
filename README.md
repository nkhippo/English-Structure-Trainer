# 英文構造トレーナー

日本語 → 英語の翻訳練習アプリ。  
Claude API により問題生成・採点を行う。

## 機能

- **Step 3〜6** ：動詞の変化 / 準動詞・前置詞句 / 関係詞 / 節と接続・ネスト
- **問題生成** ：Claude API で各ステップの文法ポイントに合った問題を生成
- **まとめて答え合わせ** ：全問を英訳後、Claude API が一括採点・フィードバック
- **X/Y/Z 色分け表示** ：採点後に英文の構造を役割別に色分けして確認
- **できた / 要復習** ：自己採点でステップごとの進捗を管理

## セットアップ

```bash
npm install
npm run dev
```

初回起動時に Anthropic APIキー（`sk-ant-...`）の入力が求められます。  
キーはブラウザの `localStorage` に保存されます（サーバーには送信されません）。

## デプロイ

`main` ブランチへのプッシュで GitHub Pages に自動デプロイされます。  
GitHub リポジトリの **Settings > Pages > Source** を `GitHub Actions` に設定してください。

デプロイ先: `https://nkhippo.github.io/English-Structure-Trainer/`

## ファイル構成

```
src/
├── App.jsx                   # メインコンポーネント・状態管理
├── main.jsx                  # Reactエントリポイント
├── constants/
│   ├── roles.js              # X/Y/Z 役割の色定義
│   └── steps.js              # ステップ定義・シード問題（静的フォールバック）
├── api/
│   └── claude.js             # Claude API クライアント（generateExercises / checkAnswers）
├── prompts/
│   └── index.js              # プロンプトテンプレート
└── components/
    ├── ApiKeyInput.jsx        # APIキー入力画面
    ├── StepTabs.jsx           # ステップ切り替えタブ
    └── QuestionCard.jsx       # 問題カード（入力・採点結果・構造表示）
```

## 使用モデル

`claude-haiku-4-5-20251001`（高速・低コスト）  
変更する場合は `src/api/claude.js` の `MODEL` 定数を修正してください。

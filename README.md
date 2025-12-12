# 📝 AI記事要約アプリ

Next.js (App Router) と Google Gemini API を使用した、記事を自動要約するWebアプリです。

## 🚀 機能

- 📰 URLを入力するだけで記事を自動要約
- 🤖 Google Gemini API (gemini-1.5-flash) による高精度な要約
- 📱 スマホ対応のレスポンシブデザイン
- 🔗 URLクエリパラメータによる直接アクセス対応
- ⚡ スクレイピングによる本文自動抽出
- 💬 Markdown形式での見やすい表示

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Google Gemini API (@google/generative-ai)
- **スクレイピング**: 
  - cheerio
  - @mozilla/readability
  - jsdom
- **Markdown表示**: react-markdown

## 📦 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、Gemini APIキーを設定します：

```
GEMINI_API_KEY=your_api_key_here
```

Gemini APIキーは [Google AI Studio](https://makersuite.google.com/app/apikey) で取得できます。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 📖 使い方

### 通常の使い方

1. トップページのURL入力欄に記事のURLを貼り付けます
2. 「要約する」ボタンをクリックします
3. AIが記事を読み込んで、3つの要点で要約します

### URLクエリパラメータでの使い方

URLに直接クエリパラメータを付けてアクセスすることもできます：

```
http://localhost:3000/?url=https://example.com/article
```

## 🏗️ プロジェクト構成

```
ai-summary/
├── app/
│   ├── api/
│   │   └── summarize/
│   │       └── route.ts          # 要約APIエンドポイント
│   ├── components/
│   │   └── SummaryPage.tsx       # メインページコンポーネント
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # レイアウト
│   └── page.tsx                  # ホームページ
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

## 🔧 API エンドポイント

### POST `/api/summarize`

記事を要約するAPIエンドポイント。

**リクエスト:**
```json
{
  "url": "https://example.com/article"
}
```

**レスポンス (成功時):**
```json
{
  "success": true,
  "title": "記事のタイトル",
  "summary": "1. 第一の要点\n2. 第二の要点\n3. 第三の要点",
  "url": "https://example.com/article"
}
```

**レスポンス (エラー時):**
```json
{
  "error": "エラーメッセージ"
}
```

## ⚠️ 注意事項

- Gemini API には利用制限があります
- 一部のWebサイトはスクレイピングをブロックしている場合があります
- JavaScriptで動的に生成されるコンテンツは抽出できない場合があります

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 貢献

プルリクエストは大歓迎です！バグ報告や機能提案は Issue でお願いします。


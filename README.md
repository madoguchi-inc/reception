# MadoReception - 自社オリジナル受付システム

RECEPTIONISTと同等以上の機能を持つ、自社製の受付管理システムです。
iPadなどのタブレットブラウザで動作し、Google Chat通知・Google Calendar連携に対応しています。

## 主な機能

### 受付タブレット（来訪者向け）
- タッチ操作に最適化された美しいUI
- 来訪者情報入力 → 担当者選択 → チェックイン
- QRコードスキャンによるワンタッチ受付
- 退館手続き（チェックアウト）

### 管理ダッシュボード（社員向け）
- 来訪予約の作成・管理
- 社員マスター管理（部署・役職）
- 会議室管理
- 来訪履歴・統計レポート・CSV出力
- 受付画面カスタマイズ

### 外部連携
- **Google Chat**: 来訪時に担当者へDM通知（応答ボタン付き）
- **Google Calendar**: 来訪予定の同期・会議室予約
- **メール**: QRコード付き招待メール自動送信

## 技術スタック

- Next.js 14 (App Router) / TypeScript
- Tailwind CSS + lucide-react
- PostgreSQL + Prisma ORM
- NextAuth.js (Google OAuth)
- Vercel + Supabase（推奨）

## セットアップ

### 1. インストール

```bash
npm install
cp .env.example .env
```

### 2. データベース

[Supabase](https://supabase.com) でプロジェクトを作成し、DATABASE_URLを `.env` に設定。

```bash
npx prisma migrate dev --name init
```

### 3. Google API設定

#### Google OAuth（管理画面ログイン用）
1. [Google Cloud Console](https://console.cloud.google.com/) でOAuth 2.0 クライアントIDを作成
2. リダイレクトURI: `http://localhost:3000/api/auth/callback/google`
3. Client IDとSecretを `.env` に設定

#### Google Chat（通知用）
1. Google Chat API を有効化 → Chat Bot を作成しBot Tokenを取得
2. または対象スペースのWebhook URLを取得

#### Google Calendar（カレンダー連携用）
1. Google Calendar API を有効化
2. OAuth スコープに `https://www.googleapis.com/auth/calendar` を追加

### 4. 起動

```bash
npm run dev
```

| URL | 用途 |
|-----|------|
| http://localhost:3000/reception | 受付画面（タブレット） |
| http://localhost:3000/admin | 管理画面 |

## デプロイ

### Vercel

```bash
npx vercel
```

環境変数を Vercel ダッシュボードで設定してください。

## ディレクトリ構成

```
src/
├── app/
│   ├── reception/          # 受付タブレットUI
│   ├── admin/              # 管理ダッシュボード
│   └── api/                # APIエンドポイント
└── lib/                    # ユーティリティ・外部連携
prisma/
└── schema.prisma           # DBスキーマ
```

## ライセンス

Private - madoguchi.inc

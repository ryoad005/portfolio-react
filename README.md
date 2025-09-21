## 仕様概要
１.画面概要
本アプリは、取引一覧画面を React + TypeScript + MUI (Material UI) で実装したサンプルです。
データの参照・編集・追加・削除に加えて、複数行選択 & CSV 出力 に対応しています。
「TypeScript を使った型安全なコーディング」「Next.js + MUI の UI 実装経験」をアピールできることを目的としています。

２.使用技術
　・フレームワーク: Next.js (React, TypeScript)
　・UI ライブラリ: MUI v5 (@mui/material, @mui/x-data-grid)
　・日付入力: MUI DatePicker
　・データ管理: フロントエンド内（モックデータ、useState 利用）
　・CSV 出力: ブラウザの Blob API を利用

３. 実装機能
【一覧表示】
　・MUI DataGrid を用いて取引データを一覧表示
　・列構成:
　　・取引日（カレンダー入力可）
　　・取引先（文字入力）
　　・商品種別（コンボボックス）
　　・商品名（選択肢連動型コンボボックス）
　　・数量・単価（数値入力）
　　・金額（自動計算）
【CRUD 操作】
　・新規追加: 「追加」ボタンで空行を追加
　・編集: 一覧セルを直接編集し、「保存」でまとめて確定
　・削除: 選択行を削除
【複数行選択】
　・DataGrid のチェックボックスで複数行を選択可能
【CSV 出力】
　・「CSV出力」ボタンで CSV ファイルをダウンロード
　・選択行があれば選択行のみ、なければ全件出力
　・出力形式: UTF-8 CSV
　・ファイル名例: trades_20250921.csv

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

"use client";

import { Container, Typography, Box, List, ListItem, ListItemText } from "@mui/material";

export default function Home() {
  return (
    <Box sx={{ p: 3 }}>
      {/* 1. 画面概要 */}
      <Typography variant="h6" gutterBottom>
        1. 画面概要
      </Typography>
      <ul style={{ marginTop: 0, marginBottom: '16px' }}>
        <li>本アプリは、取引一覧画面を React + TypeScript + MUI (Material UI) で実装したサンプルです。</li>
        <li>データの参照・編集・追加・削除に加えて、複数行選択 & CSV 出力 に対応しています。</li>
        <li>「TypeScript を使った型安全なコーディング」「Next.js + MUI の UI 実装経験」をアピールできることを目的としています。</li>
      </ul>

      {/* 2. 使用技術 */}
      <Typography variant="h6" gutterBottom>
        2. 使用技術
      </Typography>
      <ul style={{ marginTop: 0, marginBottom: '16px' }}>
        <li>フレームワーク: Next.js (React, TypeScript)</li>
        <li>UI ライブラリ: MUI v5 (@mui/material, @mui/x-data-grid)</li>
        <li>日付入力: MUI DatePicker</li>
        <li>データ管理: フロントエンド内（モックデータ、useState 利用）</li>
        <li>CSV 出力: ブラウザの Blob API を利用</li>
      </ul>

      {/* 3. 実装機能 */}
      <Typography variant="h6" gutterBottom>
        3. 実装機能
      </Typography>
      <ul style={{ marginTop: 0 }}>
        <li>一覧表示（MUI DataGrid で取引データを表示）</li>
        <li>CRUD 操作（新規追加・編集・削除）</li>
        <li>複数行選択（チェックボックス）</li>
        <li>CSV 出力（全件または選択行のみを UTF-8 CSV 形式で出力）</li>
      </ul>
    </Box>
  );
}

"use client";

import { Box, Typography } from "@mui/material";

export default function TradeDetailPage({ params }: { params: { id: string } }) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">取引詳細</Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        ID: {params.id}
      </Typography>
      {/* 実データ取得は必要になったら追加 */}
    </Box>
  );
}
